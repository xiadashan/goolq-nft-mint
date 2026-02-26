// app/layout.tsx
import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

const URL  = process.env.NEXT_PUBLIC_URL || "https://goolq-mint.vercel.app";
const NAME = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "goolq NFT Mint";

// ═══════════════════════════════════════════════════════════════
//  Farcaster Frame Metadata
//  这段 JSON 让 Warpcast / Base App 把你的链接渲染成 Mini App
// ═══════════════════════════════════════════════════════════════
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: NAME,
    description: "Free mint NFT on Base — 0 Gas · Built by goolq.base.eth",
    openGraph: {
      title: NAME,
      description: "Free mint NFT on Base · 0 Gas Paymaster · ERC-8021 Builder Code",
      images: [`${URL}/hero.png`],
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: `${URL}/hero.png`,
        button: {
          title: "Mint Free NFT ◆",
          action: {
            type: "launch_frame",
            name: NAME,
            url: URL,
            splashImageUrl: `${URL}/splash.png`,
            splashBackgroundColor: "#06070A",
          },
        },
      }),
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
