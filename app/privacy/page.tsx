import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-16 text-white/80">
      <Link href="/" className="text-sm text-[#25D366]">
        ← Home
      </Link>
      <h1 className="mt-6 font-display text-4xl text-white">Privacy Policy</h1>
      <p className="mt-6 text-sm leading-relaxed">
        Porter helps sellers run WhatsApp-based orders. We process account data, store settings, order details, and
        messages needed to operate the service. Replace this page with your lawyer-reviewed policy before launch.
      </p>
      <p className="mt-4 text-sm leading-relaxed">
        Contact: <a className="text-[#25D366]" href="mailto:hello@porter.app">hello@porter.app</a>
      </p>
    </main>
  );
}
