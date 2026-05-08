import type { Metadata, Viewport } from "next";
import { DM_Mono, Noto_Naskh_Arabic } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { GlobalErrorToasts } from "@/components/GlobalErrorToasts";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-display",
});

const notoArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: { default: "Porter", template: "%s · Porter" },
  description: "WhatsApp dark store management platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Porter",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#25D366",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${dmMono.variable} ${notoArabic.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#25D366" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Porter" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Porter" />
      </head>
      <body className="overflow-x-hidden bg-[--bg-base] text-[--text-primary] antialiased">
        <a
          href="#main-content"
          className="absolute left-[-10000px] top-auto z-[300] overflow-hidden focus:left-4 focus:top-4 focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-[var(--radius-sm)] focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-black focus:outline-none focus:ring-2 focus:ring-[var(--accent-dim)]"
        >
          Skip to content
        </a>
        <ToastProvider>
          <GlobalErrorToasts />
          <div id="main-content" role="main" className="min-h-0">
            {children}
          </div>
        </ToastProvider>
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { scope: '/' })
              .then(function (r) { console.log('[SW] registered', r.scope); })
              .catch(function (e) { console.error('[SW] registration failed', e); });
          }
        `}</Script>
      </body>
    </html>
  );
}
