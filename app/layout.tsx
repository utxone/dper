import type { Metadata, Viewport } from "next";
import "./globals.css";
import { inter } from "@/lib/fonts";
import Header from "@/components/header";
import { WalletConfig } from "@/lib/use-wallet";

export const metadata: Metadata = {
  title: "{op:depr}",
  description: "Airdrop for brc-20 deployers",
  manifest: "/manifest.json",
  metadataBase: new URL('https://depr.xyz'),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "{op:depr}",
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "{op:depr}",
    title: {
      default: "depr",
      template: "",
    },
    description: "Airdrop for brc-20 deployers",
  },
  twitter: {
    card: "summary",
    title: {
      default: "{op:depr}",
      template: "",
    },
    description: "Airdrop for brc-20 deployers",
  },
};

export const viewport: Viewport = {
  themeColor: "#000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletConfig>
          <Header></Header>
          {children}
        </WalletConfig>
      </body>
    </html>
  );
}
