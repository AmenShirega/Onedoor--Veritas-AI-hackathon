import { PhoneCall } from 'lucide-react';
import { GeneratedArtwork } from './GeneratedArtwork';
import {
  CategoryOutlinedIcon,
  HeroDoorwayIllustration,
} from './OneDoorIcons';
import { CALL_TRANSLATIONS, TRANSLATIONS } from '../lib/i18n';
import { SUPPORT_CATEGORY_IDS, type LanguageCode } from '../lib/types';
import type { AppRoute } from './Shell';

interface HomeViewProps {
  lang: LanguageCode;
  onStartIntake: (mode: 'write' | 'call') => void;
  onNavigate: (route: AppRoute) => void;
}

export function HomeView({ lang, onStartIntake, onNavigate }: HomeViewProps) {
  const t = TRANSLATIONS[lang];
  const c = CALL_TRANSLATIONS[lang];

  return (
    <div>
      {/* Full-Bleed Sanctuary Teal Hero with Layered Editorial Collage & Animated Doorway */}
      <section className="relative overflow-hidden bg-[#0F3D3E] text-[#FAF6EF]">
        {/* Subtle ambient warm radial light behind collage */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 end-[-8%] w-[520px] h-[520px] rounded-full bg-[#E9A23B]/14 blur-3xl"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-14 md:pt-14 md:pb-16 lg:pt-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Copy & Action Column */}
            <div className="lg:col-span-6 space-y-6 relative z-10">
              <p className="text-xs sm:text-sm font-semibold text-[#E9A23B] tracking-wide">
                {t.hero.kicker}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-bold leading-[1.12] tracking-tight text-[#FAF6EF] [text-wrap:balance]">
                {t.hero.title}
              </h1>
              <p className="text-base sm:text-lg text-[#FAF6EF]/88 leading-relaxed max-w-xl">
                {t.hero.subtitle}
              </p>

              {/* Primary CTA group */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onStartIntake('write')}
                    className="px-6 py-3.5 rounded-xl bg-[#E9A23B] text-[#14202B] font-bold text-base hover:bg-[#D89029] transition-colors whitespace-nowrap shrink-0 min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAF6EF]"
                  >
                    {t.hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    data-testid="hero-access-calling-btn"
                    onClick={() => onStartIntake('call')}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#FAF6EF] text-[#0F3D3E] font-bold text-sm sm:text-base border-2 border-[#E9A23B]/75 hover:bg-[#DCE8E3] transition-colors whitespace-nowrap shrink-0 min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAF6EF]"
                  >
                    <PhoneCall className="w-4 h-4 text-[#B45309] shrink-0" aria-hidden="true" />
                    <span>{c.accessCallingCta}</span>
                  </button>
                </div>
                <p className="text-sm text-[#DCE8E3]">
                  <button
                    type="button"
                    onClick={() => onNavigate('about')}
                    className="font-semibold text-[#FAF6EF] underline underline-offset-4 hover:text-[#E9A23B]"
                  >
                    {t.hero.secondaryCta}
                  </button>
                </p>
              </div>
            </div>

            {/* Right Layered Tilted Imagery Collage + Integrated Animated Doorway */}
            <div className="lg:col-span-6 relative">
              <div
                data-testid="hero-collage"
                className="relative mx-auto max-w-[540px] h-[360px] sm:h-[430px] lg:h-[470px]"
              >
                {/* Back-upper tilted card: Warm Doorway Welcome (16:9 native aspect) */}
                <div className="absolute top-2 start-1 sm:start-2 w-[64%] sm:w-[62%] -rotate-3 rounded-2xl shadow-2xl ring-1 ring-[#FAF6EF]/20 overflow-hidden bg-[#0A2C2D] z-10">
                  <GeneratedArtwork
                    id="welcome"
                    alt={t.visualShowcase.welcomeAlt}
                    aspectClassName="aspect-[16/9]"
                    className="rounded-none border-0"
                  />
                </div>

                {/* Front-right overlapping tilted card: Community Care (people fully visible) */}
                <div className="absolute top-[24%] end-0 sm:end-1 w-[62%] sm:w-[60%] rotate-2 rounded-2xl shadow-2xl ring-2 ring-[#FAF6EF]/30 overflow-hidden bg-[#0A2C2D] z-20">
                  <GeneratedArtwork
                    id="community"
                    alt={t.visualShowcase.communityAlt}
                    aspectClassName="aspect-[4/3]"
                    className="rounded-none border-0"
                  />
                </div>

                {/* Bottom-peeking tilted card: Calm Consent Review */}
                <div className="absolute -bottom-10 sm:-bottom-12 start-[6%] sm:start-[5%] w-[52%] sm:w-[50%] rotate-3 rounded-2xl shadow-2xl ring-1 ring-[#FAF6EF]/25 overflow-hidden bg-[#0A2C2D] z-30">
                  <GeneratedArtwork
                    id="privacy"
                    alt={t.visualShowcase.privacyAlt}
                    aspectClassName="aspect-[4/3]"
                    className="rounded-none border-0"
                  />
                </div>

                {/* Animated OneDoor Doorway Emblem anchored cleanly at collage focal intersection */}
                <div className="absolute bottom-4 sm:bottom-6 end-[4%] sm:end-[6%] w-26 sm:w-30 rounded-full bg-[#FAF6EF] p-1.5 shadow-2xl ring-4 ring-[#0F3D3E]/75 z-40">
                  <HeroDoorwayIllustration
                    data-testid="hero-doorway-svg"
                    ariaLabel={t.hero.doorwayAria}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect (3-step calm onboarding + Global Access Illustration) */}
      <section className="bg-[#DCE8E3]/55 border-y border-[#0F3D3E]/10 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-2.5">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F3D3E] [text-wrap:balance]">
                {t.howItWorks.title}
              </h2>
              <p className="text-sm sm:text-base text-[#14202B]/80 leading-relaxed max-w-2xl">
                {t.howItWorks.subtitle}
              </p>
            </div>
            <div className="lg:col-span-5 space-y-2">
              <GeneratedArtwork
                id="global"
                alt={t.visualShowcase.globalAlt}
                aspectClassName="aspect-[4/3]"
              />
              <p className="text-xs text-[#0F3D3E]/85">{t.visualShowcase.globalCaption}</p>
            </div>
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

      {/* Safety & Autonomy Commitments + About & Safety Link */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <div className="rounded-3xl bg-[#0F3D3E] text-[#FAF6EF] p-8 sm:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold max-w-xl [text-wrap:balance]">
              {t.safetySection.title}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#FAF6EF] text-[#0F3D3E] text-sm font-semibold hover:bg-[#DCE8E3] transition-colors whitespace-nowrap shrink-0"
            >
              {t.safetySection.cta}
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
