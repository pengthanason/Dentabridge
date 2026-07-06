import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DentaBridge",
  description: "B2B Compliance-Native Marketplace สำหรับทันตกรรม",
};

export const viewport: Viewport = {
  themeColor: "#0B3A44",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
