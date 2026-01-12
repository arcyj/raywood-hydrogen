import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useContext, useState, useRef, useEffect} from 'react';
import {AsideContext} from './Aside';
import {Counter} from '~/components/ui/Counter';
import type {
  CartApiQueryFragment,
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;
type Product = ProductItemFragment | CollectionItemFragment | RecommendedProductFragment;

type ProductLineItemProps =
  | {
      // Cart line mode
      line: CartLine;
      product?: never;
      layout?: CartLayout;
      onClose?: () => void;
      showCartControls?: boolean;
    }
  | {
      // Product mode
      line?: never;
      product: Product;
      layout?: never;
      onClose?: never;
      showCartControls?: false;
    };

/**
 * A flexible line item component that can display either a cart line item or a product.
 * When given a cart line, it displays with quantity controls and remove button.
 * When given a product, it displays as a simple product line item.
 */
export function ProductLineItem(props: ProductLineItemProps) {
  const isCartLine = 'line' in props && props.line;
  const isProduct = 'product' in props && props.product;

  if (isCartLine) {
    return <CartLineItemView {...props} />;
  }

  if (isProduct) {
    return <ProductView product={props.product} />;
  }

  return null;
}

/**
 * Renders a cart line item with quantity controls and remove button
 */
function CartLineItemView({
  line,
  layout,
  onClose,
  showCartControls = true,
}: {
  line: CartLine;
  layout?: CartLayout;
  onClose?: () => void;
  showCartControls?: boolean;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);

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
          width={100}
        />
      )}

      <div>
        <Link
          prefetch="intent"
          to={lineItemUrl}
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
        {selectedOptions.length > 0 && (
          <ul>
            {selectedOptions.map((option) => (
              <li key={option.name}>
                <small>
                  {option.name}: {option.value}
                </small>
              </li>
            ))}
          </ul>
        )}
        {showCartControls && <CartLineQuantity line={line} />}
      </div>
    </li>
  );
}

/**
 * Renders a product as a line item (without cart controls)
 */
function ProductView({product}: {product: Product}) {
  const productUrl = useVariantUrl(product.handle);
  const image = 'featuredImage' in product ? product.featuredImage : null;
  const price = 'priceRange' in product ? product.priceRange.minVariantPrice : null;

  return (
    <li className="product-line">
      {image && (
        <Image
          alt={image.altText || product.title}
          aspectRatio="1/1"
          data={image}
          height={100}
          loading="lazy"
          width={100}
        />
      )}

      <div>
        <Link prefetch="intent" to={productUrl}>
          <p>
            <strong>{product.title}</strong>
          </p>
        </Link>
        {price && <ProductPrice price={price} />}
        {'vendor' in product && product.vendor && (
          <small className="text-gray">{product.vendor}</small>
        )}
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * Uses the Counter component similar to the product page.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;

  return (
    <div className="cart-line-quantity">
      <CounterWithCartUpdate
        lineId={lineId}
        quantity={quantity}
        isOptimistic={!!isOptimistic}
      />
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * Counter component that updates the cart when quantity changes
 * Uses the same CartForm approach as the original CartLineItem
 */
function CounterWithCartUpdate({
  lineId,
  quantity,
  isOptimistic,
}: {
  lineId: string;
  quantity: number;
  isOptimistic: boolean;
}) {
  const [targetQuantity, setTargetQuantity] = useState<number>(quantity);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Sync with prop changes
  useEffect(() => {
    setTargetQuantity(quantity);
  }, [quantity]);

  // Auto-submit when targetQuantity differs from current quantity
  useEffect(() => {
    if (targetQuantity !== quantity && submitButtonRef.current) {
      // Small delay to ensure form is ready with new inputs
      const timer = setTimeout(() => {
        submitButtonRef.current?.click();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [targetQuantity, quantity]);

  const handleCountChange = (newQuantity: number) => {
    if (newQuantity === quantity || isOptimistic) return;
    setTargetQuantity(newQuantity);
  };

  return (
    <CartLineUpdateButton lines={[{id: lineId, quantity: targetQuantity}]}>
      <button
        ref={submitButtonRef}
        type="submit"
        style={{display: 'none'}}
        aria-hidden="true"
      />
      <Counter
        count={quantity}
        countChange={handleCountChange}
        minCount={1}
        maxCount={10}
        incrementDisabled={isOptimistic}
        decrementDisabled={quantity <= 1 || isOptimistic}
        className="flex flex-col items-start justify-center"
      />
    </CartLineUpdateButton>
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
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button disabled={disabled} type="submit">
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
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
