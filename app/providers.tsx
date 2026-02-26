// app/providers.tsx
"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import "@coinbase/onchainkit/styles.css";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: "dark" as const,
          theme: "base" as const,
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "goolq NFT Mint",
          logo: process.env.NEXT_PUBLIC_ICON_URL,
        },
        // ★ Paymaster — 让所有 <Transaction isSponsored> 走这个 URL
        paymaster: process.env.NEXT_PUBLIC_PAYMASTER_URL,
      }}
    >
      {children}
    </MiniKitProvider>
  );
}
