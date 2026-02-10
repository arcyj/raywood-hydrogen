import {Await} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import {Suspense} from 'react';
import {Drawer} from './ui/Drawer';
import { IconButton } from './ui/IconButton';
import { Cross1Icon } from "@radix-ui/react-icons";
import {usePlaypeak} from '~/lib/playpeakContext';
import type {
  CartApiQueryFragment,
} from 'storefrontapi.generated';
import { CartMain } from './CartMain';
import {CartSummary} from './CartSummary';

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
          size="small"
          onClick={closeCart}
        />
      </div>
    )
  }

  const FooterContent = ({ resolvedCart }: { resolvedCart: CartApiQueryFragment | null }) => {
    const cartSummary = useOptimisticCart(resolvedCart);
    const cartHasItems = cartSummary?.totalQuantity ? cartSummary.totalQuantity > 0 : false;

    if (!cartHasItems) {
      return null;
    }

    return <CartSummary cart={cartSummary} layout='aside' />;
  };

  const Footer = () => {
    console.log("footer")
    return (
      <Suspense fallback={null}>
        <Await resolve={cart}>
          {(resolvedCart) => <FooterContent resolvedCart={resolvedCart} />}
        </Await>
      </Suspense>
    );
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
