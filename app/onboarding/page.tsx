import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import OnboardingForm from "./ui";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: existing } = await supabase.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (existing) redirect("/dashboard");

  return (
    <main id="main-content" className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-['Bebas_Neue',sans-serif] text-4xl text-[#25D366]">Setup your store</h1>
      <p className="mt-2 text-sm text-white/70">Takes about 2 minutes. You can edit Meta and Razorpay later in Settings.</p>
      <OnboardingForm />
    </main>
  );
}
