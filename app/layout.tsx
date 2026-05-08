import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { UnhandledRejectionToaster } from "@/components/system/UnhandledRejectionToaster";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { DM_Mono } from "next/font/google";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: { default: "Porter", template: "%s · Porter" },
  description: "WhatsApp-first order management for dark stores and kirana in India.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Porter",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#25D366",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${dmMono.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Porter" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${GeistSans.className} grain min-h-screen font-sans antialiased text-porter-text-primary`}>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[300] -translate-y-24 rounded-lg bg-porter-green-500 px-3 py-2 text-sm font-semibold text-porter-bg-base opacity-0 transition focus:translate-y-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-porter-green-400"
        >
          Skip to content
        </a>
        <ToastProvider>
          <UnhandledRejectionToaster />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
