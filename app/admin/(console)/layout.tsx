import AdminChrome from "@/components/admin/AdminChrome";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from "next/font/google";
import { redirect } from "next/navigation";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) redirect("/admin/login");

  return (
    <div className={`${dmSans.variable} ${bebas.variable} ${jetbrains.variable} min-h-screen bg-porter-bg-base font-sans text-porter-text-primary`}>
      <AdminChrome email={user.email ?? ""}>{children}</AdminChrome>
    </div>
  );
}
