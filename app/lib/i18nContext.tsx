import { useCallback } from 'react';
import { usePlaypeak, type SupportedLanguage } from '~/lib/playpeakContext';
import en from '~/locales/en.json';
import sv from '~/locales/sv.json';
import lv from '~/locales/lv.json';
import et from '~/locales/et.json';
import lt from '~/locales/lt.json';

export type TranslationKey = keyof typeof en;

type Translations = Record<string, string>;

const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  EN: en,
  SV: sv as Translations,
  LV: lv as Translations,
  ET: et as Translations,
  LT: lt as Translations,
};

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? `{{${key}}}`));
}

export function useTranslation() {
  const { language } = usePlaypeak();
  const translations = TRANSLATIONS[language] ?? (en as Translations);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const str = translations[key] ?? (en as Translations)[key] ?? key;
      return interpolate(str, vars);
    },
    [translations],
  );

  return { t, language };
}
