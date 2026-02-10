import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine, Money} from '@shopify/hydrogen';
import { TrashIcon } from '@radix-ui/react-icons';
import {useVariantUrl} from '~/lib/variants';
import {useCartRoute} from '~/lib/cartRoute';
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
import { IconButton } from './ui/IconButton';
import { AddToCartButton } from './AddToCartButton';
import {useLocalizedPath} from '~/hooks/useLocalePath';

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
      onRemove?: never;
      isCartMutating?: boolean;
    }
  | {
      // Product mode
      line?: never;
      product: Product;
      layout?: never;
      onClose?: () => void;
      showCartControls?: false;
      onRemove?: () => void;
      variantId?: string;
      variantAvailableForSale?: boolean;
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
    const productProps = props as Extract<ProductLineItemProps, {product: Product}>;
    return (
      <ProductView
        product={productProps.product}
        onRemove={productProps.onRemove}
        onClose={productProps.onClose}
        variantId={productProps.variantId}
        variantAvailableForSale={productProps.variantAvailableForSale}
      />
    );
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
  isCartMutating = false,
}: {
  line: CartLine;
  layout?: CartLayout;
  onClose?: () => void;
  showCartControls?: boolean;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const withLocale = useLocalizedPath();

  // Safely get close function - prefer onClose prop, fallback to Aside context
  const aside = AsideContext ? useContext(AsideContext) : null;
  const close = onClose || aside?.close;

  return (
    <li key={id} className="flex bg-lightGrey rounded-md px-4 py-8 w-full">
      {image && (
        <Image
          sizes="100"
          alt={title}
          aspectRatio="1/1"
          data={image}
          height={100}
          loading="lazy"
          width={100}
          className="p-4 mr-4 mix-blend-darken"
        />
      )}

      <div className="w-full">
        <Link
          prefetch="intent"
          to={withLocale(lineItemUrl)}
          onClick={() => {
            if (layout === 'aside' && close) {
              close();
            }
          }}
        >
          <h4 className="text-h4 pt-4 line-clamp-2 overflow-hidden text-ellipsis">
            {product.title}
          </h4>
        </Link>
        <div className="my-8 flex justify-between items-center flex-wrap">
          <ProductPrice size="small" price={line?.cost?.amountPerQuantity} />

          <div className="flex gap-4 items-end">
            <span className="text-medium-semi">total:</span>
            {isCartMutating ? (
              <div className="h-[20px] skeleton-shimmer rounded w-44 mt-4" />
            ) : (
              <ProductPrice size="small" price={line?.cost?.totalAmount} />
            )}
          </div>
        </div>

        {/* {selectedOptions.length > 0 && (
          <ul>
            {selectedOptions.map((option) => (
              <li key={option.name}>
                <small>
                  {option.name}: {option.value}
                </small>
              </li>
            ))}
          </ul>
        )} */}
        {showCartControls && <CartLineQuantity line={line} />}
      </div>
    </li>
  );
}

/**
 * Renders a product as a line item (without cart controls)
 */
function ProductView({
  product,
  onRemove,
  onClose,
  variantId,
  variantAvailableForSale,
}: {
  product: Product;
  onRemove?: () => void;
  onClose?: () => void;
  variantId?: string;
  variantAvailableForSale?: boolean;
}) {
  const productUrl = useVariantUrl(product.handle);
  const withLocale = useLocalizedPath();
  const image = 'featuredImage' in product ? product.featuredImage : null;
  const price = 'priceRange' in product ? product.priceRange.minVariantPrice : null;
  const aside = AsideContext ? useContext(AsideContext) : null;
  const close = onClose || aside?.close;

  // Build selectedVariant for optimistic cart: useOptimisticCart needs the full variant object
  // (with product and image) so the cart can show the line immediately before the server responds.
  const selectedVariantForCart = variantId
    ? {
        id: variantId,
        title: product.title,
        product: {
          id: product.id,
          title: product.title,
          handle: product.handle,
        },
        image: image ?? null,
      }
    : null;

  return (
    <li className="product-line flex bg-lightGrey rounded-md px-4 py-8">
      {image && (
        <Link
          to={withLocale(productUrl)}
          onClick={onClose}
          prefetch="intent"
          className="flex-shrink-0"
        >
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            height={100}
            loading="lazy"
            width={100}
            className="p-4 mr-4 mix-blend-darken"
            sizes="100"
          />
        </Link>
      )}

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {'vendor' in product && product.vendor && (
          <p className="text-sm text-gray-600">{product.vendor}</p>
        )}
        <Link
          prefetch="intent"
          to={withLocale(productUrl)}
          onClick={onClose}
          className="hover:underline"
        >
          <h4 className="text-h4 pt-4 line-clamp-2 overflow-hidden text-ellipsis">{product.title}</h4>
        </Link>
        {price ? <ProductPrice price={price} size="small" /> : <div className="h-12 skeleton-shimmer rounded w-24 mt-4" />}
        <div className="mt-auto flex gap-8 items-center flex-wrap">
          {variantId && selectedVariantForCart ? (
            <AddToCartButton
              size='small'
              disabled={variantAvailableForSale === false}
              lines={[
                {
                  merchandiseId: variantId,
                  quantity: 1,
                  selectedVariant: selectedVariantForCart,
                },
              ]}
              onSuccess={() => {
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ Product added to cart from wishlist:', product.title, variantId);
                }
              }}
            >
              {variantAvailableForSale === false ? 'Sold out' : 'Add to cart'}
            </AddToCartButton>
          ) : (
            <span className="text-sm text-gray-500">Variant not available</span>
          )}
          {onRemove && <WishlistRemoveButton onRemove={onRemove} />}
        </div>
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
    <div className="cart-line-quantity justify-between">
      <CounterWithCartUpdate
        lineId={lineId}
        quantity={quantity}
        isOptimistic={!!isOptimistic}
        className="mr-8"
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
  className
}: {
  lineId: string;
  quantity: number;
  isOptimistic: boolean;
  className?: string;
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
        className={`flex flex-col items-start justify-center ${className}`}
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
  const cartRoute = useCartRoute();
  return (
    <CartForm
      fetcherKey={getRemoveKey(lineIds)}
      route={cartRoute}
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      {(fetcher) => (
        <IconButton
          variant="outlined"
          Icon={TrashIcon}
          disabled={disabled || fetcher.state !== 'idle'}
          type="submit"
          className='hover:text-danger hover:border-danger'
        />
      )}
    </CartForm>
  );
}

/**
 * A button that removes an item from the wishlist.
 * Uses the same IconButton styling as CartLineRemoveButton for consistency.
 */
function WishlistRemoveButton({
  onRemove,
}: {
  onRemove: () => void;
}) {
  return (
    <IconButton
      variant="filled"
      Icon={TrashIcon}
      onClick={onRemove}
      disabled={false}
    />
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
  const cartRoute = useCartRoute();

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route={cartRoute}
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

/**
 * Returns a unique key for the remove action. This is used to make sure remove actions
 * are properly tracked and don't conflict with update actions.
 * @param lineIds - line ids affected by the remove
 * @returns
 */
function getRemoveKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesRemove, ...lineIds].join('-');
}
