import { GeneratedArtwork } from './GeneratedArtwork';
import { VERIFIED_SERVICE_DIRECTORY } from '../lib/directory';
import { TRANSLATIONS } from '../lib/i18n';
import type { LanguageCode } from '../lib/types';

export function AboutView({ lang }: { lang: LanguageCode }) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#0F3D3E]/12 pb-8">
        <div className="lg:col-span-7 space-y-3">
          <p className="text-xs font-medium text-[#0F3D3E]/80">
            {t.about.kicker}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F3D3E]">
            {t.about.title}
          </h1>
          <p className="text-base text-[#14202B]/85 leading-relaxed">
            {t.about.intro}
          </p>
        </div>

        <div className="lg:col-span-5">
          <GeneratedArtwork
            id="global"
            alt={t.visualShowcase.globalAlt}
            aspectClassName="aspect-[4/3]"
          />
        </div>
      </div>

      {/* Required Exact Disclaimer + Localized Note */}
      <div className="rounded-2xl bg-[#DCE8E3]/70 border border-[#0F3D3E]/20 p-6 space-y-2">
        <h2 className="font-display text-lg font-bold text-[#0F3D3E]">
          {t.about.disclaimerTitle}
        </h2>
        <p className="text-base font-semibold text-[#14202B]">
          {t.disclaimerExact}
        </p>
        <p className="text-xs font-medium text-[#0F3D3E]">
          {t.disclaimerLocalNote}
        </p>
        <p className="text-sm text-[#14202B]/80 leading-relaxed pt-1">
          {t.about.disclaimerBody}
        </p>
      </div>

      {/* Honest Readiness Assessment: Operational vs Not Yet Operational */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-[#0F3D3E]/20 p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-[#0F3D3E]">
            {t.about.worksTitle}
          </h2>
          <ul className="list-disc ps-5 text-sm text-[#14202B]/85 space-y-2 leading-relaxed">
            {t.about.worksItems.map((item) => (
              <li key={item.title}>
                <strong>{item.title}:</strong> {item.body}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-[#FAF6EF] border border-[#0F3D3E]/25 p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-[#0F3D3E]">
            {t.about.notYetTitle}
          </h2>
          <ul className="list-disc ps-5 text-sm text-[#14202B]/85 space-y-2 leading-relaxed">
            {t.about.notYetItems.map((item) => (
              <li key={item.title}>
                <strong>{item.title}:</strong> {item.body}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Visual Balance: Human Listening Photography + Community Illustration */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <figure className="rounded-2xl bg-white/80 border border-[#0F3D3E]/12 p-4 space-y-3">
          <GeneratedArtwork
            id="counselorListening"
            alt={t.visualShowcase.counselorPhotoAlt}
            aspectClassName="aspect-[4/3]"
          />
          <figcaption className="text-xs sm:text-sm text-[#14202B]/85 leading-relaxed">
            {t.visualShowcase.counselorPhotoCaption}
          </figcaption>
        </figure>

        <figure className="rounded-2xl bg-white/80 border border-[#0F3D3E]/12 p-4 space-y-3">
          <GeneratedArtwork
            id="community"
            alt={t.visualShowcase.communityAlt}
            aspectClassName="aspect-[4/3]"
          />
          <figcaption className="text-xs sm:text-sm text-[#14202B]/85 leading-relaxed">
            {t.visualShowcase.communityCaption}
          </figcaption>
        </figure>
      </section>

      {/* Safeguarding & Quick Exit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-[#0F3D3E]/15 p-6 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-[#0F3D3E]">
            {t.about.safeguardingTitle}
          </h2>
          <p className="text-sm text-[#14202B]/85 leading-relaxed">
            {t.about.safeguardingBody}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#0F3D3E]/15 p-6 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-[#0F3D3E]">
            {t.about.quickExitTitle}
          </h2>
          <p className="text-sm text-[#14202B]/85 leading-relaxed">
            {t.about.quickExitBody}
          </p>
        </div>
      </div>

      {/* Verified International Directory Status */}
      <section className="rounded-2xl bg-white/85 border border-[#0F3D3E]/15 p-6 space-y-3">
        <h2 className="font-display text-2xl font-bold text-[#0F3D3E]">
          {t.about.directoryTitle}
        </h2>
        <p className="text-sm text-[#14202B]/80 leading-relaxed">
          {t.about.directoryBody}
        </p>
        {VERIFIED_SERVICE_DIRECTORY.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {VERIFIED_SERVICE_DIRECTORY.map((c) => (
              <div
                key={c.id}
                className="rounded-xl bg-[#FAF6EF] border border-[#0F3D3E]/12 p-4 space-y-1.5 text-sm"
              >
                <p className="text-xs text-[#14202B]/70">
                  {c.city ? `${c.city}, ` : ''}
                  {c.countryName} · {c.hoursLabel}
                </p>
                <p className="font-semibold text-[#0F3D3E]">{c.name}</p>
                <p className="text-xs text-[#14202B]/80 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Architecture & Data Ethics */}
      <section className="rounded-2xl bg-white border border-[#0F3D3E]/15 p-6 space-y-3">
        <h2 className="font-display text-xl font-bold text-[#0F3D3E]">
          {t.about.architectureTitle}
        </h2>
        <ul className="list-disc ps-5 text-sm text-[#14202B]/85 space-y-1.5">
          {t.about.architectureItems.map((item) => (
            <li key={item.title}>
              <strong>{item.title}:</strong> {item.body}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
