import type { LanguageCode } from '../types';
import { LANGUAGES, LANGUAGE_MAP, getLanguageMeta, type LanguageMeta } from './languages';
import { PACK_EN_AM_ES_FR } from './packEnAmEsFr';
import { PACK_AR_PT_DE_IT } from './packArPtDeIt';
import { PACK_ZH_JA_KO } from './packZhJaKo';
import { PACK_HI_BN_UR_SW } from './packHiBnUrSw';
import { PACK_RU_TR_ID_VI } from './packRuTrIdVi';
import { FLOW_PACK_A, type FlowSchema } from './flowPackA';
import { FLOW_PACK_B } from './flowPackB';
import type { TranslationSchema } from './schema';

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
export const LANGUAGE_STORAGE_KEY = 'onedoor_ui_lang';

export const TRANSLATIONS: Record<LanguageCode, TranslationSchema> = {
  ...PACK_EN_AM_ES_FR,
  ...PACK_AR_PT_DE_IT,
  ...PACK_ZH_JA_KO,
  ...PACK_HI_BN_UR_SW,
  ...PACK_RU_TR_ID_VI,
};

export const FLOW_TRANSLATIONS: Record<LanguageCode, FlowSchema> = {
  ...FLOW_PACK_A,
  ...FLOW_PACK_B,
};

export function isSupportedLanguage(code: unknown): code is LanguageCode {
  return typeof code === 'string' && LANGUAGE_MAP.has(code as LanguageCode);
}

export function getStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(saved)) {
      return saved;
    }
  } catch {
    // Ignore storage access errors in restricted private contexts
  }
  return DEFAULT_LANGUAGE;
}

export function saveLanguage(code: LanguageCode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // Ignore storage access errors
  }
}

export { LANGUAGES, LANGUAGE_MAP, getLanguageMeta };
export type { FlowSchema, LanguageMeta, TranslationSchema };
