const BASE_URL = 'https://judge.me/api/v1';
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_FETCH_TIMEOUT_MS = 5000;

type EnvLike = Record<string, string | undefined>;

export type JudgeMeConfig = {
  token: string;
  shopDomain: string;
  cacheTtlMs?: number;
};

type JudgeMeReview = {
  id: number | string;
  rating: number;
  body: string;
  curated?: string | null;
  verified?: string | boolean | null;
  product_title?: string | null;
  product_handle?: string | null;
  product_image_url?: string | null;
  reviewer?: {
    name?: string | null;
  };
};

type JudgeMeReviewsResponse = {
  reviews?: JudgeMeReview[];
};

type ReviewsCacheEntry = {
  expiresAt: number;
  reviews: JudgeMeReview[];
};

export type PublicJudgeMeReviewProduct = {
  title: string;
  handle: string | null;
  imageUrl: string | null;
};

export type PublicJudgeMeReview = {
  id: number | string;
  body: string;
  rating: number;
  reviewerFirstName: string;
  isVerified: boolean;
  product: PublicJudgeMeReviewProduct | null;
};

const reviewCacheByShop = new Map<string, ReviewsCacheEntry>();
const inFlightByShop = new Map<string, Promise<JudgeMeReview[]>>();

function getJudgeMeConfig(env: EnvLike) {
  const token = env.JUDGEME_API_TOKEN;
  const storeDomain = env.PUBLIC_STORE_DOMAIN;

  if (!token || !storeDomain) {
    const missing: string[] = [];
    if (!token) missing.push('JUDGEME_API_TOKEN');
    if (!storeDomain) missing.push('PUBLIC_STORE_DOMAIN');
    throw new Error(
      `Judge.me credentials not configured. Missing: ${missing.join(', ')}`,
    );
  }

  const cleanDomain = storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return {token, cleanDomain};
}

function normalizeShopDomain(shopDomain: string) {
  return shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function toFirstName(name?: string | null) {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return 'Anonymous';
  return trimmed.split(/\s+/)[0] || 'Anonymous';
}

function maskReviewerName(name?: string | null) {
  const firstName = toFirstName(name);
  if (firstName === 'Anonymous') {
    return firstName;
  }

  const firstChar = firstName.charAt(0);
  const maskedTail = '*'.repeat(Math.max(0, firstName.length - 1));
  return `${firstChar}${maskedTail}`;
}

function isVerifiedReview(verified?: string | boolean | null) {
  if (typeof verified === 'boolean') return verified;
  if (typeof verified !== 'string') return false;
  return verified.trim().length > 0 && verified !== 'unverified';
}

function sanitizeReview(review: JudgeMeReview): PublicJudgeMeReview {
  const hasProductData = Boolean(
    review.product_title || review.product_handle || review.product_image_url,
  );

  return {
    id: review.id,
    body: review.body,
    rating: review.rating,
    reviewerFirstName: maskReviewerName(review.reviewer?.name),
    isVerified: isVerifiedReview(review.verified),
    product: hasProductData
      ? {
          title: review.product_title?.trim() || 'View product',
          handle: review.product_handle?.trim() || null,
          imageUrl: review.product_image_url?.trim() || null,
        }
      : null,
  };
}

async function fetchJudgeMeReviews({
  token,
  cleanDomain,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
}: {
  token: string;
  cleanDomain: string;
  timeoutMs?: number;
}): Promise<JudgeMeReview[]> {
  const url = new URL(`${BASE_URL}/reviews`);
  url.searchParams.set('shop_domain', cleanDomain);
  url.searchParams.set('api_token', token);
  url.searchParams.set('per_page', '100');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url.toString(), {signal: controller.signal});
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'AbortError' || /abort/i.test(error.message))
    ) {
      throw new Error(`Judge.me request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch Judge.me reviews (HTTP ${response.status})`);
  }

  const payload = (await response.json()) as JudgeMeReviewsResponse;
  return payload.reviews ?? [];
}

export function createJudgeMeClient({
  token,
  shopDomain,
  cacheTtlMs = DEFAULT_CACHE_TTL_MS,
}: JudgeMeConfig) {
  if (!token) {
    throw new Error('Judge.me credentials not configured. Missing: JUDGEME_API_TOKEN');
  }
  if (!shopDomain) {
    throw new Error('Judge.me credentials not configured. Missing: PUBLIC_STORE_DOMAIN');
  }

  const cleanDomain = normalizeShopDomain(shopDomain);
  const cacheKey = cleanDomain;

  return {
    async getAllReviews() {
      const now = Date.now();
      const cached = reviewCacheByShop.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        return cached.reviews;
      }

      const inFlight = inFlightByShop.get(cacheKey);
      if (inFlight) {
        return inFlight;
      }

      const request = fetchJudgeMeReviews({token, cleanDomain})
        .then((reviews) => {
          const resolvedAt = Date.now();
          reviewCacheByShop.set(cacheKey, {
            reviews,
            expiresAt: resolvedAt + cacheTtlMs,
          });
          return reviews;
        })
        .catch((error) => {
          const stale = reviewCacheByShop.get(cacheKey);
          if (stale?.reviews?.length) {
            console.warn(
              `Judge.me request failed for ${cacheKey}; serving stale cache.`,
              error,
            );
            return stale.reviews;
          }
          throw error;
        })
        .finally(() => {
          inFlightByShop.delete(cacheKey);
        });

      inFlightByShop.set(cacheKey, request);
      return request;
    },
    async getPublicReviews() {
      const reviews = await this.getAllReviews();
      return reviews
        .filter((review) => review.curated === 'ok')
        .map(sanitizeReview);
    },
  };
}

export function createJudgeMeClientFromEnv(env: EnvLike) {
  const {token, cleanDomain} = getJudgeMeConfig(env);
  return createJudgeMeClient({
    token,
    shopDomain: cleanDomain,
  });
}
