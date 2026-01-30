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
import { Breadcrumb } from '~/components/sections/Breadcrumb';
import { Accordion } from '~/components/ui/Accordion';
import {getMetafield, parseMetaobjectFromMetafield} from '~/lib/metafields';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import { Counter } from '~/components/ui/Counter';
import { ProductStockStatus } from '~/components/ui/ProductStockStatus';

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

  // Fetch first collection's breadcrumb data (title + parent) for breadcrumb
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
  const {product, relatedProducts, breadcrumbCollection, breadcrumbParentCollection} = data;
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

  const getMeta = (namespace: string, key: string) =>
    getMetafield(metafields, namespace, key, {matchNullNamespace: true});

  const expansionData = parseMetaobjectFromMetafield(getMeta('custom', 'expansion'));
  const languageData = parseMetaobjectFromMetafield(getMeta('details', 'language'));
  const ageMetafield = getMeta('details', 'age');

    const handleCountChange = (val: number) => {
      setProductCount(val);
    };


  return (
    <div className="container mx-auto">
      <Breadcrumb
        collection={breadcrumbCollection ?? undefined}
        parentCollection={breadcrumbParentCollection ?? undefined}
        product={{title: product.title}}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-64 min-w-0">
        <div className="min-w-0">
          <ProductGallery media={media.nodes} />
        </div>
        <div className="product-main">
          <span className="text-small text-gray">{vendor}</span>
          <h1 className="text-h1 mt-4 mb-12">{title}</h1>
          <ProductStockStatus
            availableForSale={!!selectedVariant?.availableForSale}
            quantity={selectedVariant?.quantityAvailable ?? undefined}
            className="mb-12"
          />
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
          <div className="flex gap-12">
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
              quantity={productCount}
              className="flex-1"
            />
            <AddToWishlistButton
              variant="icon"
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
          </div>
          <Accordion className="mt-32">
            <Accordion.Item value="specification">
              <Accordion.Trigger>
                <p className="text-large">Specification</p>
              </Accordion.Trigger>
              <Accordion.Content data-state="open" className='pb-12'>
                <div className="mt-12 grid tablet:grid-cols-2">
                  <ProductDetailItem
                    label="Expansion"
                    value={
                      typeof expansionData?.title === 'string' ? expansionData.title : ''
                    }
                  />
                  <ProductDetailItem label="EAN" value={selectedVariant?.barcode ?? ''} />
                  <ProductDetailItem
                    label="Recommended Age"
                    value={(ageMetafield?.value as string) ?? ''}
                  />
                  <ProductDetailItem
                    label="Language"
                    value={
                      (typeof languageData?.value === 'string' ? languageData.value : undefined) ??
                      (typeof languageData?.name === 'string' ? languageData.name : '') ??
                      ''
                    }
                    icon={
                      typeof languageData?.icon === 'object' && languageData?.icon?.url
                        ? languageData.icon
                        : undefined
                    }
                  />
                </div>
              </Accordion.Content>
            </Accordion.Item>
            {descriptionHtml.length > 0 ?
              <Accordion.Item value="description">
                <Accordion.Trigger>
                  <p className="text-large">Description</p>
                </Accordion.Trigger>
                <Accordion.Content data-state="open" className='pb-12'>
                  <div
                    className="mt-24 text-regular"
                    dangerouslySetInnerHTML={{__html: descriptionHtml}}
                  />
                </Accordion.Content>
              </Accordion.Item>
            : null}
             <Accordion.Item value="shipping">
                <Accordion.Trigger>
                  <p className="text-large">Shipping Options</p>
                </Accordion.Trigger>
                <Accordion.Content data-state="open" className='pb-12'>
                  <ShippingOptions />
                </Accordion.Content>
              </Accordion.Item>
          </Accordion>
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
