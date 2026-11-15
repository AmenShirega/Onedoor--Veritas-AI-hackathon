import { useState, type ReactNode } from 'react';
import { DoorwayLogoMark } from './OneDoorIcons';
import { TRANSLATIONS } from '../lib/i18n';
import type { LanguageCode } from '../lib/types';

export type AppRoute = 'home' | 'intake' | 'caseworker' | 'research' | 'about';

interface ShellProps {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
  lang: LanguageCode;
  onChangeLang: (lang: LanguageCode) => void;
  children: ReactNode;
}

export function triggerQuickExit() {
  // Replace current history entry with neutral weather site; never claims to erase browser history
  window.location.replace('https://www.weather.com');
}

export function Shell({
  route,
  onNavigate,
  lang,
  onChangeLang,
  children,
}: ShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const navItems: Array<{ id: AppRoute; label: string }> = [
    { id: 'home', label: t.nav.home },
    { id: 'intake', label: t.nav.getSupport },
    { id: 'caseworker', label: t.nav.caseworker },
    { id: 'research', label: t.nav.research },
    { id: 'about', label: t.nav.about },
  ];

  const handleNavClick = (id: AppRoute) => {
    setMobileMenuOpen(false);
    onNavigate(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF] text-[#14202B]">
      {/* Sticky 3-Zone Top Bar Contract (compact height <= 64px) */}
      <header className="sticky top-0 z-40 bg-[#FAF6EF]/95 backdrop-blur-sm border-b border-[#0F3D3E]/12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#0F3D3E] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F3D3E]"
          >
            <DoorwayLogoMark className="w-6 h-6 text-[#0F3D3E]" />
            <span>{t.brandName}</span>
          </a>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#14202B]/80"
          >
            {navItems.map((item) => {
              const active = route === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F3D3E] ${
                    active
                      ? 'border-[#0F3D3E] text-[#0F3D3E] font-semibold'
                      : 'border-transparent hover:text-[#0F3D3E] hover:border-[#0F3D3E]/30'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Safety Action (Quick Exit) + mobile menu button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={triggerQuickExit}
              title={t.quickExitHint}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#B91C1C] text-white hover:bg-[#991B1B] transition-colors whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B91C1C]"
            >
              {t.quickExit}
            </button>
            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden px-3 py-2 text-sm font-medium rounded-lg border border-[#0F3D3E]/20 text-[#0F3D3E] min-h-[40px] whitespace-nowrap shrink-0"
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden border-t border-[#0F3D3E]/12 bg-[#FAF6EF] px-4 py-3 flex flex-col gap-1"
          >
            {navItems.map((item) => {
              const active = route === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium min-h-[44px] ${
                    active
                      ? 'bg-[#DCE8E3] text-[#0F3D3E] font-semibold'
                      : 'text-[#14202B] hover:bg-[#DCE8E3]/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </header>

      {/* Non-sticky contextual safety & language utility strip */}
      <div className="bg-[#DCE8E3]/70 border-b border-[#0F3D3E]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[#14202B]/85">
          <p className="leading-relaxed">{t.emergencyBanner}</p>
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            <div
              role="group"
              aria-label="Interface language"
              className="inline-flex items-center p-0.5 rounded-lg bg-[#FAF6EF] border border-[#0F3D3E]/15"
            >
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'en'
                    ? 'bg-[#0F3D3E] text-white'
                    : 'text-[#14202B]/75 hover:text-[#0F3D3E]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('am')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'am'
                    ? 'bg-[#0F3D3E] text-white'
                    : 'text-[#14202B]/75 hover:text-[#0F3D3E]'
                }`}
              >
                አማርኛ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Quiet Footer with exact required disclaimer and Quick Exit */}
      <footer className="border-t border-[#0F3D3E]/15 bg-[#0F3D3E] text-[#FAF6EF] mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-base font-semibold">
              <DoorwayLogoMark className="w-5 h-5 text-[#FAF6EF]" />
              <span>{t.brandName}</span>
            </div>
            <p className="text-sm text-[#FAF6EF]/85 leading-relaxed">
              {t.disclaimerExact}
            </p>
            <p className="text-xs text-[#FAF6EF]/75 leading-relaxed">
              {t.footer.prototypeNote}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold text-[#FAF6EF]">Navigation</p>
            <ul className="space-y-1.5 text-[#FAF6EF]/80">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className="hover:text-white underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold text-[#FAF6EF]">Safety & Language</p>
            <p className="text-xs text-[#FAF6EF]/80 leading-relaxed">
              {t.footer.languageNotice}
            </p>
            <p className="text-xs text-[#FAF6EF]/75 leading-relaxed">
              {t.quickExitHint}
            </p>
            <button
              type="button"
              onClick={triggerQuickExit}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#FAF6EF] text-[#14202B] text-xs font-semibold hover:bg-[#DCE8E3] transition-colors"
            >
              {t.quickExit}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
