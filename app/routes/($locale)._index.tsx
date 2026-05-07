import {Await, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import type {
  LatestAddedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import { Slider } from '~/components/Slider';
import { TopBanner } from '~/components/sections/TopBanner';
import { ButtonLink } from '~/components/ui/Link';
import { CollectionCards } from '~/components/sections/CollectionCards';
import { CollectionSlider } from '~/components/sections/CollectionSlider';
import { FeaturedCollection } from '~/components/sections/FeaturedCollection';
import {
  fetchCollectionsByHandles,
  fetchFeaturedCollectionsByHandles,
} from '~/lib/queries/collections';
import { getSeoMeta, getAbsoluteUrl } from '~/lib/seo';
import { SubscriptionForm } from '~/components/SubscriptionForm';
import { WideCollectionCards } from '~/components/sections/WideCollectionCards';
import { FeaturedProduct, FEATURED_PRODUCT_FRAGMENT } from '~/components/sections/FeaturedProduct';
import type { FeaturedProductData } from '~/components/sections/FeaturedProduct';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { useTranslation } from '~/lib/i18nContext';

export const meta: Route.MetaFunction = ({matches, location}) => {
  const url = getAbsoluteUrl(matches ?? [], location);
  return getSeoMeta({
    title: 'RaywoodStore',
    description: 'Premium wooden home fitness equipment',
    url,
    type: 'website',
  });
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const collectionHandles = [
    'pokemon-tcg',
    'magic-the-gathering',
    'lorcana-tcg',
    'one-piece',
    'banpresto',
    'dragon-shield'
  ];
  const collections = await fetchCollectionsByHandles(
    context.storefront,
    collectionHandles
  );
  return {collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
    const wideCollectionHandles = [
      'nintendo',
      'sports-cards',
      'pantasy',
  ];

  const wideCollections = fetchCollectionsByHandles(
    context.storefront,
    wideCollectionHandles
  ).catch((error: Error) => {
    console.error(error);
    return [];
  });

  const featuredCollectionHandles = [
    'pokemon-tcg',
    'magic-the-gathering',
  ];

  const fitnessEquipment = context.storefront
    .query(BEST_SELLING_COLLECTION_PRODUCTS_QUERY, {
      variables: {
        handle: 'fitness-equipment',
        first: 20,
        sortKey: 'BEST_SELLING',
        filters: [{available: true}],
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  const featuredSkippingRope = context.storefront
    .query(FEATURED_SKIPPING_ROPE_QUERY, {
      variables: {
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });
  const featuredABRoller = context.storefront
    .query(FEATURED_AB_ROLLER_QUERY, {
      variables: {
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    wideCollections,
    fitnessEquipment,
    featuredSkippingRope,
    featuredABRoller,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  console.log(data.fitnessEquipment)
  return (
    <div className="home">
      <div className="container-large mx-auto">
        <div className="tablet:col-span-2 mb-24">
          <TopBanner
            title="Handcrafted home fitness equipment"
            text="Made with precision, crafted with care and made for life."
            url="/collections/all"
            images={[
              'https://cdn.shopify.com/s/files/1/0513/0049/9632/files/DSCF4469.jpg?v=1777620200',
              'https://cdn.shopify.com/s/files/1/0513/0049/9632/files/DSCF4481.jpg?v=1777620201',
              'https://cdn.shopify.com/s/files/1/0513/0049/9632/files/DSCF4435.jpg?v=1777620202',
            ]}
          />
        </div>
        <section className="mb-24">
          <Suspense>
            <Await resolve={data.featuredSkippingRope}>
              {(response) => {
                const product = response?.product;
                if (!product) return null;
                const productData: FeaturedProductData = {
                  handle: product.handle,
                  variants: product.variants.nodes,
                };
                return (
                  <FeaturedProduct
                    product={productData}
                    title="Premium Leather Skipping Rope"
                    text="Upgrade your cardio workouts with a premium leather skipping rope designed for performance, durability, and style. Whether you're training at home or adding intensity to your routine, this rope delivers smooth, controlled movement every time."
                    images={[
                      'https://cdn.shopify.com/s/files/1/0513/0049/9632/files/walnut_skipping_1_white_IMG_3942-Photoroom_076c4657-1608-49ed-a267-180f1207f45b.png',
                      'https://cdn.shopify.com/s/files/1/0513/0049/9632/files/skipping_rope_smoked_oak_8dbdb5e9-7124-478d-8d03-39420f276b03.png',
                    ]}
                  />
                );
              }}
            </Await>
          </Suspense>
        </section>
        <section className="mb-12 grid grid-cols-1 gap-24">
          <CollectionSlider
            title="Wooden Home Fitness Equipment"
            collectionPath="/collections/wooden-gym-equipment"
            products={data.fitnessEquipment}
            className="mb-24 py-12"
          />
        </section>
        <section className="mb-24">
          <Suspense>
            <Await resolve={data.featuredABRoller}>
              {(response) => {
                const product = response?.product;
                if (!product) return null;
                const productData: FeaturedProductData = {
                  handle: product.handle,
                  variants: product.variants.nodes,
                };
                return (
                  <FeaturedProduct
                    product={productData}
                    title="Premium Wooden AB Roller"
                    text="Made from solid walnut wood, this roller combines natural strength with thoughtful design. The wheel features a precision-carved traction pattern, while genuine leather strips are carefully wrapped around the wheel to enhance grip and stability on the floor."
                    images={[
                      'https://cdn.shopify.com/s/files/1/0513/0049/9632/files/IMG-7646.png?v=1777479848',
                      'https://cdn.shopify.com/s/files/1/0513/0049/9632/files/87029B3D-AC5C-4356-BA85-E305113F2A96.png?v=1776847161',
                    ]}
                  />
                );
              }}
            </Await>
          </Suspense>
        </section>
      </div>
    </div>
  );
}


function CollectionProducts({
  products,
  title,
  text,
}: {
  products: Promise<LatestAddedProductsQuery | null>;
  title?: string;
  text?: string;
}) {
  return (
    <div className="">
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => {
            const collection = response?.collection;
            if (!collection) return null;

            return (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className='max-w-[650px]'>
                    <h2 className='text-h1 mb-8'>{title}</h2>
                    <p className="text-regular">
                      {text}
                    </p>
                  </div>
                  <ButtonLink
                    href={`/collections/${collection.handle}`}
                    variant='tertiary'
                    className="!hidden tablet:!flex"
                  >
                    View All
                  </ButtonLink>
                </div>
                <div className="products-grid products-grid--cols-">
                  {collection.products?.nodes
                    ? collection.products.nodes.map((product) => (
                        <ProductItem key={product.id} product={product} />
                      ))
                    : null}
                </div>
              </>
            );
          }}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    availableForSale
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      product {
        handle
        title
      }
    }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
    priceRange {
      minVariantPrice {
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
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

const LATEST_ADDED_PRODUCTS_QUERY = `#graphql
  fragment LatestAddedProduct on Product {
    id
    title
    handle
    vendor
    availableForSale
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      product {
        handle
        title
      }
    }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
    priceRange {
      minVariantPrice {
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
  query LatestAddedProducts ($country: CountryCode, $language: LanguageCode, $handle: String! $first: Int)
    @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $first) {
        nodes {
          ...LatestAddedProduct
        }
      }
    }
  }
` as const;

const BEST_SELLING_COLLECTION_PRODUCTS_QUERY = `#graphql
  fragment BestSellingProduct on Product {
    id
    title
    handle
    vendor
    availableForSale
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      product {
        handle
        title
      }
    }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
    priceRange {
      minVariantPrice {
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
  query BestSellingCollectionProducts (
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $first: Int
    $sortKey: ProductCollectionSortKeys
    $filters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $first, sortKey: $sortKey, filters: $filters) {
        nodes {
          ...BestSellingProduct
        }
      }
    }
  }
` as const;

const FEATURED_SKIPPING_ROPE_QUERY = `#graphql
  query FeaturedSkippingRope($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    product(handle: "leather-skipping-rope") {
      ...FeaturedProduct
    }
  }
  ${FEATURED_PRODUCT_FRAGMENT}
` as const;

const FEATURED_AB_ROLLER_QUERY = `#graphql
  query FeaturedSkippingRope($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    product(handle: "premium-wooden-ab-roller") {
      ...FeaturedProduct
    }
  }
  ${FEATURED_PRODUCT_FRAGMENT}
` as const;
