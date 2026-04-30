import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Porter — WhatsApp orders for local shops",
  description: "WhatsApp-first order management for dark stores and kirana in India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="grain min-h-screen antialiased">{children}</body>
    </html>
  );
}
