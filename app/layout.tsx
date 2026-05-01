import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Porter — WhatsApp orders for local shops",
  description: "WhatsApp-first order management for dark stores and kirana in India.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Porter" },
};

export const viewport: Viewport = {
  themeColor: "#1A1A2E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="grain min-h-screen antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
