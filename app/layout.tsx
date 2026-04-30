import type { Metadata, Viewport } from "next";
import { DM_Sans, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { withBasePath } from "@/lib/base-path";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Porter",
  description: "WhatsApp-first order management for local shops",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Porter",
  },
  icons: {
    icon: [{ url: `${withBasePath("/favicon.ico")}`, sizes: "any" }],
    apple: `${withBasePath("/apple-touch-icon.png")}`,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0F0D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ToastProvider>
          <PwaRegister />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
