import {Await, useLoaderData} from 'react-router';
import {Suspense, useEffect, useRef, useState} from 'react';
import type {Route} from './+types/products.$handle';
import type {ProductFragment} from 'storefrontapi.generated';
import { ClientSticky } from '~/components/ClientSticky';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import { AddToWishlistButton } from '~/components/AddToWishlistButton';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductGallery} from '~/components/ProductGallery';
import {ProductForm} from '~/components/ProductForm';
import { ProductDetailItem } from '~/components/ui/ProductDetailItem';
import { ShippingOptions } from '~/components/ShippingOptions';
import {ProductItem} from '~/components/ProductItem';
import { Breadcrumb } from '~/components/sections/Breadcrumb';
import { Accordion } from '~/components/ui/Accordion';
import {getMetafield, parseMetaobjectFromMetafield} from '~/lib/metafields';
import { Counter } from '~/components/ui/Counter';
import { ProductStockStatus } from '~/components/ui/ProductStockStatus';
import { ShippingPictogram } from '~/components/icons/ShippingPictogram';
import { ReturnPictogram } from '~/components/icons/ReturnPictogram';
import {CopyCheck, Share} from 'lucide-react';
import { GuaranteePictogram } from '~/components/icons/GuaranteePictogram';
import { Button } from '~/components/ui/Button';
import { deliveryTime } from '~/helpers/deliveryTime';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { getSeoMeta, getAbsoluteUrl, getProductJsonLd } from '~/lib/seo';
import { SubscriptionForm } from '~/components/SubscriptionForm';
import { ProductOptions } from '~/components/ProductOptions';
import { ReviewsSlider } from '~/components/reviews/ReviewsSlider';
import { ImageTextSection, type ImageTextItem } from '~/components/sections/ImageTextSection';
import { useIsNotVisible } from '~/hooks/useIsNotVisible';
import { PaymentIcons } from '~/components/PaymentIcons';
import {
  createJudgeMeClientFromEnv,
  type PublicJudgeMeReview,
} from '~/lib/judgeme.server';
import { useFreeDelivery } from '~/hooks/useFreeDelivery';
import { useTranslation } from '~/lib/i18nContext';

export const meta: Route.MetaFunction = ({data, matches, location}) => {
  const product = data?.product;
  const title = product?.title ? `${product.title} | Playpeak` : 'Playpeak';
  const url = getAbsoluteUrl(matches ?? [], location);
  const descriptors = getSeoMeta({
    title,
    description: product?.description ?? undefined,
    imageUrl: product?.featuredImage?.url ?? undefined,
    url,
    type: 'product',
  });
  if (product) {
    descriptors.push({
      'script:ld+json': getProductJsonLd(product, url),
    });
  }
  return descriptors;
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  // Critical: minimal product for meta, redirect, 404 — blocks only briefly for SEO
  const criticalData = await loadCriticalData(args);
  // Await full product and related products. Deferred streaming caused infinite loading
  // on client-side navigation to locale-prefixed URLs (e.g. /ee/products/...).
  const fullProduct = await loadFullProductPayload(args);
  const relatedProducts = await loadRelatedProducts(args, fullProduct.product);

  return {
    ...deferredData,
    ...criticalData,
    fullProduct,
    relatedProducts,
  };
}

/**
 * Load data required for initial response: meta (title, canonical), redirect, 404.
 * Minimal product query keeps time-to-first-byte fast.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const result = await storefront.query<{
    product: {
      id: string;
      title: string;
      handle: string;
      description?: string | null;
      featuredImage?: { url: string } | null;
      selectedOrFirstAvailableVariant?: {
        price?: { amount: string; currencyCode: string } | null;
        availableForSale?: boolean | null;
      } | null;
    } | null;
  }>(MINIMAL_PRODUCT_QUERY, {variables: {handle, selectedOptions: []}});
  const product = result?.product;

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {product};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const judgeMe = createJudgeMeClientFromEnv(context.env);

  const reviews = judgeMe
    ? judgeMe.getPublicReviews().catch((error) => {
        console.error('Error fetching Judge.me reviews:', error);
        return [] as PublicJudgeMeReview[];
      })
    : Promise.resolve([] as PublicJudgeMeReview[]);

  return {reviews};
}

type FullProductPayload = {
  product: ProductFragment;
  breadcrumbCollection: { title: string; handle: string } | null;
  breadcrumbParentCollection: { title: string; handle: string } | null;
};

async function loadFullProductPayload({context, params, request}: Route.LoaderArgs): Promise<FullProductPayload> {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  const firstCollectionHandle = product.collections?.nodes?.[0]?.handle;
  let breadcrumbCollection: { title: string; handle: string } | null = null;
  let breadcrumbParentCollection: { title: string; handle: string } | null = null;

  if (firstCollectionHandle) {
    const breadcrumbResult = await context.storefront.query<{
      collection: { title: string; handle: string; parentCollection?: { reference?: { title: string; handle: string } | null } | null } | null;
    }>(COLLECTION_BREADCRUMB_QUERY, {
      variables: { handle: firstCollectionHandle },
    });
    const col = breadcrumbResult?.collection;
    if (col) {
      breadcrumbCollection = { title: col.title, handle: col.handle };
      const parentRef = col.parentCollection?.reference;
      if (parentRef) {
        breadcrumbParentCollection = { title: parentRef.title, handle: parentRef.handle };
      }
    }
  }

  return {
    product,
    breadcrumbCollection,
    breadcrumbParentCollection,
  };
}

/**
 * Load related products based on the current product's collections
 */
