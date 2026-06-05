import { LegalPageShell } from "@/components/legal/LegalPageShell";

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service">
      <p>
        By using Porter you agree to follow applicable laws, Meta and Razorpay partner terms where integrated, and
        your subscription terms. Replace this placeholder with counsel-approved terms before production.
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
