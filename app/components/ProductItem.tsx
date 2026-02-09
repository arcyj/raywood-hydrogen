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

type ProductItemProduct =
  | CollectionItemFragment
  | ProductItemFragment
  | RecommendedProductFragment
  | SearchProductFragment;

export function ProductItem({
  product,
  loading,
}: {
  product: ProductItemProduct;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const withLocale = useLocalizedPath();
  const variant = 'selectedOrFirstAvailableVariant' in product ? product.selectedOrFirstAvailableVariant : undefined;
  const image = variant?.image ?? ('featuredImage' in product ? product.featuredImage : undefined);
  const price = variant?.price ?? ('priceRange' in product ? product.priceRange?.minVariantPrice : undefined);
  const compareAtPrice = 'selectedOrFirstAvailableVariant' in product ? product.selectedOrFirstAvailableVariant?.compareAtPrice : undefined;
  console.log("compareAtPrice", price, compareAtPrice)
  const availableForSale =
    (variant as { availableForSale?: boolean } | undefined)?.availableForSale ??
    ('availableForSale' in product ? product.availableForSale : true);

  const productClasses = twClasses(["product-item bg-lightGrey rounded px-12 pt-12 pb-24 active:bg-accentGrey active:inset-shadow-sm hover:shadow-md transition-all duration-100 ease-in-out"], {
    'opacity-60': !availableForSale,
  }, );

  return (
    <Link
      className={productClasses}
      key={product.id}
      prefetch="intent"
      to={withLocale(variantUrl)}
      viewTransition
    >
      <div>
        {image && (
          <div className="mix-blend-darken">
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
        <h4 className="text-h4 pt-4 line-clamp-2 overflow-hidden text-ellipsis mb-8">{product.title}</h4>
        <div className="flex justify-between items-center">
          <div className='flex items-end'>
            {price && (
              <span className={`text-[18px] desktop:text-[22px] leading-[26px] font-bold ${compareAtPrice ? 'text-danger mr-4' : null}`}>
                <Money data={price} />
              </span>
            )}
            {compareAtPrice && (
              <s className="text-[13px] desktop:text-[15px] leading-[22px] font-semibold text-gray">
                <Money data={compareAtPrice} />
              </s>
            )}
          </div>
          {!availableForSale ? <ProductStockStatus availableForSale={availableForSale} /> : null}
        </div>
      </div>
    </Link>
  );
}
