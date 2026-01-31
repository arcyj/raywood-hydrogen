import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import { twClasses } from '~/helpers/twMerge';
import { ProductStockStatus } from './ui/ProductStockStatus';

export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  const productClasses = twClasses(["product-item bg-lightGrey rounded px-12 pt-12 pb-24 active:bg-accentGrey active:inset-shadow-sm hover:shadow-md transition-all duration-100 ease-in-out"], {
    'opacity-60': !product.availableForSale,
  }, );

  return (
    <Link
      className={productClasses}
      key={product.id}
      prefetch="intent"
      to={variantUrl}
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
          {product.vendor}
        </span>
        <h4 className="text-h4 pt-4 line-clamp-2 overflow-hidden text-ellipsis mb-8">{product.title}</h4>
        <div className="flex justify-between items-center">
          <span className="text-[18px] desktop:text-[22px] leading-[26px] font-bold">
            <Money data={product.priceRange.minVariantPrice} />
          </span>
          {!product.availableForSale ? <ProductStockStatus availableForSale={product.availableForSale} /> : null}
        </div>
      </div>
    </Link>
  );
}
