import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Globe, Search } from 'lucide-react';
import { getLanguageMeta, LANGUAGES, TRANSLATIONS } from '../lib/i18n';
import type { LanguageCode } from '../lib/types';

interface LanguageDropdownProps {
  lang: LanguageCode;
  onChangeLang: (next: LanguageCode) => void;
}

export function LanguageDropdown({ lang, onChangeLang }: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];
  const currentMeta = getLanguageMeta(lang);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (ev: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 30);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [open]);

  const filteredLanguages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (item) =>
        item.nativeName.toLowerCase().includes(q) ||
        item.englishName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (code: LanguageCode) => {
    onChangeLang(code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        data-testid="language-dropdown-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t.languageSelector.buttonAria}: ${currentMeta.nativeName}`}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg border border-[#0F3D3E]/25 bg-white text-[#0F3D3E] hover:bg-[#DCE8E3]/50 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F3D3E]"
      >
        <Globe className="w-4 h-4 shrink-0 text-[#0F3D3E]" aria-hidden="true" />
        <span className="max-w-[100px] sm:max-w-[140px] truncate">{currentMeta.nativeName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          data-testid="language-dropdown-menu"
          className="fixed inset-x-3 top-16 sm:inset-auto sm:absolute sm:end-0 sm:top-full mt-2 w-auto sm:w-80 rounded-2xl bg-[#FAF6EF] border border-[#0F3D3E]/20 shadow-lg z-50 overflow-hidden"
        >
          <div className="p-2.5 border-b border-[#0F3D3E]/12 bg-white">
            <div className="relative">
              <Search
                className="w-4 h-4 text-[#0F3D3E]/60 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="search"
                data-testid="language-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.languageSelector.searchPlaceholder}
                aria-label={t.languageSelector.searchPlaceholder}
                className="w-full rounded-xl border border-[#0F3D3E]/20 bg-[#FAF6EF]/70 ps-9 pe-3 py-2 text-sm text-[#14202B] focus:outline-2 focus:outline-[#0F3D3E]"
              />
            </div>
          </div>

          <ul
            role="listbox"
            aria-label={t.languageSelector.buttonAria}
            className="max-h-72 overflow-y-auto py-1.5 divide-y divide-[#0F3D3E]/5"
          >
            {filteredLanguages.length === 0 ? (
              <li className="px-4 py-3 text-xs text-[#14202B]/70">
                {t.languageSelector.noResults}
              </li>
            ) : (
              filteredLanguages.map((item) => {
                const selected = item.code === lang;
                return (
                  <li key={item.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      data-testid={`lang-option-${item.code}`}
                      onClick={() => handleSelect(item.code)}
                      className={`w-full px-3.5 py-2.5 text-start flex items-center justify-between gap-3 text-sm transition-colors ${
                        selected
                          ? 'bg-[#DCE8E3] text-[#0F3D3E] font-semibold'
                          : 'text-[#14202B] hover:bg-[#DCE8E3]/45'
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{item.nativeName}</span>
                        {item.nativeName !== item.englishName && (
                          <span className="block text-xs text-[#14202B]/65 truncate">
                            {item.englishName}
                          </span>
                        )}
                      </span>
                      {selected && (
                        <Check className="w-4 h-4 text-[#0F3D3E] shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="px-3.5 py-2 bg-[#DCE8E3]/55 border-t border-[#0F3D3E]/12 text-[11px] text-[#0F3D3E]/85 leading-snug">
            {t.languageSelector.mlLanguageBadge}
          </div>
        </div>
      )}
    </div>
  );
}