function loadRelatedProducts(
  {context}: Route.LoaderArgs,
  product: {id: string; collections?: {nodes?: Array<{handle: string}> | null} | null}
) {
  const {storefront} = context;
  const firstCollection = product.collections?.nodes?.[0];

  if (!firstCollection?.handle) {
    return Promise.resolve(null);
  }

  // Fetch related products from the same collection, excluding current product
  // This is deferred so it doesn't block the initial page render
  return storefront
    .query(RELATED_PRODUCTS_QUERY, {
      variables: {
        collectionHandle: firstCollection.handle,
        filters: {available: true}
      },
    })
    .then((result: {collection?: {products?: {nodes?: Array<{id: string}>}}}) => {
      // Filter out the current product from results
      const collectionProducts = result.collection?.products?.nodes || [];
      const filtered = collectionProducts.filter(
        (p: {id: string}) => p.id !== product.id
      );
      return {
        products: {
          nodes: filtered.slice(0, 4), // Limit to 4 products
        },
      };
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error('Error fetching related products:', error);
      return null;
    });
}

export default function Product() {
  const data = useLoaderData<typeof loader>();
  const {fullProduct, relatedProducts, reviews} = data;

  return (
    <div className="container-large mx-auto">
      <ProductContent
        fullProduct={fullProduct}
        relatedProducts={relatedProducts}
        reviews={reviews}
      />
    </div>
  );
}

