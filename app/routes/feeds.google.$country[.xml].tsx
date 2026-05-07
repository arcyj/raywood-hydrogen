/**
 * Google Shopping Product Feed
 *
 * Serves a per-currency XML feed at /feeds/google/{countryCode}.xml
 *
 * Each entry in CURRENCIES has a representative countryCode (e.g. "DE" for EUR,
 * "GB" for GBP). Only those country codes produce a valid feed; eurozone
 * countries other than DE should point Google Merchant Center at /feeds/google/de.xml.
 *
 * URLs:
 *   /feeds/google/de.xml  → EUR feed  (all eurozone countries)
 *   /feeds/google/gb.xml  → GBP feed
 *   /feeds/google/se.xml  → SEK feed
 *   … one feed per currency in CURRENCIES
 *
 * Caching: max-age=3600, stale-while-revalidate=86400 (Oxygen / CDN level).
 */
import {parseGid} from '@shopify/hydrogen';
import type {Storefront} from '@shopify/hydrogen';
import type {CountryCode, LanguageCode} from '@shopify/hydrogen/storefront-api-types';
import type {Route} from './+types/feeds.google.$country[.xml]';
import {CURRENCIES} from '~/helpers/currencies';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 250;
const STORE_NAME = 'Playpeak';
const FEED_LANGUAGE: LanguageCode = 'EN';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const FEED_PRODUCTS_QUERY = `#graphql
  query GoogleFeedProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        handle
        title
        description
        productType
        vendor
        featuredImage {
          url(transform: {maxWidth: 1200, maxHeight: 1200})
          altText
        }
        variants(first: 100) {
          nodes {
            id
            title
            availableForSale
            sku
            image {
              url(transform: {maxWidth: 1200, maxHeight: 1200})
              altText
            }
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
` as const;

// ─── Local types ──────────────────────────────────────────────────────────────

type FeedImage = {url: string; altText?: string | null};

type FeedVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  sku?: string | null;
  image?: FeedImage | null;
  price: {amount: string; currencyCode: string};
  selectedOptions: Array<{name: string; value: string}>;
};

type FeedProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  vendor: string;
  featuredImage?: FeedImage | null;
  variants: {nodes: FeedVariant[]};
};

type FeedProductsResult = {
  products: {
    pageInfo: {hasNextPage: boolean; endCursor: string};
    nodes: FeedProduct[];
  };
};

// ─── XML helpers ──────────────────────────────────────────────────────────────

/** Escape text safe for XML attribute values and plain element content. */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Wrap text in a CDATA section.
 * Nested `]]>` sequences are split so they don't prematurely close the block.
 */
function cdata(text: string): string {
  return `<![CDATA[${text.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

// ─── Feed item builder ────────────────────────────────────────────────────────

/**
 * Converts one product variant into a Google Shopping RSS <item>.
 * Returns an empty string if the item cannot be represented (e.g. no image).
 *
 * @param country - uppercase ISO-3166 country code for this feed (e.g. "GB")
 */
function buildFeedItem(
  product: FeedProduct,
  variant: FeedVariant,
  baseUrl: string,
  country: string,
): string {
  // Image is required by Google — skip items without one
  const imageUrl = variant.image?.url ?? product.featuredImage?.url;
  if (!imageUrl) return '';

  const productId = parseGid(product.id).id;
  const variantId = parseGid(variant.id).id;

  const isDefaultVariant =
    variant.title === 'Default Title' ||
    variant.selectedOptions.every(
      (opt) =>
        opt.name.toLowerCase() === 'title' &&
        opt.value.toLowerCase() === 'default title',
    );

  const title = isDefaultVariant
    ? product.title
    : `${product.title} - ${variant.title}`;

  // Google recommends 500–1000 chars; truncate to 5000 (their hard limit)
  const description = product.description?.trim()
    ? product.description.slice(0, 5000)
    : title;

  const link = `${baseUrl}/products/${product.handle}?variant=${variantId}`;
  const availability = variant.availableForSale ? 'in stock' : 'out of stock';
  const price = `${parseFloat(variant.price.amount).toFixed(2)} ${variant.price.currencyCode}`;

  // Shopify's canonical feed ID format: shopify_{COUNTRY}_{PRODUCT_ID}_{VARIANT_ID}
  // This must match any supplemental inventory source Shopify sends to GMC.
  const feedId = `shopify_${country}_${productId}_${variantId}`;

  const lines: string[] = [
    `    <item>`,
    `      <g:id>${escapeXml(feedId)}</g:id>`,
    `      <title>${cdata(title)}</title>`,
    `      <description>${cdata(description)}</description>`,
    `      <link>${escapeXml(link)}</link>`,
    `      <g:image_link>${escapeXml(imageUrl)}</g:image_link>`,
    `      <g:availability>${availability}</g:availability>`,
    `      <g:price>${escapeXml(price)}</g:price>`,
    `      <g:brand>${cdata(product.vendor || STORE_NAME)}</g:brand>`,
    `      <g:condition>new</g:condition>`,
    `      <g:item_group_id>${escapeXml(productId)}</g:item_group_id>`,
  ];

  if (product.productType) {
    lines.push(`      <g:product_type>${cdata(product.productType)}</g:product_type>`);
  }
  if (variant.sku) {
    lines.push(`      <g:mpn>${escapeXml(variant.sku)}</g:mpn>`);
  }

  lines.push(`    </item>`);
  return lines.join('\n') + '\n';
}

// ─── Product fetcher with cursor pagination ───────────────────────────────────

async function fetchAllProducts(
  storefront: Storefront,
  country: CountryCode,
): Promise<FeedProduct[]> {
  const products: FeedProduct[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    // eslint-disable-next-line no-await-in-loop
    const data = (await storefront.query(FEED_PRODUCTS_QUERY, {
      variables: {
        country,
        language: FEED_LANGUAGE,
        first: PAGE_SIZE,
        after: cursor,
      },
    })) as FeedProductsResult;

    products.push(...data.products.nodes);
    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  return products;
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({params, request, context}: Route.LoaderArgs) {
  const {storefront} = context;

  // Validate the country param against our currency table
  const countryParam = (params.country ?? '').toUpperCase();
  const currencyOption = CURRENCIES.find(
    (c) => c.countryCode.toUpperCase() === countryParam,
  );

  if (!currencyOption) {
    throw new Response('Feed not found for this country', {status: 404});
  }

  const baseUrl = new URL(request.url).origin;
  const country = currencyOption.countryCode as CountryCode;

  let products: FeedProduct[];
  try {
    products = await fetchAllProducts(storefront, country);
  } catch (error) {
    console.error('[google-feed] Failed to fetch products:', error);
    throw new Response('Feed generation failed', {status: 500});
  }

  // Build all <item> blocks, skipping any that error or lack an image
  let items = '';
  for (const product of products) {
    for (const variant of product.variants.nodes) {
      try {
        const item = buildFeedItem(product, variant, baseUrl, country);
        if (item) items += item;
      } catch {
        // Silently skip malformed variants
      }
    }
  }

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">`,
    `  <channel>`,
    `    <title>${escapeXml(`${STORE_NAME} - ${currencyOption.currency} Feed`)}</title>`,
    `    <link>${escapeXml(baseUrl)}</link>`,
    `    <description>${escapeXml(`${STORE_NAME} Google Shopping Feed — ${currencyOption.label}`)}</description>`,
    items.trimEnd(),
    `  </channel>`,
    `</rss>`,
  ].join('\n');

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
