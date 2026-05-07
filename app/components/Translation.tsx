import type { TranslationKey } from '~/lib/i18nContext';
import { useTranslation } from '~/lib/i18nContext';

interface TranslationProps {
  id: TranslationKey;
  values?: Record<string, string | number>;
}

export function Translation({ id, values }: TranslationProps) {
  const { t } = useTranslation();
  return <>{t(id, values)}</>;
}
