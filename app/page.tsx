import { Button } from "@/components/ui";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-space-6 px-space-6 py-space-12">
      <div className="text-center space-y-space-3">
        <p className="font-display text-5xl tracking-wide text-porter-green-500">PORTER</p>
        <p className="text-body text-porter-text-secondary max-w-md">
          WhatsApp-first order management. Session 0 design system is ready.
        </p>
      </div>
      <Button href="/design-system" variant="primary" size="lg">
        View design system
      </Button>
    </div>
  );
}
