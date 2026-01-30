import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections.$handle';

import {getPaginationVariables, Analytics, flattenConnection} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

// App
import { usePlaypeak } from "~/lib/playpeakContext";

// Components
import { Filter } from '~/components/icons';
import { Button } from '~/components/ui/Button';
import {ProductItem} from '~/components/ProductItem';
import { SortByFilter } from '~/components/filters/SortByFilter';
import {ProductItemSkeleton} from '~/components/ProductItemSkeleton';
import { ChildCollectionSlider } from '~/components/sections/ChildCollectionSlider';
import { Breadcrumb } from '~/components/sections/Breadcrumb';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

// Helpers
import {parseAsCurrency} from '~/helpers/parseAsCurrency';
import { getSortValuesFromParam } from '~/helpers/getSortValuesFromParam';
import {FILTER_URL_PREFIX} from '../helpers/const';

// Types
import type { SortParam } from '~/helpers/getSortValuesFromParam';
import type { ProductFilter } from "@shopify/hydrogen/storefront-api-types";
import type {ProductItemFragment, CollectionQuery} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
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
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 24,
  });
  const locale = storefront.i18n;


  if (!handle) {
    throw redirect('/collections');
  }

  const searchParams = new URL(request.url).searchParams;
  const { sortKey, reverse } = getSortValuesFromParam(
    searchParams.get("sort") as SortParam,
  );

  const filters = [...searchParams.entries()].reduce((flt, [key, value]) => {
    if (key.startsWith(FILTER_URL_PREFIX)) {
      const filterKey = key.substring(FILTER_URL_PREFIX.length);
      flt.push({
        [filterKey]: JSON.parse(value),
      });
    }
    return flt;
  }, [] as ProductFilter[]);

  const [{collection, collections}] = await Promise.all([
    storefront.query<CollectionQuery>(COLLECTION_QUERY, {
      variables: {
        handle,
        ...paginationVariables,
        filters,
        sortKey,
        reverse,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  // Fetch child collections from metafield references
  let childCollections: Array<{id: string; title: string; handle: string; image?: {url: string; }}> = [];

  const metafield = collection.metafield;
  if (metafield && 'references' in metafield && metafield.references && 'nodes' in metafield.references) {
    const references = metafield.references as {nodes: Array<unknown>};
    if (references.nodes && references.nodes.length > 0) {
      type CollectionNode = {id: string; title: string; handle: string; image?: {url: string; } | null};
      childCollections = references.nodes
        .filter((node: unknown): node is CollectionNode =>
          node !== null && typeof node === 'object' && 'title' in node && 'handle' in node
        )
        .map((node: CollectionNode) => ({
          id: node.id,
          title: node.title,
          handle: node.handle,
          image: node.image || undefined,
        }));
    }
  }

  type CollectionWithParent = typeof collection & {parentCollection?: {reference?: {handle: string; title: string} | null} | null};
  const parentRef = (collection as CollectionWithParent).parentCollection?.reference;
  const parentCollection = parentRef ? { title: parentRef.title, handle: parentRef.handle } : null;

  const allFilterValues = collection.products.filters.flatMap(
    (filter) => filter.values,
  );

    const appliedFilters = filters
    .map((filter) => {
      // Special case for price filters - they may not have matching filter values
      // if the user entered a custom range that doesn't match API filter options
      if (filter.price) {
        const min = parseAsCurrency(filter.price.min ?? 0, locale);
        const max = filter.price.max
          ? parseAsCurrency(filter.price.max, locale)
          : "";
        const label = min && max ? `${min} - ${max}` : "Price";
        return { filter, label };
      }

      const foundValue = allFilterValues.find((value) => {
        const valueInput = JSON.parse(value.input as string) as ProductFilter;
        return (
          // This comparison should be okay as long as we're not manipulating the input we
          // get from the API before using it as a URL param.
          JSON.stringify(valueInput) === JSON.stringify(filter)
        );
      });
      if (!foundValue) {
        console.error("Could not find filter value for filter", filter);
        return null;
      }

      return { filter, label: foundValue.label };
    })
    .filter((filter): filter is NonNullable<typeof filter> => filter !== null);

  return {
    collection,
    appliedFilters,
    collections: flattenConnection(collections),
    childCollections,
    parentCollection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}


export default function Collection() {
  const {collection, parentCollection} = useLoaderData<typeof loader>();
  const { isDrawerOpen, closeFilter, openFilter } = usePlaypeak();

  const handleFilter = () => {
    if (isDrawerOpen('filter')) {
      closeFilter();
    } else {
      openFilter();
    }
  };

  return (
    <div className="collection container mx-auto pt-12">
      <Breadcrumb
        collection={{ title: collection.title, handle: collection.handle }}
        parentCollection={parentCollection ?? undefined}
      />
      <h1 className="text-h1 my-12 tablet:my-24">{collection.title}</h1>
      <ChildCollectionSlider className="mb-24"/>
      <div className="flex flex-col tablet:flex-row justify-between tablet:items-center">
        <div className="flex items-center gap-8 mb-24">
          <Button onClick={handleFilter} variant="secondary" size='small' IconBefore={Filter}>All filters</Button>
          <SortByFilter/>
        </div>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 min-h-screen">
        <div className="col-span-4 md:col-span-6 lg:col-span-12 bg-white">
          <PaginatedResourceSection<ProductItemFragment>
            connection={collection.products}
            resourcesClassName="products-grid"
            skeletonComponent={ProductItemSkeleton}
            skeletonCount={24}
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
        </div>
      </div>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    vendor
    availableForSale
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $sortKey: ProductCollectionSortKeys!
    $filters: [ProductFilter!]
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
          id
          label
          values {
            id
            label
            count
            input
            swatch {
            image {
              image {
                src
              }
            }
          }
          }
        }
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
      metafield(key: "child_collections", namespace: "custom") {
        references(first: 10) {
          nodes {
            ... on Collection {
              id
              title
              handle
              image {
                url
              }
            }
          }
        }
      }
      parentCollection: metafield(namespace: "category", key: "parent") {
        reference {
          ... on Collection {
            id
            handle
            title
          }
        }
      }
      highestPriceProduct: products(first: 1, sortKey: PRICE, reverse: true) {
          nodes {
            id
            title
            handle
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
          }
        }
      lowestPriceProduct: products(first: 1, sortKey: PRICE) {
        nodes {
          id
          title
          handle
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
        }
      }
    }
    collections(first: 100) {
      edges {
        node {
          title
          handle
        }
      }
    }
  }
${PRODUCT_ITEM_FRAGMENT}
` as const;
