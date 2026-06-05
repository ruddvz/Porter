import { LegalPageShell } from "@/components/legal/LegalPageShell";

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p>
        Porter helps sellers run WhatsApp-based orders. We process account data, store settings, order details, and
        messages needed to operate the service. Replace this page with your lawyer-reviewed policy before launch.
      </p>
      <p>
        Contact:{" "}
        <a className="font-semibold text-porter-green-600 hover:underline" href="mailto:hello@porter.app">
          hello@porter.app
        </a>
      </p>
    </LegalPageShell>
  );
}
