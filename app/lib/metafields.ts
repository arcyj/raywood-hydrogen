/**
 * Metafield shape with at least namespace and key (Storefront API).
 * Use a generic to preserve full metafield type (value, reference, etc.) when available.
 */
type MetafieldWithNamespaceKey = {
  namespace?: string | null;
  key: string;
  [key: string]: unknown;
};

export type GetMetafieldOptions = {
  /**
   * When true, also match metafields whose namespace is null or undefined.
   * Useful when the API omits namespace for some metafields.
   */
  matchNullNamespace?: boolean;
};

/**
 * Retrieves a single metafield from an array by namespace and key.
 *
 * @param metafields - Array of metafields (e.g. from product.metafields or collection metafield references)
 * @param namespace - Metafield namespace (e.g. "custom", "category")
 * @param key - Metafield key
 * @param options - Optional: { matchNullNamespace: true } to also match when metafield has no namespace
 * @returns The first matching metafield, or undefined if none found
 *
 * @example
 * const expansionMetafield = getMetafield(product.metafields, 'custom', 'expansion');
 * const parentCollection = getMetafield(collection.metafields, 'category', 'parent');
 * // When API may omit namespace:
 * const expansion = getMetafield(product.metafields, 'custom', 'expansion', { matchNullNamespace: true });
 */
export function getMetafield<T extends MetafieldWithNamespaceKey>(
  metafields: T[] | null | undefined,
  namespace: string,
  key: string,
  options?: GetMetafieldOptions
): T | undefined {
  if (!metafields?.length) return undefined;
  const matchNullNamespace = options?.matchNullNamespace ?? false;
  return metafields.find((m): m is T => {
    if (m == null || m.key !== key) return false;
    if (m.namespace === namespace) return true;
    return matchNullNamespace && (m.namespace == null || m.namespace === '');
  });
}

/** Value for a metaobject field that is an image reference (e.g. icon). */
export type MetaobjectImageValue = {
  url: string;
  altText?: string | null;
};

/** Parsed metaobject fields: key → string value or image (url + altText). */
export type MetaobjectFieldsResult = Record<
  string,
  string | MetaobjectImageValue | undefined
>;

type MetaobjectFieldLike = {
  key: string;
  value?: string | null;
  reference?: {
    __typename?: string;
    image?: { url?: string | null; altText?: string | null } | null;
  } | null;
};

type MetaobjectReferenceLike = {
  fields?: Array<MetaobjectFieldLike> | null;
};

/**
 * Extracts metaobject fields from a metafield whose reference is a Metaobject.
 * Converts the fields array to an object: string values are kept, MediaImage
 * references become { url, altText }.
 *
 * @param metafield - Metafield with reference (e.g. from getMetafield())
 * @returns Object mapping field key to value (string or image), or undefined if no metaobject reference
 *
 * @example
 * const expansionData = parseMetaobjectFromMetafield(getMetafield(product.metafields, 'custom', 'expansion'));
 * const languageData = parseMetaobjectFromMetafield(getMetafield(product.metafields, 'details', 'language'));
 * // expansionData?.title, languageData?.value, languageData?.icon?.url
 */
export function parseMetaobjectFromMetafield(
  metafield: Record<string, unknown> | null | undefined
): MetaobjectFieldsResult | undefined {
  const ref = (metafield?.reference as MetaobjectReferenceLike) ?? undefined;
  if (!ref?.fields?.length) return undefined;

  const result: MetaobjectFieldsResult = {};
  for (const field of ref.fields) {
    if (!field?.key) continue;
    const ref = field.reference;
    if (
      ref &&
      typeof ref === 'object' &&
      'image' in ref &&
      ref.image &&
      typeof ref.image === 'object' &&
      'url' in ref.image &&
      ref.image.url
    ) {
      const img = ref.image as { url: string; altText?: string | null };
      result[field.key] = { url: img.url, altText: img.altText ?? undefined };
    } else {
      result[field.key] = (field.value as string) ?? undefined;
    }
  }
  return result;
}
