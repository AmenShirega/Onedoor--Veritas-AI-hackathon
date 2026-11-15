import {
  CategoryOutlinedIcon,
  HeroDoorwayIllustration,
  PhoneOutlinedIcon,
} from './OneDoorIcons';
import { TRANSLATIONS } from '../lib/i18n';
import { SUPPORT_CATEGORY_IDS, type LanguageCode } from '../lib/types';
import type { AppRoute } from './Shell';

interface HomeViewProps {
  lang: LanguageCode;
  onStartIntake: (mode: 'write' | 'talk') => void;
  onNavigate: (route: AppRoute) => void;
}

export function HomeView({ lang, onStartIntake, onNavigate }: HomeViewProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div>
      {/* Hero Section: Immediate clarity, single dominant doorway anchor, primary warm-amber CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-14 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs sm:text-sm font-medium text-[#0F3D3E]/80 tracking-wide">
              {t.hero.kicker}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.15] tracking-tight text-[#0F3D3E] [text-wrap:balance]">
              {t.hero.title}
            </h1>
            <p className="text-base sm:text-lg text-[#14202B]/85 leading-relaxed max-w-2xl">
              {t.hero.subtitle}
            </p>

            {/* Primary CTA group: 1 dominant Warm Amber button + secondary Talk option */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onStartIntake('write')}
                  className="px-6 py-3.5 rounded-xl bg-[#E9A23B] text-[#14202B] font-bold text-base hover:bg-[#D89029] transition-colors whitespace-nowrap shrink-0 min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F3D3E]"
                >
                  {t.hero.primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => onStartIntake('talk')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#0F3D3E] text-[#FAF6EF] font-semibold text-sm sm:text-base hover:bg-[#0A2C2D] transition-colors whitespace-nowrap shrink-0 min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F3D3E]"
                >
                  <PhoneOutlinedIcon className="w-4 h-4" />
                  <span>{t.hero.talkCta}</span>
                </button>
              </div>
              <p className="text-sm text-[#14202B]/75">
                {lang === 'am'
                  ? 'የድጋፍ ማዕከል ባለሙያ ነዎት?'
                  : 'Receiving referrals at a helping center?'}{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('caseworker')}
                  className="font-semibold text-[#0F3D3E] underline underline-offset-4 hover:text-[#0A2C2D]"
                >
                  {t.hero.secondaryCta}
                </button>
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <HeroDoorwayIllustration className="w-full max-w-[360px] h-auto" />
          </div>
        </div>
      </section>

      {/* What to Expect (3-step calm onboarding without overwhelming the visitor) */}
      <section className="bg-[#DCE8E3]/55 border-y border-[#0F3D3E]/10 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F3D3E] [text-wrap:balance]">
              {t.howItWorks.title}
            </h2>
            <p className="text-sm sm:text-base text-[#14202B]/80 leading-relaxed">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.howItWorks.steps.map((step) => (
              <div
                key={step.num}
                className="bg-[#FAF6EF] rounded-2xl p-6 border border-[#0F3D3E]/12 space-y-2.5"
              >
                <p className="font-mono-tabular text-sm font-semibold text-[#0F3D3E]">
                  {step.num}
                </p>
                <h3 className="font-display text-lg font-semibold text-[#14202B]">
                  {step.title}
                </h3>
                <p className="text-sm text-[#14202B]/80 leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 Support Pathways */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F3D3E] [text-wrap:balance]">
            {t.categoriesSection.title}
          </h2>
          <p className="text-sm sm:text-base text-[#14202B]/80 leading-relaxed">
            {t.categoriesSection.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUPPORT_CATEGORY_IDS.map((catId) => {
            const info = t.categories[catId];
            return (
              <div
                key={catId}
                className="rounded-2xl p-6 bg-white/75 border border-[#0F3D3E]/12 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#DCE8E3] text-[#0F3D3E] flex items-center justify-center">
                  <CategoryOutlinedIcon category={catId} className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-[#0F3D3E]">
                  {info.label}
                </h3>
                <p className="text-sm text-[#14202B]/80 leading-relaxed">
                  {info.shortDesc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Safety & Autonomy Commitments + Honest Research Link */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <div className="rounded-3xl bg-[#0F3D3E] text-[#FAF6EF] p-8 sm:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold max-w-xl [text-wrap:balance]">
              {t.safetySection.title}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('research')}
              className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#FAF6EF] text-[#0F3D3E] text-sm font-semibold hover:bg-[#DCE8E3] transition-colors whitespace-nowrap shrink-0"
            >
              Inspect ML Model &amp; Honest Errors
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-[#FAF6EF]/15 pt-8">
            {t.safetySection.items.map((item) => (
              <div key={item.title} className="space-y-2">
                <h3 className="font-display text-base font-semibold text-[#E9A23B]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#FAF6EF]/85 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
