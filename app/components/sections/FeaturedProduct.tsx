import type {FC} from 'react';
import {Link} from 'react-router';
import {useLocalizedPath} from '~/hooks/useLocalePath';

export type FeaturedProductVariant = {
  id: string;
  title: string;
};

export type FeaturedProductData = {
  handle: string;
  variants: FeaturedProductVariant[];
};

export const FEATURED_PRODUCT_FRAGMENT = `#graphql
  fragment FeaturedProduct on Product {
    handle
    variants(first: 30) {
      nodes {
        id
        title
      }
    }
  }
` as const;

interface IFeaturedProductProps {
  product: FeaturedProductData;
  title: string;
  text: string;
  images: string[];
  className?: string;
}

export const FeaturedProduct: FC<IFeaturedProductProps> = ({
  product,
  title,
  text,
  images,
  className = '',
}) => {
  const withLocale = useLocalizedPath();

  return (
    <div
      className={`flex flex-col tablet:flex-row items-stretch gap-16 tablet:gap-24 ${className}`}
    >
      <div className="flex gap-12 flex-[3]">
        {images.map((url, idx) => (
          <div key={idx} className="flex-1 rounded-2xl overflow-hidden">
            <img
              src={url}
              alt={`${title} ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col justify-center flex-[2] tablet:pl-32">
        <h2 className="text-h1 mb-16">{title}</h2>
        <p className="text-regular mb-24 max-w-[600px]">{text}</p>

        {product.variants.length > 0 && (
          <div className="mb-32">
            <p className="font-semibold mb-8">Variants</p>
            <div className="flex flex-wrap gap-16">
              {product.variants.map((variant) => (
                <span key={variant.id} className="text-regular">
                  {variant.title}
                </span>
              ))}
            </div>
          </div>
        )}

        <Link
          to={withLocale(`/products/${product.handle}`)}
          prefetch="intent"
          className="inline-flex items-center justify-center rounded-xl bg-black text-white font-semibold px-24 py-16 max-w-[280px] hover:bg-gray-900 transition-colors"
        >
          shop now
        </Link>
      </div>
    </div>
  );
};
