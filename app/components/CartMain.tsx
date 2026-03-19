import {useOptimisticCart} from '@shopify/hydrogen';
import {useContext} from 'react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {AsideContext} from './Aside';
import {ProductLineItem} from '~/components/ProductLineItem';
import {CartSummary} from './CartSummary';
import {useFetchers} from 'react-router';
import { CartForm } from '@shopify/hydrogen';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
  onClose?: () => void;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart, onClose}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;

  const fetchers = useFetchers();
  const isCartMutating = fetchers.some((fetcher) => {
    if (fetcher.state === 'idle') return false;
    return fetcher.formData?.has(CartForm.INPUT_NAME);
  });

  return (
    <>
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} onClose={onClose} />
      <div className="cart-details pb-80 tablet:pb-12 tablet:px-12">
        <div aria-labelledby="cart-lines">
          <ul className='flex flex-col gap-8'>
            {(cart?.lines?.nodes ?? []).map((line) => (
              <ProductLineItem key={line.id} line={line} layout={layout} onClose={onClose} isCartMutating={isCartMutating}/>
            ))}
          </ul>
        </div>
      </div>
    </div>
    <div className=''>
      <CartSummary cart={cart} layout={layout} isCartMutating={isCartMutating} />
    </div>
    </>
  );
}

function CartEmpty({
  hidden = false,
  onClose,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
  onClose?: () => void;
}) {
  // Safely get close function - prefer onClose prop, fallback to Aside context
  const aside = AsideContext ? useContext(AsideContext) : null;

  return (
    <div hidden={hidden}>
      <br />
      <p className='text-regular-semi text-center px-12 pt-24'>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
    </div>
  );
}
