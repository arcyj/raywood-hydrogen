import {useState} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
  SearchProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {useLocalizedPath} from '~/hooks/useLocalePath';

type ProductItemProduct =
  | CollectionItemFragment
  | ProductItemFragment
  | RecommendedProductFragment
  | SearchProductFragment;

type VariantForCard = {
  id: string;
  title: string;
  availableForSale: boolean;
  image?: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
  price: {amount: string; currencyCode: string};
  compareAtPrice?: {amount: string; currencyCode: string} | null;
};

function extractVariants(product: ProductItemProduct): VariantForCard[] {
  const raw = (product as unknown as {variants?: {nodes?: unknown[]}}).variants?.nodes;
  if (Array.isArray(raw) && raw.length > 0) return raw as VariantForCard[];

  const first = 'selectedOrFirstAvailableVariant' in product
    ? product.selectedOrFirstAvailableVariant
    : null;
  if (!first || !('id' in first) || !('price' in first)) return [];
  const v = first as {id: string; title?: string; availableForSale?: boolean; image?: VariantForCard['image']; price: VariantForCard['price']; compareAtPrice?: VariantForCard['compareAtPrice']};
  return [{
    id: v.id,
    title: v.title ?? '',
    availableForSale: v.availableForSale ?? true,
    image: v.image ?? null,
    price: v.price,
    compareAtPrice: v.compareAtPrice ?? null,
  }];
}

export function ProductItem({
  product,
  loading,
  className,
}: {
  product: ProductItemProduct;
  loading?: 'eager' | 'lazy';
  className?: string;
}) {
  const variantUrl = useVariantUrl(product.handle);
  const withLocale = useLocalizedPath();
  const variants = extractVariants(product);
  const [activeVariant, setActiveVariant] = useState<VariantForCard | null>(variants[0] ?? null);

  const image = activeVariant?.image ?? ('featuredImage' in product ? product.featuredImage : null);
  const price = activeVariant?.price;
  const compareAtPrice = activeVariant?.compareAtPrice;
  const availableForSale = activeVariant?.availableForSale ?? ('availableForSale' in product ? product.availableForSale : true);
  const showVariants = variants.length > 1;

  return (
    <div className={`overflow-hidden ${className ?? ''}`}>
      <Link
        to={withLocale(variantUrl)}
        prefetch="intent"
        viewTransition
        className="block"
      >
        <div className="aspect-[4/5] overflow-hidden">
          {image ? (
            <Image
              alt={(image as {altText?: string | null}).altText || product.title}
              data={image}
              loading={loading}
              sizes="(min-width: 768px) 400px, 100vw"
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="w-full h-full bg-lightGrey" />
          )}
        </div>
      </Link>

      <div className="px-12 pt-12 pb-16">
        <Link
          to={withLocale(variantUrl)}
          prefetch="intent"
          viewTransition
          className="block mb-4"
        >
          <h4 className="text-regular font-bold leading-tight">{product.title}</h4>
        </Link>

        {showVariants && (
          <div className="flex flex-wrap gap-12 mb-4">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveVariant(v)}
                className={`text-regular transition-colors ${
                  activeVariant?.id === v.id
                    ? 'font-bold text-black'
                    : 'text-gray font-medium'
                }`}
              >
                {v.title}
              </button>
            ))}
          </div>
        )}

        {price && (
          <div className="flex items-baseline gap-8">
            <span className={`text-medium font-bold ${compareAtPrice ? 'text-danger' : ''}`}>
              <Money data={price as Parameters<typeof Money>[0]['data']} />
            </span>
            {compareAtPrice && (
              <s className="text-regular text-gray">
                <Money data={compareAtPrice as Parameters<typeof Money>[0]['data']} />
              </s>
            )}
          </div>
        )}

        {!availableForSale && (
          <p className="text-small text-gray mt-4">Out of stock</p>
        )}
      </div>
    </div>
  );
}
