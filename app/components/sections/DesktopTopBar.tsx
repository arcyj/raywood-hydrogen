import {Await, NavLink} from 'react-router';
import {Suspense} from 'react';
import {Profile} from '../icons';
import { Van } from 'lucide-react';
import { useFreeDelivery } from '~/hooks/useFreeDelivery';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { CountrySelectorTrigger } from '../CountrySelectorTrigger';
import { useTranslation } from '~/lib/i18nContext';

interface DesktopTopBarProps {
  isLoggedIn: Promise<boolean>;
}

export function DesktopTopBar({isLoggedIn}: DesktopTopBarProps) {
  const isFreeDelivery = useFreeDelivery();
  const { isTablet } = useBreakpoints();
  const { t } = useTranslation();

  if(!isFreeDelivery && !isTablet){
    return null;
  }
  
  return (
    <div className="h-32 tablet:h-48 flex w-full bg-[#1D1229] px-12 items-center justify-center tablet:justify-between relative top-0 left-0 z-[1301]">
      <div className="hidden tablet:flex items-center">
        <span className='text-[12px] text-lightGrey font-semibold mr-12'>{t('nav.shipping_to')}</span>
        <CountrySelectorTrigger variant="dark" className='bg-[#3e1956] px-12 py-4 rounded-lg' />
      </div>
      {isFreeDelivery && (
        <p className="text-small leading-none text-white flex items-center gap-8">
          <Van size={19} className="-translate-y-[1px]"/>
          <span>{t('nav.free_delivery_banner')}</span>
        </p>
      )}
      <div className='hidden tablet:block'>
        <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
          <Suspense fallback={<></>}>
            <Await resolve={isLoggedIn} errorElement="Sign in">
              {(isLoggedIn) => (
                <span className="flex text-small">
                  <Profile className="mr-4" /> {isLoggedIn ? t('nav.account') : t('nav.sign_in')}
                </span>
              )}
            </Await>
          </Suspense>
        </NavLink>
      </div>
    </div>
  );
}

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}
