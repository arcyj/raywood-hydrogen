import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ProductPrice} from '~/components/ProductPrice';
import {ButtonLink} from '~/components/ui/Link';
import {useLocalizedPath} from '~/hooks/useLocalePath';
import {useAside} from '~/components/Aside';
import { ShoppingCart } from 'lucide-react';
import { useTranslation } from '~/lib/i18nContext';

export type GiggleMonsterProductCardProduct = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {url: string; altText?: string | null; width?: number; height?: number} | null;
  selectedOrFirstAvailableVariant?: {
    id: string;
    availableForSale: boolean;
    price: {amount: string; currencyCode: string};
    compareAtPrice?: {amount: string; currencyCode: string} | null;
  } | null;
};

export function GiggleMonsterProductCard({
  product,
  variant = 'pink',
  sectionId = 'ohku',
}: {
  product: GiggleMonsterProductCardProduct;
  variant?: 'blue' | 'pink';
  sectionId?: string;
}) {
  const withLocale = useLocalizedPath();
  const {open} = useAside();
  const { t } = useTranslation();

  if (!product?.id) return null;

  const variantNode = product.selectedOrFirstAvailableVariant;
  const buttonDisabled = !variantNode || !variantNode.availableForSale;
  const productPath = `/products/${product.handle}`;
  const productUrl = withLocale(productPath);
  // Buy now: /cart/{variantId}:1 — cart.$lines loader adds to cart and redirects to checkout
  const variantIdNumeric = variantNode?.id?.replace(/^gid:\/\/shopify\/ProductVariant\//, '') ?? '';
  const buyNowPath = variantIdNumeric ? `/cart/${variantIdNumeric}:1` : productPath;

  const cardStyle =
    variant === 'blue'
      ? {background: 'linear-gradient(180deg, rgba(221, 238, 249) 35%, rgba(158, 207, 236) 100%)'}
      : {background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 35%, rgba(227, 169, 183, 0.6) 100%)'};

  return (
    <div className="giggle-monster-product-card">
      <div
        className="min-w-[300px] max-w-[400px] px-16 pt-12 pb-24 shadow-md hover:shadow-lg transition duration-150 ease-in-out rounded-lg flex flex-col items-center gap-8 backdrop-opacity-[0.15] backdrop-blur-lg"
        style={cardStyle}
      >
        <Link to={productUrl} className="block no-underline w-full" prefetch="intent" viewTransition>
          {product.featuredImage && (
            <div className="relative w-full">
              <Image
                data={{url: product.featuredImage.url, altText: product.featuredImage.altText ?? product.title}}
                width={600}
                height={product.featuredImage.height ?? 400}
                className="h-[220px] w-full mb-12 object-contain"
                loading="lazy"
                sizes="(min-width: 750px) 300px, 100vw"
              />
            </div>
          )}

          <div className="w-full">
            <h3 className="text-[18px] font-semibold !leading-[22px] pt-4 text-left overflow-hidden text-black mb-8">
              {product.title}
            </h3>

            <div className="flex items-end justify-start min-h-[58px] pb-16">
              <ProductPrice
                price={variantNode?.price ?? undefined}
                compareAtPrice={variantNode?.compareAtPrice ?? undefined}
                size="large"
                className="flex items-end justify-center"
              />
            </div>
          </div>
        </Link>

        <div className="w-full">
          <div className="product-form" data-section-id={sectionId}>
            <div className="tablet:flex gap-8">
              <ButtonLink
                href={buyNowPath}
                variant="primary"
                size="large"
                className="relative w-full tablet:w-1/2 mb-8"
                disabled={buttonDisabled}
              >
                {t('product.buy_now')}
              </ButtonLink>

              {variantNode && (
                <div className="w-full tablet:w-1/2 mb-8">
                  <AddToCartButton
                    disabled={buttonDisabled}
                    onClick={() => open('cart')}
                    lines={[{merchandiseId: variantNode.id, quantity: 1}]}
                    size="large"
                    variant="tertiary"
                    showIcon
                  >
                    <ShoppingCart size={18} className="mr-8"/>
                    {!variantNode.availableForSale ? t('product.sold_out') : t('product.add_to_cart')}
                  </AddToCartButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
