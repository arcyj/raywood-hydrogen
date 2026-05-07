import { useState, useMemo } from 'react';
import { Dialog } from 'radix-ui';
import { X, Search, Check } from 'lucide-react';
import { useRevalidator } from 'react-router';
import { usePlaypeak, type SupportedLanguage } from '~/lib/playpeakContext';
import { buildLocale } from '~/helpers/currencies';
import { useTranslation } from '~/lib/i18nContext';

function getFlagEmoji(countryCode: string): string {
  return [...countryCode.toUpperCase()].map(
    (char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)),
  ).join('');
}

const LANGUAGES: { code: SupportedLanguage; label: string; flagCode: string }[] = [
  { code: 'EN', label: 'English', flagCode: 'GB' },
  { code: 'SV', label: 'Svenska', flagCode: 'SE' },
  { code: 'LV', label: 'Latviešu', flagCode: 'LV' },
  { code: 'ET', label: 'Eesti', flagCode: 'EE' },
  { code: 'LT', label: 'Lietuvių', flagCode: 'LT' },
];

export function CountrySelectorDialog() {
  const {
    isCountrySelectorOpen,
    closeCountrySelector,
    availableCountries,
    locale,
    setLocale,
    language,
    setLanguage,
  } = usePlaypeak();
  const { t } = useTranslation();
  const revalidator = useRevalidator();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return availableCountries;
    return availableCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.isoCode.toLowerCase().includes(q) ||
        c.currencyCode.toLowerCase().includes(q),
    );
  }, [availableCountries, search]);

  const handleSelect = (isoCode: string, name: string) => {
    setLocale(buildLocale(isoCode, name));
    fetch('/api/sync-cart', {method: 'POST', credentials: 'same-origin'}).then(() =>
      revalidator.revalidate(),
    );
    closeCountrySelector();
    setSearch('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('country-selector-dismissed', '1');
      }
      closeCountrySelector();
      setSearch('');
    }
  };

  return (
    <Dialog.Root open={isCountrySelectorOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
        <Dialog.Content className="fixed min-h-[500px] tablet:h-[780px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white rounded-xl shadow-large w-[90vw] max-w-[480px] max-h-[80vh] flex flex-col focus:outline-none">
          <div className="flex items-start justify-between p-20 pb-16 border-b border-lightGrey">
            <div>
              <Dialog.Title className="text-h3 mb-4">{t('country_selector.title')}</Dialog.Title>
              <Dialog.Description className="text-small text-gray">
                {t('country_selector.description')}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                className="p-4 rounded-lg hover:bg-lightGrey transition-colors ml-12 shrink-0"
                aria-label={t('common.close')}
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="px-20 py-12 border-b border-lightGrey">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-12 top-1/2 -translate-y-1/2 text-gray pointer-events-none"
              />
              <input
                type="text"
                placeholder={t('country_selector.search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-36 pr-12 py-8 rounded-lg bg-lightGrey text-regular focus:outline-none"
              />
            </div>
          </div>

          <ul className="overflow-y-auto flex-1 p-8">
            {filtered.length === 0 ? (
              <li className="text-center text-small text-gray py-8">{t('country_selector.no_results')}</li>
            ) : (
              filtered.map((country) => {
                const countryLocale = buildLocale(country.isoCode, country.name);
                const isSelected = locale.countryCode === country.isoCode;
                return (
                  <li key={country.isoCode}>
                    <button
                      onClick={() => handleSelect(country.isoCode, country.name)}
                      className="w-full flex items-center gap-12 px-12 py-12 rounded-lg hover:bg-lightGrey active:bg-accentGrey transition-colors text-left"
                    >
                      <span className="text-[22px] leading-none w-28 shrink-0" aria-hidden>
                        {getFlagEmoji(country.isoCode)}
                      </span>
                      <span className="flex-1 text-regular">{country.name}</span>
                      <span className="text-small text-gray shrink-0">{countryLocale.currencyLabel}</span>
                      {isSelected && (
                        <Check size={15} className="text-primary shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="px-20 py-16 border-t border-lightGrey">
            <p className="text-small font-semibold text-gray mb-12">{t('country_selector.language_heading')}</p>
            <div className="flex gap-8 flex-wrap">
              {LANGUAGES.map(({ code, label, flagCode }) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={`flex items-center gap-6 px-12 py-6 rounded-lg text-small font-semibold transition-colors ${
                    language === code
                      ? 'bg-primary text-white'
                      : 'bg-lightGrey text-inherit hover:bg-accentGrey'
                  }`}
                >
                  <span className="text-[16px] leading-none" aria-hidden>{getFlagEmoji(flagCode)}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
