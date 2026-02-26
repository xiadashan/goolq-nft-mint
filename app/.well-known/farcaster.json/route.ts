// app/.well-known/farcaster.json/route.ts
// ═══════════════════════════════════════════════════════════════
//  Farcaster Frame Manifest
//  让 Warpcast / Base App 识别并展示你的 Mini App
//
//  部署后需要运行: npx @coinbase/onchainkit manifest
//  用 Farcaster custody wallet 签名，然后替换下面的 placeholder
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";

export async function GET() {
  const URL  = process.env.NEXT_PUBLIC_URL || "https://goolq-mint.vercel.app";
  const NAME = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "goolq NFT Mint";

  return NextResponse.json({
    // ★ 部署后用 `npx @coinbase/onchainkit manifest` 生成真实签名
    accountAssociation: {
      header:    "placeholder-run-npx-onchainkit-manifest",
      payload:   "placeholder",
      signature: "placeholder",
    },
    frame: {
      version: "1",
      name: NAME,
      iconUrl: `${URL}/icon.png`,
      homeUrl: URL,
      imageUrl: `${URL}/hero.png`,
      splashImageUrl: `${URL}/splash.png`,
      splashBackgroundColor: "#06070A",
      webhookUrl: `${URL}/api/notification`,
      subtitle: "Free mint NFT on Base",
      description:
        "Mint a free NFT on Base with 0 gas. Built by goolq.base.eth · Builder Code: bc_291jsyn1 · ERC-8021 attribution.",
      primaryCategory: "utility",
      tags: ["nft", "mint", "free", "base", "builder"],
      // ★ base.dev 验证后取消注释并填入地址
      // baseBuilder: {
      //   allowedAddresses: ["0xYourVerifiedAddress"],
      // },
    },
  });
}
