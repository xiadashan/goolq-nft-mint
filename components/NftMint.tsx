// components/NftMint.tsx
"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  TransactionSponsor,
} from "@coinbase/onchainkit/transaction";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { Avatar, Name, Identity, Badge } from "@coinbase/onchainkit/identity";
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { encodeFunctionData } from "viem";
import { NFT_ABI } from "@/lib/abi";
import { DATA_SUFFIX, NFT_CONTRACT, BUILDER_CODE } from "@/lib/builder-code";

export function NftMint() {
  const { address, isConnected } = useAccount();
  const [minted, setMinted] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  // ═══════════════════════════════════════════════════════════
  //  构建 Mint 交易 — calldata + ERC-8021 suffix
  // ═══════════════════════════════════════════════════════════
  //
  //  safeMint(address to)  →  编码后的 calldata
  //  + DATA_SUFFIX          →  ERC-8021 builder code 归因
  //
  //  EVM 会正常执行 safeMint，忽略末尾多余的 suffix 数据。
  //  链下索引器从末尾提取 suffix 完成 builder 归因。
  // ═══════════════════════════════════════════════════════════
  const mintCalls = useCallback(async () => {
    if (!address) return [];

    // 1. 编码 safeMint(address to) 调用
    const calldata = encodeFunctionData({
      abi: NFT_ABI,
      functionName: "safeMint",
      args: [address],
    });

    // 2. ★★★ 在 calldata 末尾追加 ERC-8021 Builder Code suffix ★★★
    //    calldata = "0x..." (safeMint 编码)
    //    suffix   = "0x62635f3239316a73796e310b0080218021..."
    //    拼接时去掉 suffix 的 "0x" 前缀
    const calldataWithSuffix = (calldata + DATA_SUFFIX.slice(2)) as `0x${string}`;

    return [
      {
        to: NFT_CONTRACT,
        data: calldataWithSuffix,
        value: BigInt(0),
      },
    ];
  }, [address]);

  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log("[Mint]", status.statusName, status.statusData);
    if (status.statusName === "success") {
      setMinted(true);
      // 从 statusData 中拿 txHash（如果有）
      const hash = (status.statusData as any)?.transactionReceipts?.[0]?.transactionHash;
      if (hash) setTxHash(hash);
    }
  }, []);

  // ── UI ──────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[420px] mx-auto px-5">

      {/* ── NFT 卡片 ── */}
      <div className="relative mb-8 anim-reveal">
        {/* 光晕 */}
        <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-[#0052FF]/20 via-[#7C3AED]/10 to-[#22D3EE]/15 blur-2xl anim-glow pointer-events-none" />

        <div className="relative rounded-[28px] overflow-hidden border border-white/[0.06] bg-[var(--card)] anim-drift">
          {/* 渐变背景 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,82,255,0.08)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(124,58,237,0.06)_0%,_transparent_60%)]" />

          {/* 内容 */}
          <div className="relative flex flex-col items-center py-10 px-6">
            {/* 旋转装饰环 */}
            <div className="relative w-28 h-28 mb-5">
              <div className="absolute inset-0 rounded-full border border-dashed border-white/[0.08] anim-spin-slow" />
              <div className="absolute inset-2 rounded-full border border-white/[0.04]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl">◆</span>
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight">goolq Collection</h2>
            <p className="text-sm text-white/30 mt-1">Base Mainnet · Free Mint</p>

            {/* 合约地址 */}
            <div className="mt-4 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <code className="mono text-[11px] text-white/25 select-all">
                {NFT_CONTRACT}
              </code>
            </div>

            {/* 标签 */}
            <div className="flex gap-2 mt-4">
              <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                0 GAS
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ERC-721
              </span>
              {minted && (
                <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  ✓ MINTED
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Builder 身份卡 ── */}
      <div className="mb-6 p-4 rounded-2xl bg-[var(--card)] border border-white/[0.05] anim-reveal-d1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#7C3AED] flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
              G
            </div>
            <div>
              <p className="text-sm font-semibold">goolq.base.eth</p>
              <p className="text-[11px] text-white/30">Base Builder</p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <code className="mono text-[11px] text-[#22D3EE]">{BUILDER_CODE}</code>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <span className="text-xs">⛓</span>
          <p className="text-[11px] text-white/25 leading-relaxed">
            ERC-8021 归因已嵌入每笔交易 · Builder Rewards 自动累积
          </p>
        </div>
      </div>

      {/* ── 钱包连接 / Mint 按钮 ── */}
      <div className="anim-reveal-d2">
        {!isConnected ? (
          <Wallet>
            <ConnectWallet className="!w-full !rounded-2xl !py-4 !text-[15px] !font-semibold">
              <Avatar className="h-5 w-5" />
              <Name />
            </ConnectWallet>
          </Wallet>
        ) : (
          <div className="space-y-3">
            {/* 用户身份 */}
            <div className="flex items-center justify-center gap-2 py-2">
              <Identity address={address} chain={undefined} schemaId={undefined}>
                <Avatar className="h-5 w-5" />
                <Name className="text-sm text-white/50" />
                <Badge />
              </Identity>
            </div>

            {/* ★★★ MINT 按钮 ★★★ */}
            {!minted ? (
              <Transaction
                calls={mintCalls}
                isSponsored={true}
                onStatus={handleStatus}
              >
                <TransactionButton
                  text="◆  Mint Free NFT"
                  className="!w-full !rounded-2xl !py-4 !text-[15px] !font-bold
                    !bg-gradient-to-r !from-[#0052FF] !to-[#7C3AED]
                    hover:!brightness-110 !transition-all !duration-300
                    !shadow-lg !shadow-blue-600/25"
                />
                <TransactionSponsor />
                <TransactionStatus>
                  <TransactionStatusLabel />
                  <TransactionStatusAction />
                </TransactionStatus>
              </Transaction>
            ) : (
              /* 成功态 */
              <div className="text-center p-5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 anim-reveal">
                <p className="text-lg font-bold text-emerald-400">🎉 Mint 成功！</p>
                <p className="text-sm text-emerald-400/50 mt-1">NFT 已发送到你的钱包 · 0 Gas</p>
                {txHash && (
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs text-blue-400/70 hover:text-blue-400 underline underline-offset-2 mono"
                  >
                    查看交易 ↗
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 底部 ── */}
      <footer className="mt-10 text-center space-y-2 anim-reveal-d4">
        <div className="flex items-center justify-center gap-3 text-[11px] text-white/15">
          <span>Base Mainnet</span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span>Paymaster Sponsored</span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span>ERC-8021</span>
        </div>
        <p className="text-[10px] text-white/10">
          Built with OnchainKit + MiniKit by goolq.base.eth
        </p>
      </footer>
    </div>
  );
}
