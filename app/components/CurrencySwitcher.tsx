import { useRevalidator } from 'react-router';
import { Combobox } from './ui/Combobox';
import { useCurrency } from '~/lib/CurrencyContext';

/**
 * Currency switcher – displays only currencies (no country names).
 * Selected currency stored in context + localStorage.
 * Cart syncs in background when currency changes.
 */
export function CurrencySwitcher() {
  const { selectedCurrency, setSelectedCurrency, availableCurrencies } = useCurrency();
  const revalidator = useRevalidator();

  const handleChange = (value: typeof selectedCurrency | null) => {
    if (!value || value.currency === selectedCurrency.currency) return;
    setSelectedCurrency(value);

    // Sync cart to new currency in parallel
    fetch('/api/sync-cart', { method: 'POST', credentials: 'same-origin' }).then(() =>
      revalidator.revalidate()
    );
  };

  return (
    <Combobox<typeof selectedCurrency>
      value={selectedCurrency}
      onChange={handleChange}
      items={availableCurrencies.map((opt) => ({
        value: opt,
        label: opt.label,
        mobileLabel: opt.currency,
      }))}
      getOptionKey={(opt) => opt.currency}
      by={(a, b) => a.currency === b.currency}
      placeholder="Currency"
      aria-label="Select currency"
      filterable
    />
  );
}
