import {usePlaypeak} from '~/lib/playpeakContext';

const FREE_DELIVERY_COUNTRIES = new Set(['LV', 'LT', 'EE', 'FI']);

export function useFreeDelivery(): boolean {
  const {locale} = usePlaypeak();
  return locale.countryCode !== null && FREE_DELIVERY_COUNTRIES.has(locale.countryCode);
}
