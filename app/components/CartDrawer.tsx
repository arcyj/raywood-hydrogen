import {Await} from 'react-router';
import {Suspense, useEffect, useState} from 'react';
import { VaulDrawer } from './ui/vaulDrawer';
import { IconButton } from './ui/IconButton';
import { Cross1Icon } from "@radix-ui/react-icons";
import {usePlaypeak} from '~/lib/playpeakContext';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { useTranslation } from '~/lib/i18nContext';
import type {
  CartApiQueryFragment,
} from 'storefrontapi.generated';
import { CartMain } from './CartMain';

export function CartDrawer({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  const { isDrawerOpen, closeDrawer } = usePlaypeak();
  const { isTablet } = useBreakpoints();
  const { t } = useTranslation();
  const isOpen = isDrawerOpen('cart');

  return (
    <VaulDrawer.Root
      direction={isTablet ? 'right' : 'bottom'}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDrawer();
      }}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay />
        <VaulDrawer.Content>
          <div className='bg-white rounded-t-lg tablet:rounded-lg h-full relative'>
            <div className="w-full flex tablet:hidden items-center justify-center pt-12"><span className='w-128 h-4 bg-accentGrey rounded-full block'></span></div>
            <div className='px-12 pb-12 tablet:pt-12 flex justify-between items-center'>
              <span className='text-h1'>{t('cart.heading')}</span>
              <IconButton
                Icon={Cross1Icon}
                variant="secondary"
                size="medium"
                onClick={closeDrawer}
              />
            </div>
            <Suspense fallback={<CartDrawerFallback />}>
              <Await resolve={cart}>
                {(cart) => {
                  return <CartMain cart={cart} layout="aside" />;
                }}
              </Await>
            </Suspense>
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}

function CartDrawerFallback() {
  const [showRefreshHint, setShowRefreshHint] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowRefreshHint(true);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div>
      <ul className="predictive-search-result-items">
        <li className="predictive-search-result-item flex w-full mt-8">
          <div className="mix-blend-darken mr-8">
            <div className="skeleton-shimmer rounded aspect-square h-[60px] w-[60px]" />
          </div>
          <div className="mt-4 space-y-2 flex-1 w-full">
            <div className="h-4 skeleton-shimmer rounded w-2/3" />
            <div className="h-4 skeleton-shimmer rounded w-1/3" />
            <div className="h-12 skeleton-shimmer rounded w-24 mt-4" />
          </div>
        </li>
      </ul>
      {showRefreshHint ? (
        <p className="text-small text-center">
          {t('cart.loading_hint')}
        </p>
      ) : null}
    </div>
  );
}
