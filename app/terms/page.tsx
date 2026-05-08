import Link from "next/link";

export default function TermsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-16 text-white/80">
      <Link href="/" className="text-sm text-[#25D366]">
        ← Home
      </Link>
      <h1 className="mt-6 font-display text-4xl text-white">Terms of Service</h1>
      <p className="mt-6 text-sm leading-relaxed">
        By using Porter you agree to follow applicable laws, Meta and Razorpay partner terms where integrated, and
        your subscription terms. Replace this placeholder with counsel-approved terms before production.
      </p>
      <p className="mt-4 text-sm leading-relaxed">
        Contact: <a className="text-[#25D366]" href="mailto:hello@porter.app">hello@porter.app</a>
      </p>
    </main>
  );
}
