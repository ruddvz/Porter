import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  manifest: "/admin-manifest.json",
  appleWebApp: { capable: true, title: "Porter Admin" },
};

export const viewport: Viewport = {
  themeColor: "#C0392B",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
