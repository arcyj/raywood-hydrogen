import type {Storefront} from '@shopify/hydrogen';
import type {CollectionCardData} from '~/components/sections/CollectionCards';

export type FeaturedExpansionData = {
  id: string;
  title: string;
  image?: {
    url: string;
    altText?: string | null;
  } | null;
};

export type FeaturedCollectionData = CollectionCardData & {
  childCollections: Array<{
    id: string;
    title: string;
    handle: string;
  }>;
  featuredExpansions: FeaturedExpansionData[];
};

/**
 * Fragment for collection card data
 */
export const COLLECTION_CARD_FRAGMENT = `#graphql
  fragment CollectionCard on Collection {
    id
    title
    handle
    shortDescription: metafield(namespace: "custom", key: "short_description") {
      value
    }
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
      featuredExpansions: metafield(
        namespace: "custom"
        key: "featured_expansions"
      ) {
        references(first: 20) {
          nodes {
            ... on Metaobject {
              id
              fields {
                key
                value
                reference {
                  ... on MediaImage {
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
      childCollections: metafield(namespace: "custom", key: "child_collections") {
        references(first: 20) {
          nodes {
            ... on Collection {
              id
              title
              handle
            }
          }
        }
      }
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
          const collection = result.collection as
            | (Omit<CollectionCardData, 'shortDescription'> & {
                shortDescription?: {value?: string | null} | null;
              })
            | null;

          if (!collection) return null;

          return {
            ...collection,
            shortDescription: collection.shortDescription?.value,
          };
        } catch (error) {
          console.error(`Error fetching collection ${handle}:`, error);
          return null;
        }
      }),
    );

    // Filter out null results (collections that don't exist or failed to fetch)
    return collections.filter(
      (collection): collection is NonNullable<typeof collection> =>
        collection !== null,
    );
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function fetchFeaturedCollectionsByHandles(
  storefront: Storefront,
  handles: string[],
): Promise<FeaturedCollectionData[]> {
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

          const collection = result.collection as
            | (CollectionCardData & {
                shortDescription?: {value?: string | null} | null;
                childCollections?: {
                  references?: {
                    nodes?: Array<{
                      id?: string;
                      title?: string;
                      handle?: string;
                    }>;
                  };
                };
                featuredExpansions?: {
                  references?: {
                    nodes?: Array<{
                      id?: string;
                      fields?: Array<{
                        key?: string;
                        value?: string | null;
                        reference?: {
                          image?: {
                            url?: string | null;
                            altText?: string | null;
                          } | null;
                        } | null;
                      }>;
                    }>;
                  };
                };
              })
            | null;

          if (!collection) return null;

          const childCollections = (
            collection.childCollections?.references?.nodes ?? []
          )
            .filter(
              (
                child,
              ): child is {id: string; title: string; handle: string} =>
                Boolean(child?.id && child?.title && child?.handle),
            )
            .map((child) => ({
              id: child.id,
              title: child.title,
              handle: child.handle,
            }));

          const featuredExpansions = (
            collection.featuredExpansions?.references?.nodes ?? []
          )
            .filter((expansion): expansion is {id: string; fields: Array<{key?: string; value?: string | null; reference?: {image?: {url?: string | null; altText?: string | null} | null} | null}>} => Boolean(expansion?.id && expansion?.fields))
            .map((expansion) => {
              const titleField = expansion.fields.find((field) => field.key === 'title');
              const imageField = expansion.fields.find((field) => field.key === 'image');
              const imageUrl = imageField?.reference?.image?.url;

              return {
                id: expansion.id,
                title: titleField?.value || 'Expansion',
                image: imageUrl
                  ? {
                      url: imageUrl,
                      altText: imageField?.reference?.image?.altText ?? null,
                    }
                  : null,
              };
            });

          return {
            id: collection.id,
            title: collection.title,
            handle: collection.handle,
            shortDescription: collection.shortDescription?.value ?? null,
            image: collection.image ?? undefined,
            childCollections,
            featuredExpansions,
          };
        } catch (error) {
          console.error(`Error fetching featured collection ${handle}:`, error);
          return null;
        }
      }),
    );

    return collections.filter(
      (
        collection,
      ): collection is NonNullable<typeof collection> => collection !== null,
    );
  } catch (error) {
    console.error('Error fetching featured collections:', error);
    return [];
  }
}
