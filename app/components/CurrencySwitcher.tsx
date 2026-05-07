import { useRevalidator } from 'react-router';
import { Combobox } from './ui/Combobox';
import { usePlaypeak } from '~/lib/playpeakContext';
import { buildLocale } from '~/helpers/currencies';

/**
 * Currency switcher – displays only currencies (no country names).
 * Selected currency stored in context + localStorage.
 * Cart syncs in background when currency changes.
 */
export function CurrencySwitcher() {
  const { locale, setLocale, availableCountries } = usePlaypeak();
  const revalidator = useRevalidator();

  // Build currency options from available countries (deduplicated by currency)
  const seen = new Set<string>();
  const currencyItems = availableCountries
    .filter(c => { const { currency } = buildLocale(c.isoCode, c.name); return seen.has(currency) ? false : (seen.add(currency), true); })
    .map(c => { const l = buildLocale(c.isoCode, c.name); return { value: l.currency, label: l.currencyLabel }; });

  const handleChange = (currency: string | null) => {
    if (!currency || currency === locale.currency) return;
    const match = availableCountries.find(c => buildLocale(c.isoCode, c.name).currency === currency);
    if (!match) return;
    setLocale(buildLocale(match.isoCode, match.name));
    fetch('/api/sync-cart', { method: 'POST', credentials: 'same-origin' }).then(() => revalidator.revalidate());
  };

  return (
    <Combobox<string>
      value={locale.currency}
      onChange={handleChange}
      items={currencyItems}
      getOptionKey={(c) => c}
      by={(a, b) => a === b}
      placeholder="Currency"
      aria-label="Select currency"
      filterable
    />
  );
}
