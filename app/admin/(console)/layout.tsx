import AdminChrome from "@/components/admin/AdminChrome";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-porter-bg-base font-sans text-porter-text-primary">
      <AdminChrome email={user.email ?? ""}>{children}</AdminChrome>
    </div>
  );
}
