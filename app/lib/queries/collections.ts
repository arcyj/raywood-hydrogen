import type {Storefront} from '@shopify/hydrogen';
import type {CollectionCardData} from '~/components/sections/CollectionCards';

/**
 * Fragment for collection card data
 */
export const COLLECTION_CARD_FRAGMENT = `#graphql
  fragment CollectionCard on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
` as const;

/**
 * Query to fetch a single collection by handle
 */
export const COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      ...CollectionCard
    }
  }
  ${COLLECTION_CARD_FRAGMENT}
` as const;

/**
 * Helper function to fetch multiple collections by their handles
 * @param storefront - The Shopify storefront instance
 * @param handles - Array of collection handles to fetch
 * @returns Promise resolving to an array of collection data
 */
export async function fetchCollectionsByHandles(
  storefront: Storefront,
  handles: string[],
): Promise<CollectionCardData[]> {
  if (!handles || handles.length === 0) {
    return [];
  }

  try {
    const collections = await Promise.all(
      handles.map(async (handle) => {
        try {
          const result = await storefront.query(COLLECTION_BY_HANDLE_QUERY, {
            variables: {
              handle,
              country: storefront.i18n.country,
              language: storefront.i18n.language,
            },
          });
          return result.collection;
        } catch (error) {
          console.error(`Error fetching collection ${handle}:`, error);
          return null;
        }
      }),
    );

    // Filter out null results (collections that don't exist or failed to fetch)
    return collections.filter(
      (collection): collection is CollectionCardData => collection !== null,
    );
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}
