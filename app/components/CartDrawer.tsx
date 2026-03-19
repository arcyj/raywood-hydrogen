import {Await} from 'react-router';
import {Suspense, useEffect, useState} from 'react';
import { VaulDrawer } from './ui/vaulDrawer';
import { IconButton } from './ui/IconButton';
import { Cross1Icon } from "@radix-ui/react-icons";
import {usePlaypeak} from '~/lib/playpeakContext';
import type {
  CartApiQueryFragment,
} from 'storefrontapi.generated';
import { CartMain } from './CartMain';

export function CartDrawer({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  const { isDrawerOpen, closeCart } = usePlaypeak();
  const isOpen = isDrawerOpen('cart');

  return (
    <VaulDrawer.Root
      direction='right'
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeCart();
      }}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-black/40 z-9998" />
        <VaulDrawer.Content className="p-12 flex flex-col fixed right-0 tablet:w-[500px] top-0 bottom-0 h-full z-9999">
          <div className='bg-white rounded-lg h-full relative'>
            <div className='p-12 flex justify-between items-center'>
              <span className='text-h1'>Cart</span>
              <IconButton
                Icon={Cross1Icon}
                variant="secondary"
                size="medium"
                onClick={closeCart}
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
          If loading persists, please refresh the page
        </p>
      ) : null}
    </div>
  );
}
