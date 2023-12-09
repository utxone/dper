import type { Metadata } from "next";
import "./globals.css";
import { lora, zilla } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "{ op: depr }",
  description: "Airdrop for deployers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={zilla.className}>
        {children}
      </body>
    </html>
  );
}
