import { Suspense } from 'react';
import { Await } from 'react-router';
import { CartMain } from './CartMain';
import { usePlaypeak } from '~/lib/playpeakContext';
import type { FC } from 'react';
import type { CartApiQueryFragment } from 'storefrontapi.generated';

interface CartMenuProps {
  cart: Promise<CartApiQueryFragment | null>;
}

export const CartMenu: FC<CartMenuProps> = ({ cart }) => {
  const { closeDrawer } = usePlaypeak()

  return (
    <div className="cart-menu pt-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-32">
            <p className="text-body-regular text-text-layout-secondary">
              Loading cart...
            </p>
          </div>
        }
      >
        <Await resolve={cart}>
          {(resolvedCart) => (
            <CartMain layout="aside" cart={resolvedCart} onClose={closeDrawer} />
          )}
        </Await>
      </Suspense>
    </div>
  );
};