function ProductContent({
  fullProduct,
  relatedProducts,
  reviews
}: {
  fullProduct: FullProductPayload;
  relatedProducts: {products: {nodes: Array<any>}} | null;
  reviews?: Promise<PublicJudgeMeReview[]> | PublicJudgeMeReview[];
}) {
  const { isDesktop, isTablet} = useBreakpoints();
  const isFreeDelivery = useFreeDelivery();
  const { t } = useTranslation();
  const fullData = fullProduct;
  const {product, breadcrumbCollection, breadcrumbParentCollection} = fullData;
  const [productCount, setProductCount] = useState(1);
  const [isUrlCopied, setIsUrlCopied] = useState(false);
  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMainFormVisible, mainFormRef] = useIsNotVisible();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {media, title, descriptionHtml, vendor, metafields} = product;

  const getMeta = (namespace: string, key: string) =>
    getMetafield(
      (metafields ?? []).filter(Boolean) as Array<{namespace?: string | null; key: string; [key: string]: unknown}>,
      namespace,
      key,
      {matchNullNamespace: true},
    );

  const isPreorder = getMeta('custom', 'preorder')?.value === 'true';

  const expansionData = parseMetaobjectFromMetafield(getMeta('custom', 'expansion'));
  const languageData = parseMetaobjectFromMetafield(getMeta('details', 'language'));
  const ageMetafield = getMeta('details', 'age');

  const handleCountChange = (val: number) => {
    setProductCount(val);
  };

  const copyCurrentUrlToClipboard = async () => {
    if (typeof window === 'undefined') return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsUrlCopied(true);

      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }

      copyResetTimeoutRef.current = setTimeout(() => {
        setIsUrlCopied(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy URL to clipboard:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="largeDesktop:container-large max-w-full">
      <Breadcrumb
        collection={breadcrumbCollection ?? undefined}
        parentCollection={breadcrumbParentCollection ?? undefined}
        product={{title: product.title}}
        className="max-tablet:mt-44 max-tablet:mb-4 hidden tablet:block"
      />

      {/* 2-column layout: gallery left, product info right */}
      <div
        id="product-content"
        className="grid grid-cols-1 desktop:grid-cols-12 desktop:gap-48 min-w-0 tablet:pt-8 items-start"
      >
        {/* Left: Gallery */}
        <div
          id="product-gallery-content"
          className="min-w-0 col-span-1 desktop:col-span-7"
        >
          <ClientSticky
            top={80}
            enabled={isDesktop}
            bottomBoundary="#product-content"
          >
            <ProductGallery
              media={media.nodes}
              selectedImage={selectedVariant?.image}
            />
          </ClientSticky>
        </div>

        {/* Right: All product info */}
        <div className="col-span-1 desktop:col-span-4">
          <div className="py-16 desktop:py-4 desktop:pl-8">
            {/* Vendor + preorder badge */}
            <div className="flex items-center justify-between mb-12">
              {isPreorder && (
                <span className="bg-yellow-500 text-white text-[11px] font-semibold px-8 py-2 rounded pointer-events-none">
                  {t('product.coming_soon')}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-h1 mb-20">{title}</h1>

            {/* Price + stock status */}
            <div className="flex items-end gap-24 mb-20 justify-between">
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
              {/* {!isPreorder ? (
                  <ProductStockStatus
                    availableForSale={!!selectedVariant?.availableForSale}
                    quantity={
                      (selectedVariant as {quantityAvailable?: number | null})
                        ?.quantityAvailable ?? undefined
                    }
                    className="self-end"
                  />
                ) : (
                  <span className="bg-yellow-500 text-white text-[11px] font-semibold px-8 py-2 rounded pointer-events-none">
                    {t('product.coming_soon')}
                  </span>
                )} */}
            </div>

            {/* Variant options */}
            <ProductOptions productOptions={productOptions} />

            {/* Counter + Add to Cart */}
            <div ref={mainFormRef} className="mt-16 flex flex-col gap-8">
              {isTablet && (
                <Counter
                  count={productCount}
                  countChange={(val) => handleCountChange(val)}
                  maxCount={30}
                  minCount={1}
                  className="flex flex-col items-start justify-center"
                />
              )}
              <ProductForm
                selectedVariant={selectedVariant}
                quantity={productCount}
                className="flex-1"
              />
            </div>

            {/* Wishlist + Share */}
            <div className="flex gap-8 mt-12">
              <AddToWishlistButton
                variant="button"
                className={`${!isTablet ? 'w-full' : null}`}
                product={selectedVariant}
                productData={{
                  id: product.id,
                  vendor: product.vendor,
                  featuredImage: (() => {
                    const firstMedia = media.nodes?.[0];
                    if (
                      firstMedia &&
                      'image' in firstMedia &&
                      firstMedia.image
                    ) {
                      return {
                        url: firstMedia.image.url,
                        altText: firstMedia.image.altText,
                      };
                    }
                    return null;
                  })(),
                }}
              />
              <Button
                type="button"
                IconBefore={isUrlCopied ? CopyCheck : Share}
                onClick={copyCurrentUrlToClipboard}
                className="wishlist-button w-full"
                variant="tertiary"
                size="small"
              >
                {isUrlCopied
                  ? t('product.copied_to_clipboard')
                  : t('product.share')}
              </Button>
            </div>

            {descriptionHtml.length > 0 && (
              <div className="mt-48 desktop:mt-24">
                <p className="text-h3 mb-16">{t('product.description')}</p>
                <div
                  className="text-regular product__description text-justify"
                  dangerouslySetInnerHTML={{__html: descriptionHtml}}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Image + text feature section */}
      <ImageTextSection
        className="mt-48 desktop:mt-64 -mx-16 tablet:-mx-32 largeDesktop:-mx-64"
        items={[
          {
            image:
              'https://cdn.shopify.com/s/files/1/0513/0049/9632/files/raimonds-color-2.heic?v=1777620133',
            title: 'Meet Raymond, start to finish',
            text: 'Handcrafted from raw materials with an eye to every smallest detail.\nOnly highest quality wood used which is carefully sourced',
          },
          {
            image:
              'https://cdn.shopify.com/s/files/1/0513/0049/9632/files/IMG_3662.heic?v=1777620086',
            title: 'Best quality materials',
            text: 'Handcrafted from raw materials with an eye to every smallest detail.\nOnly highest quality wood used which is carefully sourced',
          },
        ]}
      />

      {/* Reviews */}
      <div className="mt-24 desktop:mt-48">
        <DeferredReviews reviewsPromise={reviews} />
      </div>

      <RelatedProducts products={relatedProducts} />

      {/* Sticky Add to Cart — appears when the main form scrolls out of view on mobile */}
      {!isDesktop && (
        <div
          className={`fixed bg-transparent bottom-12 left-0 right-0 z-50 transition-transform duration-300 ${
            isMainFormVisible ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="px-12">
            <ProductForm
              selectedVariant={selectedVariant}
              quantity={productCount}
              className="flex-shrink-0 w-auto"
              showPrice
            />
          </div>
        </div>
      )}
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

function ReviewsSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="animate-pulse">
     <h2 className="text-h3 mt-24 pb-8">{t('product.reviews_heading')}</h2>
      <p className="text-[14px] font-semibold pb-24">
        {t('product.reviews_disclaimer')}
      </p>
      <div className="flex gap-12 overflow-hidden">
        {Array.from({length: 4}).map((_, i) => (
          <div
            key={i}
            className="min-w-[280px] h-[210px] tablet:min-w-[360px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-5/6 bg-gray-100 rounded" />
              <div className="h-3 w-2/3 bg-gray-100 rounded" />
            </div>
            <div className="mt-6 h-3 w-28 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsBlock({reviews}: {reviews: PublicJudgeMeReview[]}) {
  const { t } = useTranslation();
  if (!reviews?.length) return null;
  return (
    <>
      <h2 className="text-h3 mt-24 pb-8">{t('product.reviews_heading')}</h2>
      <p className="text-[14px] font-semibold pb-24">
        {t('product.reviews_disclaimer')}
      </p>
      <ReviewsSlider reviews={reviews} />
    </>
  );
}

function DeferredReviews({
  reviewsPromise,
}: {
  reviewsPromise?: Promise<PublicJudgeMeReview[]> | PublicJudgeMeReview[];
}) {
  if (!reviewsPromise) return null;

  if (Array.isArray(reviewsPromise)) {
    return <ReviewsBlock reviews={reviewsPromise} />;
  }

  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <Await resolve={reviewsPromise} errorElement={null}>
        {(resolvedReviews) => <ReviewsBlock reviews={resolvedReviews} />}
      </Await>
    </Suspense>
  );
}

function RelatedProducts({
  products,
}: {
  products: {products: {nodes: Array<any>}} | null;
}) {
  const { t } = useTranslation();
  if (!products?.products?.nodes?.length) return null;
  return (
    <div className="related-products my-48">
      <h2 className="text-h3 mt-24 mb-24">{t('product.related_products')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-16">
        {products.products.nodes.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

const MEDIA_FRAGMENT = `#graphql
  fragment Media on Media {
    __typename
    ... on MediaImage {
      __typename
      id
      image {
        id
        url
        altText
      }
    }
  }
` as const;

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    currentlyNotInStock
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    barcode
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    availableForSale
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    collections(first: 5) {
      nodes {
        id
        handle
      }
    }
    media(first: 7) {
      nodes {
        ...Media
      }
    }
    metafields(identifiers: [
      {namespace: "custom", key: "expansion"}
      {namespace: "custom", key: "preorder"}
      {namespace: "details", key: "language"}
      {namespace: "details", key: "age"}
    ]) {
      id
      namespace
      key
      value
      reference {
        ... on Metaobject {
          id
          type
          fields {
            key
            value
            reference {
              ... on Metaobject {
                id
                type
                fields {
                  key
                  value
                }
              }
              ... on MediaImage {
                id
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
  ${MEDIA_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const MINIMAL_PRODUCT_QUERY = `#graphql
  query MinimalProduct($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      featuredImage {
        url
      }
      selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions) {
        price {
          amount
          currencyCode
        }
        availableForSale
      }
    }
  }
` as const;

const COLLECTION_BREADCRUMB_QUERY = `#graphql
  query CollectionBreadcrumb($handle: String!) {
    collection(handle: $handle) {
      title
      handle
      parentCollection: metafield(namespace: "category", key: "parent") {
        reference {
          ... on Collection {
            title
            handle
          }
        }
      }
    }
  }
` as const;

const RELATED_PRODUCTS_QUERY = `#graphql
  fragment RelatedProduct on Product {
    id
    title
    handle
    vendor
    availableForSale
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      image {
        id
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    metafields(identifiers: [{namespace: "custom", key: "preorder"}]) {
      namespace
      key
      value
    }
  }
  query RelatedProducts(
    $country: CountryCode
    $language: LanguageCode
    $collectionHandle: String!
    $filters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    collection(handle: $collectionHandle) {
      id
      products(first: 6, filters:$filters) {
        nodes {
          ...RelatedProduct
        }
      }
    }
  }
` as const;
