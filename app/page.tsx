import { Button } from "@/components/ui";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-space-6 px-space-6 py-space-12">
      <div className="text-center space-y-space-3">
        <p className="font-display text-5xl tracking-wide text-porter-green-500">PORTER</p>
        <p className="text-body text-porter-text-secondary max-w-md">
          WhatsApp-first order management for local shops — dashboard and design system preview.
        </p>
      </div>
      <div className="flex flex-col gap-space-3 sm:flex-row">
        <Button href="/dashboard/" variant="primary" size="lg">
          Open shop dashboard
        </Button>
        <Button href="/design-system/" variant="secondary" size="lg">
          Design system
        </Button>
      </div>
    </div>
  );
}
