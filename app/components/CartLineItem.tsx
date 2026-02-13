import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, useAnalytics, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useContext, useEffect, useRef} from 'react';
import {AsideContext} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useLocalizedPath} from '~/hooks/useLocalePath';
import {useCartRoute} from '~/lib/cartRoute';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;
type CartLineLike = {
  id?: string;
  quantity?: number;
};

function getCartLines(cartLike: unknown): CartLineLike[] {
  if (!cartLike || typeof cartLike !== 'object') return [];
  const cart = cartLike as {
    lines?: { nodes?: CartLineLike[] } | CartLineLike[];
  };
  if (Array.isArray(cart.lines)) return cart.lines;
  return cart.lines?.nodes ?? [];
}

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
  onClose,
}: {
  layout: CartLayout;
  line: CartLine;
  onClose?: () => void;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const withLocale = useLocalizedPath();

  // Safely get close function - prefer onClose prop, fallback to Aside context
  const aside = AsideContext ? useContext(AsideContext) : null;
  const close = onClose || aside?.close;

  return (
    <li key={id} className="cart-line">
      {image && (
        <Image
          alt={title}
          aspectRatio="1/1"
          data={image}
          height={100}
          loading="lazy"
          width="auto"
          sizes='100'
        />
      )}

      <div>
        <Link
          prefetch="intent"
          to={withLocale(lineItemUrl)}
          onClick={() => {
            if (layout === 'aside' && close) {
              close();
            }
          }}
        >
          <p>
            <strong>{product.title}</strong>
          </p>
        </Link>
        <ProductPrice price={line?.cost?.totalAmount} />
        <ul>
          {selectedOptions.map((option) => (
            <li key={option.name}>
              <small>
                {option.name}: {option.value}
              </small>
            </li>
          ))}
        </ul>
        <CartLineQuantity line={line} />
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="cart-line-quantity">
      <small>Quantity: {quantity} &nbsp;&nbsp;</small>
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
        >
          <span>&#8722; </span>
        </button>
      </CartLineUpdateButton>
      &nbsp;
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
        >
          <span>&#43;</span>
        </button>
      </CartLineUpdateButton>
      &nbsp;
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  const cartRoute = useCartRoute();
  return (
    <CartForm
      fetcherKey={getRemoveKey(lineIds)}
      route={cartRoute}
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      {(fetcher) => (
        <CartLineRemoveButtonInner
          fetcher={fetcher}
          disabled={disabled}
          lineIds={lineIds}
        />
      )}
    </CartForm>
  );
}

function CartLineRemoveButtonInner({
  fetcher,
  disabled,
  lineIds,
}: {
  fetcher: { state: string; data?: { cart?: unknown; errors?: unknown[] } };
  disabled: boolean;
  lineIds: string[];
}) {
  const { publish, shop, cart, prevCart } = useAnalytics();
  const publishEvent = publish as unknown as (event: string, payload: Record<string, unknown>) => void;
  const previousStateRef = useRef<string>('idle');

  useEffect(() => {
    const wasNotIdle = previousStateRef.current !== 'idle';
    const isNowIdle = fetcher.state === 'idle';
    const hasData = fetcher.data && !fetcher.data.errors;

    if (wasNotIdle && isNowIdle && hasData && typeof window !== 'undefined') {
      const resultCart = fetcher.data?.cart ?? cart;
      const resultLines = getCartLines(resultCart);
      const prevLines = getCartLines(prevCart);

      lineIds.forEach((lineId) => {
        const currentLine = resultLines.find((line) => line?.id === lineId);
        const prevLine = prevLines.find((line) => line?.id === lineId);

        publishEvent('product_removed_from_cart', {
          cart: resultCart,
          prevCart,
          currentLine,
          prevLine,
          shop,
          url: window.location.href || '',
        });
      });

      publishEvent('cart_updated', {
        cart: resultCart,
        prevCart,
        shop,
      });
    }

    previousStateRef.current = fetcher.state;
  }, [fetcher.state, fetcher.data, lineIds, publish, shop, cart, prevCart]);

  return (
    <button disabled={disabled || fetcher.state !== 'idle'} type="submit">
      Remove
    </button>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const cartRoute = useCartRoute();
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route={cartRoute}
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {(fetcher) => (
        <CartLineUpdateButtonInner fetcher={fetcher} lines={lines}>
          {children}
        </CartLineUpdateButtonInner>
      )}
    </CartForm>
  );
}

function CartLineUpdateButtonInner({
  children,
  fetcher,
  lines,
}: {
  children: React.ReactNode;
  fetcher: { state: string; data?: { cart?: unknown; errors?: unknown[] } };
  lines: CartLineUpdateInput[];
}) {
  const { publish, shop, cart, prevCart } = useAnalytics();
  const publishEvent = publish as unknown as (event: string, payload: Record<string, unknown>) => void;
  const previousStateRef = useRef<string>('idle');

  useEffect(() => {
    const wasNotIdle = previousStateRef.current !== 'idle';
    const isNowIdle = fetcher.state === 'idle';
    const hasData = fetcher.data && !fetcher.data.errors;

    if (wasNotIdle && isNowIdle && hasData && typeof window !== 'undefined') {
      const resultCart = fetcher.data?.cart ?? cart;
      const resultLines = getCartLines(resultCart);
      const prevLines = getCartLines(prevCart);

      lines.forEach((lineInput) => {
        const currentLine = resultLines.find((line) => line?.id === lineInput.id);
        const prevLine = prevLines.find((line) => line?.id === lineInput.id);
        const currentQty = currentLine?.quantity ?? 0;
        const prevQty = prevLine?.quantity ?? 0;

        if (currentQty > prevQty) {
          publishEvent('product_added_to_cart', {
            cart: resultCart,
            prevCart,
            currentLine,
            prevLine,
            shop,
            url: window.location.href || '',
          });
        } else if (currentQty < prevQty) {
          publishEvent('product_removed_from_cart', {
            cart: resultCart,
            prevCart,
            currentLine,
            prevLine,
            shop,
            url: window.location.href || '',
          });
        }
      });

      publishEvent('cart_updated', {
        cart: resultCart,
        prevCart,
        shop,
      });
    }

    previousStateRef.current = fetcher.state;
  }, [fetcher.state, fetcher.data, lines, publish, shop, cart, prevCart]);

  return <>{children}</>;
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}

/**
 * Returns a unique key for the remove action. This is used to make sure remove actions
 * are properly tracked and don't conflict with update actions.
 * @param lineIds - line ids affected by the remove
 * @returns
 */
function getRemoveKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesRemove, ...lineIds].join('-');
}
