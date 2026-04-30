import { Bebas_Neue, DM_Sans } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${dmSans.variable} ${bebas.variable} font-sans`}>{children}</div>;
}
