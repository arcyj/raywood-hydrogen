import { Suspense } from 'react';
import { Await } from 'react-router';
import { CartMain } from './CartMain';
import { useDrawer } from './ui/Drawer';
import type { FC } from 'react';
import type { CartApiQueryFragment } from 'storefrontapi.generated';

interface CartMenuProps {
  cart: Promise<CartApiQueryFragment | null>;
}

export const CartMenu: FC<CartMenuProps> = ({ cart }) => {
  const { onClose } = useDrawer();

  return (
    <div className="cart-menu p-16">
      <div className="flex items-center justify-between mb-16">
        <h2 className="text-2xl font-bold">Cart</h2>
        <button
          onClick={onClose}
          className="text-2xl font-light hover:text-gray-600 transition-colors"
          aria-label="Close cart"
        >
          ×
        </button>
      </div>
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
            <CartMain layout="aside" cart={resolvedCart} onClose={onClose} />
          )}
        </Await>
      </Suspense>
    </div>
  );
};
