// lib/builder-code.ts
// ═══════════════════════════════════════════════════════════════
//  ERC-8021 Data Suffix 生成器
// ═══════════════════════════════════════════════════════════════
//
//  calldata 末尾追加的 suffix 结构 (从后往前解析):
//
//  ┌─────────────────────┬───────────┬──────────┬─────────────────────────────────┐
//  │ codes (变长 ASCII)   │ codesLen  │ schemaId │          ercMarker              │
//  │ "bc_291jsyn1"       │  1 byte   │  1 byte  │         16 bytes                │
//  └─────────────────────┴───────────┴──────────┴─────────────────────────────────┘
//
//  ercMarker 固定值: 0x80218021802180218021802180218021
//  schemaId = 0x00 (Schema 0: Canonical Code Registry)
//  codes = ASCII 编码的 builder code
//  codesLen = codes 字段的字节长度
//
//  智能合约会忽略 calldata 末尾多余的数据，所以不影响执行。
//  链下索引器从末尾提取 suffix 进行归因。
// ═══════════════════════════════════════════════════════════════

const ERC_MARKER = "80218021802180218021802180218021"; // 16 bytes, 固定
const SCHEMA_ID = "00"; // Schema 0

/**
 * 把 Builder Code 字符串转成 ERC-8021 data suffix (hex)
 *
 * 示例:
 *   buildERC8021Suffix("bc_291jsyn1")
 *   → "0x62635f3239316a73796e310b0080218021802180218021802180218021"
 *
 *   拆解:
 *   62635f3239316a73796e31  ← "bc_291jsyn1" ASCII
 *   0b                      ← codesLen = 11
 *   00                      ← schemaId = 0
 *   80218021802180218021802180218021  ← ercMarker
 */
export function buildERC8021Suffix(code: string): `0x${string}` {
  // 1. builder code → ASCII hex
  const codeHex = Array.from(code)
    .map((ch) => ch.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");

  // 2. codesLength (1 byte)
  const byteLen = codeHex.length / 2;
  if (byteLen > 255) throw new Error("Builder code too long");
  const codesLen = byteLen.toString(16).padStart(2, "0");

  // 3. 拼装: codes + codesLen + schemaId + ercMarker
  return `0x${codeHex}${codesLen}${SCHEMA_ID}${ERC_MARKER}` as `0x${string}`;
}

// ── 预计算常量 ──────────────────────────────────────────────
export const BUILDER_CODE = process.env.NEXT_PUBLIC_BUILDER_CODE || "bc_291jsyn1";
export const DATA_SUFFIX = buildERC8021Suffix(BUILDER_CODE);
export const NFT_CONTRACT = (process.env.NEXT_PUBLIC_NFT_CONTRACT ||
  "0xc443595cb9e568ea6ee46e5d70830dd6b18a6385") as `0x${string}`;
