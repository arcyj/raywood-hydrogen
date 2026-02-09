import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  LatestAddedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import { Slider } from '~/components/Slider';
import { Banner } from '~/components/sections/Banner';
import { ButtonLink } from '~/components/ui/Link';
import { CollectionCards } from '~/components/sections/CollectionCards';
import {fetchCollectionsByHandles} from '~/lib/queries/collections';
import { getSeoMeta, getAbsoluteUrl } from '~/lib/seo';
import {useLocalizedPath} from '~/hooks/useLocalePath';

export const meta: Route.MetaFunction = ({matches, location}) => {
  const url = getAbsoluteUrl(matches ?? [], location);
  return getSeoMeta({
    title: 'Playpeak | TCG & Collectibles',
    description: 'Shop trading card games and collectibles. Pokemon TCG, Magic: The Gathering, Lorcana and more.',
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
  const collectionHandles = ['pokemon-tcg', 'magic-the-gathering', 'lorcana-tcg', 'one-piece'];
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
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  const latestProducts = context.storefront
    .query(LATEST_ADDED_PRODUCTS_QUERY, {
      variables: {
        handle: 'latest-added-products',
        first: 21,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

    const constructionSetsProducts = context.storefront
    .query(LATEST_ADDED_PRODUCTS_QUERY, {
      variables: {
        handle: 'construction-set',
        first: 14,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
    latestProducts,
    constructionSetsProducts
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-8 mb-12">
          <Slider
            settings={{slidesToShow: 1, spaceBetween: 8, dots: false}}
            className="col-span-3 md:col-span-2"
          >
            <Banner
              heading="Seven Legends of the Azure Sea"
              text="One Piece TCG OP-14 Available now for purchase"
              backgroundImage="https://cdn.shopify.com/s/files/1/0738/0054/8663/files/mtg-azure-7-seas.jpg?v=1769068206"
              logo="https://cdn.shopify.com/s/files/1/0738/0054/8663/files/op-14-logo.webp?v=1769068482"
              overlayFromColor="#301c54"
              overlayToColor="#301c54"
              buttonText="Shop now"
              buttonUrl={`/products/one-piece-tcg-op-14-the-azure-seas-seven-booster-display-eng?Title=Default+Title`}
            />
            <Banner
              heading="Phantasmal flames"
              text="Available now for purchase"
              backgroundImage="https://cdn.shopify.com/s/files/1/0738/0054/8663/files/phantasmal-bg.webp?v=1763993045"
              logo="https://cdn.shopify.com/s/files/1/0738/0054/8663/files/phantasal-flames-me02-logo-2x.png?v=1763134362"
              overlayFromColor="#170631"
              overlayToColor="#170631"
              buttonText="Shop now"
              buttonUrl={`/collections/pokemon-tcg?filter.productMetafield=%7B"namespace"%3A"custom"%2C"key"%3A"expansions"%2C"value"%3A"gid%3A%2F%2Fshopify%2FMetaobject%2F139873485111"%7D`}
            />
            <Banner
              heading="Forge Your Deck. Shape the Elements."
              text="Build elemental decks, unleash powerful combos, and bend the battlefield to your will"
              backgroundImage="https://cdn.shopify.com/s/files/1/0738/0054/8663/files/mtg-avatar-bg.jpg?v=1763998363"
              logo="https://cdn.shopify.com/s/files/1/0738/0054/8663/files/mtg-avatar-logo.webp?v=1763998641"
              textColor="dark"
              buttonText="View All Products"
              buttonUrl={`/collections/magic-the-gathering?filter.productMetafield=%7B"namespace"%3A"custom"%2C"key"%3A"expansions"%2C"value"%3A"gid%3A%2F%2Fshopify%2FMetaobject%2F141094093111"%7D`}
            />
            <Banner
              heading="Unleash Legendary Power"
              text="Mega Evolution Returns to Dominate the Battle!"
              backgroundImage="https://cdn.shopify.com/s/files/1/0738/0054/8663/files/MegaEvolutionBanner-pattern.jpg?v=1762860429"
              logo="https://cdn.shopify.com/s/files/1/0738/0054/8663/files/me01-logo-2x.png?v=1762859891"
              buttonText="Explore now"
              buttonUrl={`/collections/pokemon-tcg?filter.productMetafield=%7B"namespace"%3A"custom"%2C"key"%3A"expansions"%2C"value"%3A"gid%3A%2F%2Fshopify%2FMetaobject%2F139488493879"%7D`}
            />
          </Slider>
          <div className="col-span-3 md:col-span-1">
            <Banner
              heading="Dream Boy and Giggle Monster"
              text="Available now for purchase"
              logo="https://cdn.shopify.com/s/files/1/0738/0054/8663/files/dreamboyandgiggle.png?v=1768904503"
              overlayFromColor="#334fb4"
              overlayToColor="#d21258"
              overlayDirection="180deg"
              buttonText="Shop now"
              buttonUrl={`/collections/blind-boxes`}
            />
          </div>
        </div>
        <section className="mb-12">
          <CollectionCards collections={data.collections} />
        </section>
        <section className="mb-12">
          <Banner
            heading="Burst Into Battle!"
            text="Build bold strategies with bright new Pokémon and explosive abilities designed to outshine the competition."
            backgroundImage="https://cdn.shopify.com/s/files/1/0738/0054/8663/files/scarlet-violet-header-bg.webp?v=1769426809"
            logo="https://cdn.shopify.com/s/files/1/0738/0054/8663/files/scarlet-violet-logo.png?v=1764003734"
            overlayFromColor="#200531"
            overlayToColor="#200531"
            buttonText="Shop now"
            buttonUrl={`/collections/pokemon-tcg?filter.productMetafield=%7B"namespace"%3A"custom"%2C"key"%3A"expansions"%2C"value"%3A"gid%3A%2F%2Fshopify%2FMetaobject%2F94150394167"%7D`}
          />
        </section>
        {/* <RecommendedProducts products={data.recommendedProducts} /> */}
        <section className="mb-12">
          <CollectionProducts
            title="New in Shop"
            text="Fresh hits just dropped! Explore our New Arrivals — the latest booster boxes, decks, and merch from Pokémon, Magic, Lorcana and more. Be first to grab them before they’re gone!"
            products={data.latestProducts}
          />
        </section>
        <section className="mb-12">
          <CollectionProducts
            products={data.constructionSetsProducts}
            title="Construction Sets"
            text="From clasic builds to masterpieces! Explore our themed construction sets"
          />
        </section>
      </div>
    </div>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const withLocale = useLocalizedPath();
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={withLocale(`/collections/${collection.handle}`)}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
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
                <div className="grid grid-cols-2 tablet:grid-cols-4 desktop:grid-cols-5 mediumDesktop:grid-cols-6 largeDesktop:grid-cols-7 gap-8">
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
