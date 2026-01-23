import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

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
  return (
    <Link
      className="product-item bg-lightGrey rounded px-12 pt-12 pb-24 active:bg-accentGrey active:inset-shadow-sm hover:shadow-md transition-all duration-100 ease-in-out"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
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
            />
          </div>
        )}
        <span className="text-small text-gray pt-4">
          {product.vendor}
        </span>
        <h4 className="text-h4 pt-4 line-clamp-2 overflow-hidden text-ellipsis">{product.title}</h4>
        <span className="text-[18px] desktop:text-[22px] leading-[26px] font-bold">
          <Money data={product.priceRange.minVariantPrice} />
        </span>
      </div>
    </Link>
  );
}
