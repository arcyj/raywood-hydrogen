import {useLocation, useNavigate, useSearchParams} from 'react-router';
import {FILTER_URL_PREFIX} from '~/helpers/const';
import {Checkbox} from '../ui/Checkbox';

type AvailabilityMode = 'in' | 'out' | 'all';

const AVAILABILITY_FILTER_PARAM = `${FILTER_URL_PREFIX}available`;
const LEGACY_AVAILABILITY_PARAM = 'availability';
const LEGACY_IN_STOCK_PARAM = 'inStock';

function getAvailabilityMode(searchParams: URLSearchParams): AvailabilityMode {
  const availableFilter = searchParams.get(AVAILABILITY_FILTER_PARAM);
  if (availableFilter) {
    try {
      const available = JSON.parse(availableFilter);
      if (available === true) return 'in';
      if (available === false) return 'out';
    } catch {
      // Ignore malformed URL values and fallback to legacy/default behavior.
    }
  }

  const legacyAvailability = searchParams.get(LEGACY_AVAILABILITY_PARAM);
  if (legacyAvailability === 'in' || legacyAvailability === 'out' || legacyAvailability === 'all') {
    return legacyAvailability;
  }
  if (searchParams.get(LEGACY_IN_STOCK_PARAM) === '0') {
    return 'all';
  }
  return 'in';
}

export function AvailabilityFilter({className}: {className?: string}) {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const activeMode = getAvailabilityMode(params);

  const setMode = (nextMode: AvailabilityMode) => {
    const nextParams = new URLSearchParams(params);
    nextParams.delete(AVAILABILITY_FILTER_PARAM);
    nextParams.delete(LEGACY_AVAILABILITY_PARAM);
    nextParams.delete(LEGACY_IN_STOCK_PARAM);
    nextParams.delete('page');

    if (nextMode === 'in' || nextMode === 'out') {
      nextParams.append(
        AVAILABILITY_FILTER_PARAM,
        JSON.stringify(nextMode === 'in'),
      );
    }

    const nextSearch = nextParams.toString();
    navigate(nextSearch ? `${location.pathname}?${nextSearch}` : location.pathname, {
      preventScrollReset: true,
      replace: true,
    });
  };

  return (
    <div className={`space-y-4 rounded-lg p-24 mt-24 bg-lightGrey ${className ?? ''}`}>
      <h3 className="text-h3 font-semibold text-gray-900 mb-24">Availability</h3>
      <div className="flex flex-col gap-12">
        <Checkbox checked={activeMode === 'in'} onChange={() => setMode('in')}>
          In stock
        </Checkbox>
        <Checkbox checked={activeMode === 'out'} onChange={() => setMode('out')}>
          Out of stock
        </Checkbox>
      </div>
    </div>
  );
}
