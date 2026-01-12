import {redirect, useLoaderData, Await} from 'react-router';
import {Suspense, useState} from 'react';
import type {Route} from './+types/products.$handle';
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
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import { Counter } from '~/components/ui/Counter';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  // Now that we have the product, we can pass it to deferred data
  const deferredDataWithProduct = loadDeferredDataWithProduct(args, criticalData.product);

  return {...criticalData, relatedProducts: deferredDataWithProduct};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // This function is kept for future use
  return {};
}

/**
 * Load related products based on the current product's collections
 */
function loadDeferredDataWithProduct(
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
  const {product, relatedProducts} = data;
  const [productCount, setProductCount] = useState(1);

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {media, title, descriptionHtml, vendor, metafields} = product;

  // Find the expansion metaobject metafield
  // Handles cases where metafield might be null, or namespace might be null, undefined, or empty
  const expansionMetafield = metafields?.find(
    (m: {namespace?: string | null; key: string} | null) => {
      if (!m) return false;
      const hasMatchingNamespace = m.namespace === 'custom' || !m.namespace;
      return hasMatchingNamespace && m.key === 'expansion';
    }
  );

  // Access the metaobject reference
  const expansionMetaobject = expansionMetafield?.reference as
    | {
        id: string;
        type: string;
        fields: Array<{
          key: string;
          value: string;
          reference?: unknown;
        }>;
      }
    | undefined;

  // Convert metaobject fields array to an object for easier access
  const expansionData = expansionMetaobject?.fields.reduce(
    (acc, field) => {
      acc[field.key] = field.value;
      return acc;
    },
    {} as Record<string, string>
  );

    const handleCountChange = (val: number) => {
      setProductCount(val);
    };

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-32 min-w-0">
        <div className="min-w-0">
          <ProductGallery media={media.nodes} />
        </div>
        <div className="product-main">
          <span className="text-small text-gray">{vendor}</span>
          <h1 className="text-h1 mt-4 mb-12">{title}</h1>
          <div className="flex items-end justify-between mb-24">
            <div>
              <Counter
                label={<span className="text-small mb-4">Amount</span>}
                count={productCount}
                countChange={(val) => handleCountChange(val)}
                maxCount={10}
                minCount={1}
                className="flex flex-col items-start justify-center"
              />
            </div>
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            quantity={productCount}
          />
          <AddToWishlistButton
            variant='icon'
            product={selectedVariant}
            productData={{
              id: product.id,
              vendor: product.vendor,
              featuredImage: (() => {
                const firstMedia = media.nodes?.[0];
                if (firstMedia && 'image' in firstMedia && firstMedia.image) {
                  return {
                    url: firstMedia.image.url,
                    altText: firstMedia.image.altText,
                  };
                }
                return null;
              })(),
            }}
          />
          <p className='text-large mt-32'>Description</p>
          <div className="mt-12">
            <ProductDetailItem label="EAN" value={selectedVariant?.barcode} />
            <ProductDetailItem
              label="Expansion"
              value={expansionData?.title || ''}
            />
            <ProductDetailItem
              label="Recommended Age"
              value={expansionData?.age || ''}
            />
            <ProductDetailItem
              label="Language"
              value={expansionData?.language || ''}
            />
          </div>
          <div className="mt-24 text-regular" dangerouslySetInnerHTML={{__html: descriptionHtml}} />
          <ShippingOptions />
        </div>
      </div>

      {relatedProducts && <RelatedProducts products={relatedProducts} />}
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-16">
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
      {namespace: "custom", key: "language"}
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

const RELATED_PRODUCTS_QUERY = `#graphql
  fragment RelatedProduct on Product {
    id
    title
    handle
    vendor
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
