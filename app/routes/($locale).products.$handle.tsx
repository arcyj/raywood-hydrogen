import {redirect, useLoaderData, Await, useAsyncValue, Link} from 'react-router';
import {Suspense, useState} from 'react';
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
  Image,
  Money,
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
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import { Counter } from '~/components/ui/Counter';
import { ProductStockStatus } from '~/components/ui/ProductStockStatus';
import { ProductPageSkeleton } from '~/components/ProductPageSkeleton';
import { ShippingPictogram } from '~/components/icons/ShippingPictogram';
import { ReturnPictogram } from '~/components/icons/ReturnPictogram';
import { GuaranteePictogram } from '~/components/icons/GuaranteePictogram';
import { deliveryTime } from '~/helpers/deliveryTime';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { AddToCartButton } from '~/components/AddToCartButton';
import { Cart } from '~/components/icons';
import { getSeoMeta, getAbsoluteUrl, getProductJsonLd } from '~/lib/seo';

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
  // Critical: minimal product for meta, redirect, 404 — blocks only briefly for SEO
  const criticalData = await loadCriticalData(args);
  // Deferred: full product, breadcrumb, related products — page shows skeletons immediately
  const deferredData = loadDeferredData(args);

  return {...criticalData, ...deferredData};
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

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

type FullProductPayload = {
  product: ProductFragment;
  breadcrumbCollection: { title: string; handle: string } | null;
  breadcrumbParentCollection: { title: string; handle: string } | null;
};

/**
 * Load data for rendering the product page. This data is deferred and will be
 * fetched after the initial page load so the shell and skeletons render immediately.
 * If it's unavailable, the page should still 200. Don't throw here or it will 500.
 */
function loadDeferredData(args: Route.LoaderArgs) {
  const fullProductPromise = loadFullProductPayload(args);
  const relatedProductsPromise = fullProductPromise.then((full) =>
    loadRelatedProducts(args, full.product),
  );

  return {
    fullProduct: fullProductPromise,
    relatedProducts: relatedProductsPromise,
  };
}

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
          nodes: filtered.slice(0, 6), // Limit to 4 products
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
  const {fullProduct, relatedProducts} = data;

  return (
    <div className="container mx-auto">
      <Suspense fallback={<ProductPageSkeleton />}>
        <Await resolve={fullProduct}>
          <ProductContent relatedProductsPromise={relatedProducts} />
        </Await>
      </Suspense>
    </div>
  );
}

