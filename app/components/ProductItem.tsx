import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
  SearchProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import { twClasses } from '~/helpers/twMerge';
import { ProductStockStatus } from './ui/ProductStockStatus';
import {useLocalizedPath} from '~/hooks/useLocalePath';
import { AddToCartButton } from './AddToCartButton';
import { usePlaypeak } from '~/lib/playpeakContext';
import { useBreakpoints } from '~/hooks/useBreakpoints';

type ProductItemProduct =
  | CollectionItemFragment
  | ProductItemFragment
  | RecommendedProductFragment
  | SearchProductFragment;

type VariantWithId = { id: string };
type VariantWithImage = { image?: { altText?: string | null } | null };
type VariantPrice = NonNullable<SearchProductFragment['selectedOrFirstAvailableVariant']>['price'];

function hasVariantId(variant: unknown): variant is VariantWithId {
  return !!variant && typeof variant === 'object' && 'id' in variant;
}

function hasVariantImage(variant: unknown): variant is VariantWithImage {
  return !!variant && typeof variant === 'object' && 'image' in variant;
}

function getVariantPrice(variant: unknown): VariantPrice | undefined {
  if (!variant || typeof variant !== 'object' || !('price' in variant)) return undefined;
  return (variant as { price?: VariantPrice }).price;
}

export function ProductItem({
  product,
  loading,
}: {
  product: ProductItemProduct;
  loading?: 'eager' | 'lazy';
}) {
  const isDesktop = useBreakpoints().isDesktop;
  const variantUrl = useVariantUrl(product.handle);
  const withLocale = useLocalizedPath();
  const { openCart } = usePlaypeak();
  const variant = 'selectedOrFirstAvailableVariant' in product ? product.selectedOrFirstAvailableVariant : undefined;
  const variantWithId = hasVariantId(variant) ? variant : undefined;
  const variantWithImage = hasVariantImage(variant) ? variant : undefined;
  const image = variantWithImage?.image ?? ('featuredImage' in product ? product.featuredImage : undefined);
  const price =
    getVariantPrice(variant) ??
    ('priceRange' in product ? product.priceRange?.minVariantPrice : undefined);
  const compareAtPrice = 'selectedOrFirstAvailableVariant' in product ? product.selectedOrFirstAvailableVariant?.compareAtPrice : undefined;

  const availableForSale =
    (variant as { availableForSale?: boolean } | undefined)?.availableForSale ??
    ('availableForSale' in product ? product.availableForSale : true);

  const productClasses = twClasses(["relative product-item bg-lightGrey rounded px-12 pt-12 pb-24 active:bg-accentGrey active:inset-shadow-sm hover:shadow-md transition-all duration-100 ease-in-out"], {
    'opacity-60': !availableForSale,
  }, );

  return (
    <div className={productClasses} key={product.id}>
      <div className="relative">
        <Link
          className="block"
          prefetch="intent"
          to={withLocale(variantUrl)}
          viewTransition
        >
          {image && (
            <div className="mix-blend-darken ">
              <Image
                alt={image.altText || product.title}
                aspectRatio="1/1"
                data={image}
                loading={loading}
                sizes="(min-width: 100px) 400px, 100vw"
                width="auto"
                height="auto"
              />
            </div>
          )}
          <span className="text-small text-gray pt-4">
            {'vendor' in product ? product.vendor : ''}
          </span>
          <h4 className="text-h4 pt-4 line-clamp-2 overflow-hidden text-ellipsis mb-8 h-[40px]">
            {product.title}
          </h4>
          <div className="flex justify-between items-center">
            <div className="flex items-center justify-between w-full min-h-[40px]">
              <div className="flex flex-col">
                {price && (
                  <span
                    className={`text-[18px] desktop:text-[22px] leading-[26px] font-bold ${compareAtPrice ? 'text-danger mt-4' : null}`}
                  >
                    <Money data={price} />
                  </span>
                )}
                {compareAtPrice && (
                  <s className="text-[13px] desktop:text-[15px] leading-[22px] font-bold text-gray">
                    <Money data={compareAtPrice} />
                  </s>
                )}
              </div>
              {availableForSale && variantWithId ? (
                <span className="w-[60px] shrink-0" aria-hidden />
              ) : null}
            </div>
            {!availableForSale ? (
              <ProductStockStatus availableForSale={availableForSale} />
            ) : null}
          </div>
        </Link>
        {availableForSale && variantWithId ? (
          <div className="absolute bottom-0 right-0 z-1 h-[40px]">
            <AddToCartButton
              onClick={openCart}
              lines={[
                {
                  merchandiseId: variantWithId.id,
                  quantity: 1,
                  selectedVariant: variant,
                },
              ]}
              variant="tertiary"
              size="small"
            >
              {isDesktop ? 'Add' : ''}
            </AddToCartButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}
