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
    <main id="main-content" className="min-h-screen bg-porter-bg-base px-4 py-8 safe-top">
      <div className="mx-auto max-w-lg">
        <h1 className="text-display text-porter-green-600">Set up your store</h1>
        <p className="mt-2 text-body">About two minutes. You can connect WhatsApp and payments later in Settings.</p>
        <OnboardingForm />
      </div>
    </main>
  );
}
