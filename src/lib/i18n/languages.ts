import type { LanguageCode } from '../types';

export interface LanguageMeta {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  dir: 'ltr' | 'rtl';
  speechLang: string;
}

/**
 * 20 international languages supported by OneDoor's UI localization.
 * Intentionally excludes Afaan Oromo and Tigrinya per product requirements.
 */
export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', dir: 'ltr', speechLang: 'en-US' },
  { code: 'am', nativeName: 'አማርኛ', englishName: 'Amharic', dir: 'ltr', speechLang: 'am-ET' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', dir: 'ltr', speechLang: 'es-ES' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', dir: 'ltr', speechLang: 'fr-FR' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', dir: 'rtl', speechLang: 'ar-SA' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', dir: 'ltr', speechLang: 'pt-PT' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', dir: 'ltr', speechLang: 'de-DE' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian', dir: 'ltr', speechLang: 'it-IT' },
  { code: 'zh-Hans', nativeName: '简体中文', englishName: 'Chinese (Simplified)', dir: 'ltr', speechLang: 'zh-CN' },
  { code: 'zh-Hant', nativeName: '繁體中文', englishName: 'Chinese (Traditional)', dir: 'ltr', speechLang: 'zh-TW' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', dir: 'ltr', speechLang: 'ja-JP' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', dir: 'ltr', speechLang: 'ko-KR' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', dir: 'ltr', speechLang: 'hi-IN' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', dir: 'ltr', speechLang: 'bn-BD' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', dir: 'rtl', speechLang: 'ur-PK' },
  { code: 'sw', nativeName: 'Kiswahili', englishName: 'Swahili', dir: 'ltr', speechLang: 'sw-KE' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', dir: 'ltr', speechLang: 'ru-RU' },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', dir: 'ltr', speechLang: 'tr-TR' },
  { code: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', dir: 'ltr', speechLang: 'id-ID' },
  { code: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', dir: 'ltr', speechLang: 'vi-VN' },
];

export const LANGUAGE_MAP = new Map<LanguageCode, LanguageMeta>(
  LANGUAGES.map((l) => [l.code, l])
);

export function getLanguageMeta(code: LanguageCode): LanguageMeta {
  return LANGUAGE_MAP.get(code) ?? LANGUAGES[0];
}
