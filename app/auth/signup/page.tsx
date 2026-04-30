import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-porter-bg-base px-space-4 py-space-12">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="font-display text-2xl tracking-wide text-porter-green-500">
          PORTER
        </Link>
        <Card variant="raised" padding="lg" className="mt-space-8 space-y-space-4">
          <h1 className="text-heading text-porter-text-primary">Start your free trial</h1>
          <p className="text-body text-porter-text-secondary">
            Connect Supabase Auth and onboarding here. For now this is a placeholder route linked from the marketing
            site.
          </p>
          <Button href="/dashboard/" variant="primary" className="w-full" size="lg">
            Continue to demo dashboard
          </Button>
          <Button href="/" variant="ghost" className="w-full" size="md">
            Back to home
          </Button>
        </Card>
      </div>
    </div>
  );
}