function ProductContent({
  relatedProductsPromise,
}: {
  relatedProductsPromise: Promise<{products: {nodes: Array<any>}} | null>;
}) {
  const isDesktop = useBreakpoints().isDesktop;
  const isTablet = useBreakpoints().isTablet;
  const fullData = useAsyncValue() as FullProductPayload;
  const {product, breadcrumbCollection, breadcrumbParentCollection} = fullData;
  const [productCount, setProductCount] = useState(1);

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

  const expansionData = parseMetaobjectFromMetafield(getMeta('custom', 'expansion'));
  const languageData = parseMetaobjectFromMetafield(getMeta('details', 'language'));
  const ageMetafield = getMeta('details', 'age');

  const handleCountChange = (val: number) => {
    setProductCount(val);
  };

  const ProductDescription = () => {
    return (
      <>
        <p className="text-h2 mt-44 mb-12">Product Description</p>
        <div className="flex flex-wrap gap-8">
          <ProductDetailItem
            label="Expansion"
            value={
              typeof expansionData?.title === 'string'
                ? expansionData.title
                : ''
            }
          />
          <ProductDetailItem
            value={
              (typeof languageData?.value === 'string'
                ? languageData.value
                : undefined) ??
              (typeof languageData?.name === 'string'
                ? languageData.name
                : '') ??
              ''
            }
            icon={
              typeof languageData?.icon === 'object' && languageData?.icon?.url
                ? languageData.icon
                : undefined
            }
          />
          <ProductDetailItem
            label="EAN"
            value={selectedVariant?.barcode ?? ''}
          />
          <ProductDetailItem
            label="Suitable Age"
            value={(ageMetafield?.value as string) ?? ''}
          />
        </div>
        {descriptionHtml.length > 0 ? (
          <div
            className="mt-24 text-regular"
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
          />
        ) : null}
      </>
    );
  }

  return (
    <div className="container overflow-hidden max-w-full max-tablet:mt-[40px]">
      <Breadcrumb
        collection={breadcrumbCollection ?? undefined}
        parentCollection={breadcrumbParentCollection ?? undefined}
        product={{title: product.title}}
        className="max-tablet:mt-44 max-tablet:mb-4 hidden tablet:block"
      />
      <div
        id="product-content"
        className="grid grid-cols-1 md:grid-cols-12 tablet:gap-64 min-w-0 tablet:pt-8"
      >
        <div className="min-w-0 tablet:col-span-7">
          <ProductGallery media={media.nodes} />
          {isTablet ? <ProductDescription /> : null}
        </div>
        <div className="product-main col-span-5">
          <ClientSticky
            top={80}
            enabled={isDesktop ? true : false}
            bottomBoundary="#product-content"
          >
            <div className="bg-white">
              <div className="flex items-center justify-between mb-8">
                <span className="text-medium-semi text-gray">{vendor}</span>
              </div>
              <h1 className="text-h2 mt-4 mb-8">{title}</h1>
              <div className="flex flex-col mb-24 mt-12">
                <div className="flex items-end gap-24 mb-12 justify-between">
                  <div className="flex gap-24 items-end">
                    <ProductPrice
                      price={selectedVariant?.price}
                      compareAtPrice={selectedVariant?.compareAtPrice}
                    />
                  </div>
                  <ProductStockStatus
                    availableForSale={!!selectedVariant?.availableForSale}
                    quantity={
                      (selectedVariant as {quantityAvailable?: number | null})
                        ?.quantityAvailable ?? undefined
                    }
                    className="self-end"
                  />
                </div>
                <div className="tablet:flex gap-12 mb-12 items-center">
                  {isTablet ? (
                    <>
                      <Counter
                        // label={
                        //   <span className="text-small mb-4">Quantity</span>
                        // }
                        count={productCount}
                        countChange={(val) => handleCountChange(val)}
                        maxCount={30}
                        minCount={1}
                        className="flex flex-col items-start justify-center"
                      />
                      <ProductForm
                        productOptions={productOptions}
                        selectedVariant={selectedVariant}
                        quantity={productCount}
                        className={`flex-1`}
                      />
                    </>
                  ) : null}
                  <AddToWishlistButton
                    variant={isTablet ? 'icon' : 'button'}
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
                  {!isTablet ? (
                    <>
                      <ProductForm
                        productOptions={productOptions}
                        selectedVariant={selectedVariant}
                        quantity={productCount}
                        className={`flex-1 mt-8`}
                      />
                    </>
                  ) : null}
                </div>
              </div>
              <Accordion className="mt-32" defaultOpenAll={false}>
                <Accordion.Item value="delivery">
                  <Accordion.Trigger>
                    <span className="flex items-center">
                      <ShippingPictogram size={44} className="mr-12" />
                      <span>
                        <p className="text-medium-semi">
                          Delivery {deliveryTime()}
                        </p>
                        <p className="text-medium">
                          Courier or parcel locker delivery
                        </p>
                      </span>
                    </span>
                  </Accordion.Trigger>
                  <Accordion.Content
                    data-state="open"
                    className="pb-24 px-12 pt-12"
                  >
                    <ShippingOptions />
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="returns">
                  <Accordion.Trigger>
                    <span className="flex items-center">
                      <ReturnPictogram size={44} className="mr-12" />
                      <span>
                        <p className="text-medium-semi">
                          14-Day Return & Cancellation Right
                        </p>
                      </span>
                    </span>
                  </Accordion.Trigger>
                  <Accordion.Content
                    data-state="open"
                    className="pb-24 px-12 pt-12"
                  >
                    <p className="text-regular">
                      If you are a consumer in the European Union, you have the
                      right to cancel your order within 14 days of receiving
                      your goods, without giving any reason.
                    </p>
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="payment">
                  <Accordion.Trigger>
                    <span className="flex items-center">
                      <GuaranteePictogram size={44} className="mr-12" />
                      <span>
                        <p className="text-medium-semi">
                          Secure payment powered by Shopify
                        </p>
                      </span>
                    </span>
                  </Accordion.Trigger>
                  <Accordion.Content
                    data-state="open"
                    className="pb-24 px-12 pt-12"
                  >
                    <p className="text-regular">
                      Fast, safe checkout backed by Shopify’s world-class
                      security.
                    </p>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion>
              {!isTablet ? <ProductDescription /> : null}
            </div>
          </ClientSticky>
        </div>
      </div>

      <RelatedProducts products={relatedProductsPromise} />
      {/* {!isTablet && selectedVariant?.availableForSale ? (
        <div className="sticky bottom-[66px]">
          <AddToCartButton
            showIcon={false}
            disabled={!selectedVariant || !selectedVariant.availableForSale}
            onClick={() => {
              open('cart');
            }}
            lines={
              selectedVariant
                ? [
                    {
                      merchandiseId: selectedVariant.id,
                      quantity: 1,
                      selectedVariant,
                    },
                  ]
                : []
            }
          >
            <span className='w-full flex justify-between items-center'>
              <span className="flex"><Cart size={20} className='mr-4' /> Add to cart</span> <Money data={selectedVariant.price} />
            </span>
          </AddToCartButton>
        </div>
      ) : null} */}
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

function RelatedProducts({
  products,
}: {
  products: Promise<{products: {nodes: Array<any>}} | null> | undefined;
}) {
  if (!products) return null;
  return (
    <div className="related-products my-48">
      <h2 className="text-large mb-24">Related Products</h2>
      <Suspense fallback={<div>Loading related products...</div>}>
        <Await resolve={products}>
          {(response) => {
            if (!response?.products?.nodes?.length) {
              return null;
            }
            return (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-16">
                {response.products.nodes.map((product) => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </div>
            );
          }}
        </Await>
      </Suspense>
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
  }
  query RelatedProducts(
    $country: CountryCode
    $language: LanguageCode
    $collectionHandle: String!
  ) @inContext(country: $country, language: $language) {
    collection(handle: $collectionHandle) {
      id
      products(first: 6) {
        nodes {
          ...RelatedProduct
        }
      }
    }
  }
` as const;
