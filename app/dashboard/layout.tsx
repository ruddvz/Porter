import { Bebas_Neue, DM_Sans } from "next/font/google";
import Sidebar from "@/components/dashboard/Sidebar";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) redirect("/onboarding");

  const { count: pendingCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", seller.id)
    .eq("status", "pending");

  return (
    <div className={`${dmSans.variable} ${bebas.variable} flex min-h-screen bg-[#0A0F0D] font-sans`}>
      <Sidebar seller={seller} pendingOrderCount={pendingCount ?? 0} />
      <div className="min-h-screen flex-1 pb-24 md:pb-8 md:pl-[220px]">{children}</div>
    </div>
  );
}
