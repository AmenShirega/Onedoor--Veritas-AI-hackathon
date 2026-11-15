import { SYNTHETIC_HELPING_CENTERS } from '../lib/directory';
import { TRANSLATIONS } from '../lib/i18n';
import type { LanguageCode } from '../lib/types';

export function AboutView({ lang }: { lang: LanguageCode }) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="space-y-3 border-b border-[#0F3D3E]/12 pb-6">
        <p className="text-xs font-medium text-[#0F3D3E]/80">
          Safety, Ethics, Limitations &amp; Credits
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F3D3E]">
          About OneDoor
        </h1>
        <p className="text-base text-[#14202B]/85 leading-relaxed max-w-3xl">
          OneDoor is an experimental support-navigation prototype designed around a young woman in
          Addis Ababa who needs help finding the right support service without having to repeat her
          story across multiple institutions.
        </p>
      </div>

      {/* Required Exact Disclaimer */}
      <div className="rounded-2xl bg-[#DCE8E3]/70 border border-[#0F3D3E]/20 p-6 space-y-2">
        <h2 className="font-display text-lg font-bold text-[#0F3D3E]">
          Prototype &amp; Medical Disclaimer
        </h2>
        <p className="text-base font-semibold text-[#14202B]">
          {t.disclaimerExact}
        </p>
        <p className="text-sm text-[#14202B]/80 leading-relaxed">
          OneDoor is not an emergency service, cannot dispatch responders, and does not provide
          medical, psychological, or legal diagnoses. All helping centers and caseworker referrals in
          this build are synthetic demonstrations.
        </p>
      </div>

      {/* Safeguarding, Privacy & Language Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-[#0F3D3E]/15 p-6 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-[#0F3D3E]">
            Minors &amp; Safeguarding
          </h2>
          <p className="text-sm text-[#14202B]/85 leading-relaxed">
            Additional legal and child-protection safeguarding requirements apply whenever the person
            affected is under 18. Real-world deployment requires trained child-safeguarding
            specialists, mandatory protocol verification, and age-appropriate consent procedures.
            This prototype is not equipped to handle live safeguarding emergencies.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#0F3D3E]/15 p-6 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-[#0F3D3E]">
            Language &amp; Classifier Limitations
          </h2>
          <p className="text-sm text-[#14202B]/85 leading-relaxed">
            While the interface supports both English and Amharic (አማርኛ), the trained TF-IDF +
            Logistic Regression classifier was trained and evaluated solely on English synthetic
            data. If non-English script is entered, OneDoor honestly warns the user and switches to
            broad low-confidence fallback options rather than pretending to understand Amharic.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#0F3D3E]/15 p-6 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-[#0F3D3E]">
            Privacy &amp; Data Minimization
          </h2>
          <p className="text-sm text-[#14202B]/85 leading-relaxed">
            No user account is required. No injury photos are requested or accepted. Location is
            selected manually by default, and browser GPS is only queried after explicit action.
            Raw intake descriptions are not logged on the server and are never forwarded unless you
            explicitly edit and approve a referral summary.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#0F3D3E]/15 p-6 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-[#0F3D3E]">
            Quick Exit Notice
          </h2>
          <p className="text-sm text-[#14202B]/85 leading-relaxed">
            The Quick Exit button on every page immediately navigates to a neutral weather website.
            It does not erase browser history, network records, or device logs—for privacy, consider
            using a private browsing window when available.
          </p>
        </div>
      </div>

      {/* Synthetic Directory Transparency */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#0F3D3E]">
          Synthetic Addis Ababa Service Directory (Demo Only)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SYNTHETIC_HELPING_CENTERS.map((c) => (
            <div
              key={c.id}
              className="rounded-xl bg-white/80 border border-[#0F3D3E]/12 p-4 space-y-1 text-sm"
            >
              <p className="text-xs text-[#14202B]/70">
                Synthetic Demo · {c.subCity} · {c.hoursLabel}
              </p>
              <p className="font-semibold text-[#0F3D3E]">{c.name}</p>
              <p className="text-xs text-[#14202B]/80">{c.syntheticPhone}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Credits List */}
      <section className="rounded-2xl bg-white border border-[#0F3D3E]/15 p-6 space-y-3">
        <h2 className="font-display text-xl font-bold text-[#0F3D3E]">
          Credits &amp; Technical Stack
        </h2>
        <ul className="list-disc pl-5 text-sm text-[#14202B]/85 space-y-1.5">
          <li>
            <strong>Dataset:</strong> 200 original synthetic Addis Ababa support descriptions
            created specifically for OneDoor (<code className="font-mono-tabular text-xs">/ml/synthetic_dataset.json</code>). No real survivor accounts used.
          </li>
          <li>
            <strong>ML Training &amp; Inference:</strong> TF-IDF + L2 Logistic Regression pipeline in{' '}
            <code className="font-mono-tabular text-xs">/ml/train.py</code> and{' '}
            <code className="font-mono-tabular text-xs">/ml/train.ipynb</code> (scikit-learn compatible + pure-Python solver fallback), exported to JSON weights for TypeScript inference.
          </li>
          <li>
            <strong>Optional Explanation &amp; Summary Assistant:</strong>{' '}
            <code className="font-mono-tabular text-xs">@google/genai</code> (<code className="font-mono-tabular text-xs">gemini-4-hydrogen</code>) on the server side when <code className="font-mono-tabular text-xs">GEMINI_API_KEY</code> is configured, with full template fallback.
          </li>
          <li>
            <strong>Frontend &amp; Voice:</strong> React 19, TypeScript, Tailwind CSS v4, Express, Lucide icons, and browser Web Speech API (STT/TTS).
          </li>
        </ul>
      </section>
    </div>
  );
}
