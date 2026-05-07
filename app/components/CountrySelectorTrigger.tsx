import { Globe } from 'lucide-react';
import { usePlaypeak } from '~/lib/playpeakContext';

function getFlagEmoji(countryCode: string): string {
  return [...countryCode.toUpperCase()].map(
    (char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)),
  ).join('');
}

interface CountrySelectorTriggerProps {
  className?: string;
  /** Controls text color for dark/light backgrounds */
  variant?: 'light' | 'dark';
}

export function CountrySelectorTrigger({
  className = '',
  variant = 'light',
}: CountrySelectorTriggerProps) {
  const {openCountrySelector, locale} = usePlaypeak();

  const textColor = variant === 'dark' ? 'text-white' : 'text-inherit';

  return (
    <button
      onClick={openCountrySelector}
      className={`flex items-center gap-8 text-small hover:opacity-80 transition-opacity cursor-pointer ${textColor} ${className}`}
      aria-label="Choose country and currency"
    >
      {locale.countryCode ? (
        <span className="text-[16px] leading-none" aria-hidden>
          {getFlagEmoji(locale.countryCode)}
        </span>
      ) : (
        <Globe size={14} />
      )}
      <span>{locale.countryName} ({locale.currencyLabel})</span>
    </button>
  );
}
