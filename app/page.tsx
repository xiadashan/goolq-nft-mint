// app/page.tsx
"use client";

import { useEffect, useCallback, useState } from "react";
import { useMiniKit, useAddFrame } from "@coinbase/onchainkit/minikit";
import { NftMint } from "@/components/NftMint";

export default function Home() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const addFrame = useAddFrame();
  const [saved, setSaved] = useState(false);

  // 通知 Farcaster 客户端: Mini App 已就绪
  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [setFrameReady, isFrameReady]);

  const handleSave = useCallback(async () => {
    const result = await addFrame();
    if (result) setSaved(true);
  }, [addFrame]);

  return (
    <main
      className="min-h-[100dvh] flex flex-col"
      style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 12px)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)",
      }}
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-4 anim-reveal">
        <div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            goolq NFT
          </h1>
          <p className="text-[11px] text-white/20 mt-0.5">Free Mint · Base · 0 Gas</p>
        </div>

        {/* Farcaster 用户头像 (在 Frame 环境中显示) */}
        {context?.user && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
            {context.user.pfpUrl && (
              <img src={context.user.pfpUrl} alt="" className="w-5 h-5 rounded-full" />
            )}
            <span className="text-xs text-white/40">
              {context.user.displayName || `FID:${context.user.fid}`}
            </span>
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <div className="flex-1 flex items-center justify-center py-4">
        <NftMint />
      </div>

      {/* ── Save Frame (仅 Farcaster 环境) ── */}
      {context && !saved && (
        <div className="px-5 pb-3 anim-reveal-d4">
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]
              text-sm text-white/40 hover:bg-white/[0.07] hover:text-white/60 transition-all"
          >
            ＋ 保存到 Farcaster
          </button>
        </div>
      )}
    </main>
  );
}
