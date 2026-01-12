import type { Route } from './+types/api.wishlist.products';

const WISHLIST_PRODUCT_FRAGMENT = `#graphql
  fragment WishlistProduct on Product {
    id
    title
    handle
    vendor
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
    selectedOrFirstAvailableVariant {
      id
      availableForSale
    }
  }
` as const;

export async function loader({ request, context }: Route.LoaderArgs) {
  const { storefront } = context;
  const url = new URL(request.url);
  const handles = url.searchParams.get('handles');

  if (!handles) {
    return Response.json({ products: [] }, { status: 200 });
  }

  try {
    // Parse handles from query string (comma-separated)
    const handleArray = handles.split(',').filter(Boolean);

    if (handleArray.length === 0) {
      return Response.json({ products: [] }, { status: 200 });
    }

    // Fetch products by handles
    const products = await Promise.all(
      handleArray.map(async (handle) => {
        try {
          const result = await storefront.query(
            `#graphql
              query WishlistProduct(
                $country: CountryCode
                $language: LanguageCode
                $handle: String!
              ) @inContext(country: $country, language: $language) {
                product(handle: $handle) {
                  ...WishlistProduct
                }
              }
              ${WISHLIST_PRODUCT_FRAGMENT}
            `,
            {
              variables: { handle },
            }
          );
          return result.product;
        } catch (error) {
          console.error(`Error fetching product ${handle}:`, error);
          return null;
        }
      })
    );

    // Filter out null results (products that don't exist or failed to fetch)
    const validProducts = products.filter((p) => p !== null);

    return Response.json({ products: validProducts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching wishlist products:', error);
    return Response.json({ products: [], error: 'Failed to fetch products' }, { status: 500 });
  }
}
