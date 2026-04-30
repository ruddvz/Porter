import { Bebas_Neue, DM_Sans, JetBrains_Mono } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${dmSans.variable} ${bebas.variable} ${jetbrains.variable} font-sans`}>{children}</div>;
}
