import {Await} from 'react-router';
import {Suspense, useEffect, useState} from 'react';
import {Drawer} from './ui/Drawer';
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

  const Header = () => {
    return(
      <div className='p-12 flex justify-between items-center'>
        <span className='text-h1'>Cart</span>
        <IconButton
          Icon={Cross1Icon}
          variant="secondary"
          size="medium"
          onClick={closeCart}
        />
      </div>
    )
  }

  return (
    <Drawer
      onClose={closeCart}
      visible={isOpen}
      position="right"
      className="overflow-hidden"
      panelClassName="bg-white p-12"
      header={<Header />}
    >
      <Suspense
        fallback={
          <CartDrawerFallback />
        }
      >
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Drawer>
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
