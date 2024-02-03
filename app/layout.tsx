import type { Metadata } from "next";
import "./globals.css";
import { kantumruy } from "@/lib/fonts";
import Header from "@/components/header";
import { WalletConfig } from "@/lib/use-wallet";

export const metadata: Metadata = {
  title: "{ op: depr }",
  description: "Airdrop for brc-20 deployers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={kantumruy.className}>
        <WalletConfig>
          <Header></Header>
          {children}
        </WalletConfig>
      </body>
    </html>
  );
}
