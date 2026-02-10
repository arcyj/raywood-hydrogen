import {Await} from 'react-router';
import {Suspense} from 'react';
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
      className='overflow-hidden'
      panelClassName='bg-white p-12'
      header={<Header />}
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
