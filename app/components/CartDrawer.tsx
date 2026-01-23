import {Await} from 'react-router';
import {Suspense} from 'react';
import {Drawer} from './ui/Drawer';
import {usePlaypeak} from '~/lib/playpeakContext';
import type {
  CartApiQueryFragment,
} from 'storefrontapi.generated';
import { CartMain } from './CartMain';

export function CartDrawer({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  const { isDrawerOpen, closeCart } = usePlaypeak();
  const isOpen = isDrawerOpen('cart');

  return (
    <Drawer
      onClose={closeCart}
      visible={isOpen}
      position="right"
      className='overflow-hidden'
      panelClassName='bg-white p-12'
    >
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Drawer>
  );
}
