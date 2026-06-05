import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { UnhandledRejectionToaster } from "@/components/system/UnhandledRejectionToaster";

export const metadata: Metadata = {
  title: { default: "Porter", template: "%s · Porter" },
  description: "WhatsApp-first order management for local stores in India.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Porter",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8ec" },
    { media: "(prefers-color-scheme: dark)", color: "#fff8ec" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Porter" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" sizes="180x180" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen font-sans antialiased text-porter-text-primary bg-porter-bg-base">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[300] -translate-y-24 rounded-pill bg-porter-green-500 px-4 py-2.5 text-sm font-semibold text-white opacity-0 transition focus:translate-y-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-porter-green-500"
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
