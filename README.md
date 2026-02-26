# goolq NFT Mint — Base Mini App

> **Free Mint NFT on Base · 0 Gas · ERC-8021 Builder 归因**
> goolq.base.eth · Builder Code: `bc_291jsyn1`

---

## 项目结构

```
goolq-mint/
├── app/
│   ├── layout.tsx                          ← 根布局 + fc:frame metadata
│   ├── page.tsx                            ← 主页 + MiniKit 初始化
│   ├── providers.tsx                       ← MiniKitProvider (wagmi/paymaster 自动配置)
│   ├── globals.css                         ← 样式 + 动画
│   ├── .well-known/farcaster.json/route.ts ← Farcaster manifest (必需)
│   └── api/notification/route.ts           ← Webhook 端点
├── components/
│   └── NftMint.tsx                         ← ★ 核心 Mint 组件
├── lib/
│   ├── abi.ts                              ← safeMint(address) ABI
│   └── builder-code.ts                     ← ★ ERC-8021 suffix 生成器
├── public/                                 ← 放 icon.png / hero.png / splash.png
├── .env.local.example                      ← 环境变量模板
└── package.json
```

---

## 一、ERC-8021 Builder Code Suffix 详解

### suffix 是怎么嵌入交易的？

```
最终交易 calldata:

┌──────────────────────────────────────────┐
│ safeMint(address) 编码 (68 bytes)         │  ← EVM 执行这部分
├──────────────────────────────────────────┤
│ ERC-8021 Data Suffix (29 bytes)          │  ← EVM 忽略，链下索引器提取
└──────────────────────────────────────────┘

Suffix 内部结构 (从末尾向前解析):

 62635f3239316a73796e31  0b  00  80218021802180218021802180218021
 ├── "bc_291jsyn1" ────┤  │   │  ├── ercMarker (16 bytes) ──────┤
      (ASCII hex)        │   │
                    codesLen │
                  (11 bytes) │
                        schemaId=0
```

### 代码实现 (lib/builder-code.ts)

```typescript
// 核心逻辑: 3 步生成 suffix
function buildERC8021Suffix(code: string): `0x${string}` {
  // 1. "bc_291jsyn1" → ASCII hex "62635f3239316a73796e31"
  const codeHex = Array.from(code)
    .map(ch => ch.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");

  // 2. codesLength = 11 → "0b"
  const codesLen = (codeHex.length / 2).toString(16).padStart(2, "0");

  // 3. 拼装: codes + codesLen + "00" + ercMarker
  return `0x${codeHex}${codesLen}0080218021802180218021802180218021`;
}
```

### 在 Mint 交易中使用 (components/NftMint.tsx)

```typescript
const mintCalls = () => {
  // 1. 编码 safeMint(address)
  const calldata = encodeFunctionData({
    abi: NFT_ABI,
    functionName: "safeMint",
    args: [userAddress],
  });

  // 2. ★ 追加 ERC-8021 suffix 到 calldata 末尾
  const calldataWithSuffix = calldata + DATA_SUFFIX.slice(2);
  //                                    ^^^^^^^^^^^^^^^^
  //                                    去掉 suffix 的 "0x" 前缀再拼接

  return [{ to: NFT_CONTRACT, data: calldataWithSuffix, value: 0n }];
};
```

### 验证方法

Mint 成功后在 Basescan 查看交易 Input Data:
1. 末尾 32 hex chars = `80218021802180218021802180218021` ← ercMarker ✓
2. 往前 2 chars = `00` ← schemaId ✓
3. 再往前 2 chars = `0b` ← codesLen = 11 ✓
4. 再往前 22 chars = `62635f3239316a73796e31` ← "bc_291jsyn1" ✓

---

## 二、Vercel 部署步骤

### Step 1: 准备 Key

| Key | 获取地址 |
|-----|---------|
| CDP Client API Key | https://portal.cdp.coinbase.com → API Keys |
| Paymaster URL | CDP Portal → Paymaster → Create → **Base Mainnet** |
| Builder Code | https://base.dev → Settings → Builder Code |

### Step 2: 本地测试

```bash
cd goolq-mint
npm install
cp .env.local.example .env.local
# 编辑 .env.local 填入真实 key
npm run dev
# → http://localhost:3000
```

### Step 3: 推送 + 部署

```bash
# 推到 GitHub
git init && git add -A && git commit -m "init"
gh repo create goolq-nft-mint --public --push

# 去 vercel.com:
# 1. Import Project → 选 goolq-nft-mint 仓库
# 2. Framework: Next.js (自动识别)
# 3. Environment Variables → 把 .env.local 的变量全部加进去
# 4. Deploy
```

或用 CLI:
```bash
npm i -g vercel
vercel          # 首次部署
vercel --prod   # 生产部署
```

### Step 4: 签名 Farcaster Manifest

```bash
npx @coinbase/onchainkit manifest
# 连接 Farcaster custody wallet (Warpcast → Settings → Advanced → Recovery phrase)
# 输入 Vercel URL
# 自动生成签名 → 更新 .well-known/farcaster.json/route.ts 中的 accountAssociation
```

重新部署。

### Step 5: base.dev 验证

1. 打开 https://base.dev
2. 导入 App → 填入 Vercel URL
3. 连接你的 Farcaster custody wallet
4. 在 manifest 中取消注释并填入 `baseBuilder`:

```json
"baseBuilder": {
  "allowedAddresses": ["0x你的验证地址"]
}
```

5. 重新部署 → base.dev 完成验证 → 提交 App Store

---

## 三、文件作用说明

| 文件 | 作用 | 关键点 |
|------|------|--------|
| `lib/builder-code.ts` | 生成 ERC-8021 suffix | 每笔 tx 自动归因到 bc_291jsyn1 |
| `lib/abi.ts` | NFT 合约 ABI | 只有 safeMint(address) |
| `app/providers.tsx` | MiniKitProvider | 自动配 wagmi + paymaster |
| `components/NftMint.tsx` | Mint UI + 交易逻辑 | isSponsored=true → 0 Gas |
| `app/page.tsx` | 入口 + MiniKit init | setFrameReady() 必须调用 |
| `app/layout.tsx` | fc:frame metadata | Farcaster 识别为 Frame |
| `.well-known/farcaster.json` | Manifest | Base App Store 必需 |

---

## 四、归因链路

```
用户在 Farcaster/Base App 打开 → 点击 Mint
        ↓
Transaction 组件 → isSponsored=true → Paymaster 代付 Gas
        ↓
calldata = safeMint(address) + ERC-8021 suffix (bc_291jsyn1)
        ↓
交易上链 → EVM 执行 safeMint，忽略 suffix
        ↓
Base 链下索引器提取 suffix → 归因到 Builder Code bc_291jsyn1
        ↓
base.dev 仪表盘显示交易量 → App Leaderboard 排名
        ↓
Builder Rewards 分配 + Base 生态贡献积累
```

---

## 五、注意事项

1. **Paymaster 额度**: CDP 免费 Paymaster 有限额，高流量前检查配额
2. **Builder Code 归因目前仅支持 AA 交易**, EOA 即将支持。suffix 数据照样记录，激活后自动计入
3. **图片**: 在 `public/` 放三张图:
   - `icon.png` (200×200) — 应用图标
   - `hero.png` (1200×630) — Frame 封面
   - `splash.png` (200×200) — 启动图
4. **Base Batches #003**: 在申请表中注明你的 Builder Code 和 App URL，附上 Basescan 交易截图证明 ERC-8021 suffix 嵌入正确
