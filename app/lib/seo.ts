import type { MetaDescriptor } from 'react-router';

/**
 * SEO meta options aligned with Shopify Liquid theme logic:
 * - page_title / title
 * - page_description / description (plain text, escaped in Liquid)
 * - page_image for og:image (Shopify uses page_image object)
 * - canonical_url for canonical and og:url
 * - og:type (website, product, article, etc.)
 */
export type SeoMetaOptions = {
  title: string;
  description?: string | null;
  /** Absolute image URL for og:image / twitter:image (e.g. product/collection featured image) */
  imageUrl?: string | null;
  /** Absolute page URL for canonical and og:url */
  url?: string | null;
  /** og:type - e.g. "website" | "product" | "article" */
  type?: 'website' | 'product' | 'article';
  /** og:site_name (store name) */
  siteName?: string;
};

const DEFAULT_SITE_NAME = 'Playpeak';

/**
 * Strip HTML tags and trim; used for meta description (Liquid uses escaped page_description).
 */
export function stripHtml(html: string): string {
  if (typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Truncate description for meta (recommended ~155–160 chars for SEO).
 */
export function truncateDescription(text: string, maxLength = 160): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
}

/**
 * Build React Router meta descriptors for SEO and social (OG / Twitter),
 * matching Shopify Liquid theme behaviour.
 */
export function getSeoMeta(options: SeoMetaOptions): MetaDescriptor[] {
  const {
    title,
    description,
    imageUrl,
    url,
    type = 'website',
    siteName = DEFAULT_SITE_NAME,
  } = options;

  const safeDescription = description
    ? truncateDescription(stripHtml(description))
    : '';

  const descriptors: MetaDescriptor[] = [
    { title },
  ];

  if (safeDescription) {
    descriptors.push({ name: 'description', content: safeDescription });
  }

  if (url) {
    descriptors.push({
      tagName: 'link',
      rel: 'canonical',
      href: url,
    });
  }

  // Open Graph (Facebook, etc.)
  descriptors.push({ property: 'og:title', content: title });
  if (safeDescription) {
    descriptors.push({ property: 'og:description', content: safeDescription });
  }
  if (url) {
    descriptors.push({ property: 'og:url', content: url });
  }
  descriptors.push({ property: 'og:type', content: type });
  descriptors.push({ property: 'og:site_name', content: siteName });
  if (imageUrl) {
    descriptors.push({ property: 'og:image', content: imageUrl });
    descriptors.push({ property: 'og:image:secure_url', content: imageUrl });
  }

  // Twitter Card
  descriptors.push({ name: 'twitter:card', content: 'summary_large_image' });
  descriptors.push({ name: 'twitter:title', content: title });
  if (safeDescription) {
    descriptors.push({ name: 'twitter:description', content: safeDescription });
  }
  if (imageUrl) {
    descriptors.push({ name: 'twitter:image', content: imageUrl });
  }

  return descriptors;
}

/**
 * Product data shape for JSON-LD schema (from minimal/critical loader).
 */
export type ProductJsonLdInput = {
  title: string;
  description?: string | null;
  featuredImage?: { url: string } | null;
  selectedOrFirstAvailableVariant?: {
    price?: { amount: string; currencyCode: string } | null;
    availableForSale?: boolean | null;
  } | null;
};

/**
 * Build Google Product schema (JSON-LD) for rich snippets in search results.
 * Use with meta: { "script:ld+json": getProductJsonLd(product, url) }
 */
export function getProductJsonLd(
  product: ProductJsonLdInput,
  url: string,
): Record<string, unknown> {
  const variant = product.selectedOrFirstAvailableVariant;
  const price = variant?.price?.amount;
  const currency = variant?.price?.currencyCode ?? 'EUR';
  const available = variant?.availableForSale ?? false;

  const offers: Record<string, unknown> = {
    '@type': 'Offer',
    url,
    priceCurrency: currency,
    availability: available
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
  };
  if (price != null) {
    offers.price = price;
  }

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    url,
    offers,
  };
  const description = product.description
    ? stripHtml(product.description)
    : null;
  if (description) schema.description = description;
  if (product.featuredImage?.url) schema.image = product.featuredImage.url;

  return schema;
}

/**
 * Build absolute URL for the current page (for canonical and og:url).
 * Use from route meta: getAbsoluteUrl(matches, location).
 */
export function getAbsoluteUrl(
  matches: Array<{ route?: { id?: string }; data?: unknown }>,
  location: { pathname: string; search?: string },
): string {
  const rootMatch =
    matches?.find((m) => (m.route as { id?: string })?.id === 'root') ??
    matches?.[0];
  const rootData = rootMatch?.data as { publicStoreDomain?: string } | undefined;
  const domain = rootData?.publicStoreDomain ?? '';
  const origin = domain ? `https://${domain}` : '';
  const path = location.pathname + (location.search ?? '');
  return origin ? `${origin}${path}` : path;
}
