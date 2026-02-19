import {data} from 'react-router';
import {CUSTOMER_CREATE_MUTATION} from '~/graphql/NewsletterSubscriptionMutation';
import type {Route} from './+types/api.subscribe';

export type ActionResponse = {
  success?: boolean;
  error?: string | null;
};

/**
 * Creates a customer in Shopify via Admin API with email marketing consent.
 * No password required - suitable for newsletter-only signup.
 */
async function createNewsletterSubscription({
  email,
  context,
}: {
  email: string;
  context: Route.ActionArgs['context'];
}) {
  const {env} = context;

  const adminToken = env.PRIVATE_ADMIN_API_TOKEN;
  const storeDomain = env.PUBLIC_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    const missing = [];
    if (!adminToken) missing.push('PRIVATE_ADMIN_API_TOKEN');
    if (!storeDomain) missing.push('PUBLIC_STORE_DOMAIN');
    throw new Error(
      `Admin API credentials not configured. Missing: ${missing.join(', ')}`,
    );
  }

  const cleanDomain = storeDomain
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  const adminApiUrl = `https://${cleanDomain}/admin/api/2024-10/graphql.json`;

  const variables = {
    input: {
      email,
      emailMarketingConsent: {
        marketingState: 'SUBSCRIBED',
        marketingOptInLevel: 'SINGLE_OPT_IN',
      },
    },
  };

  const response = await fetch(adminApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
    body: JSON.stringify({
      query: CUSTOMER_CREATE_MUTATION,
      variables,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP ${response.status}: ${errorText || response.statusText}`,
    );
  }

  const result = (await response.json()) as {
    errors?: Array<{message: string}>;
    data?: {
      customerCreate?: {
        customer?: {id: string; email: string};
        userErrors?: Array<{field: string[]; message: string}>;
      };
    };
  };

  if (result.errors?.length) {
    throw new Error(
      `GraphQL errors: ${result.errors.map((e) => e.message).join(', ')}`,
    );
  }

  const userErrors = result.data?.customerCreate?.userErrors;
  if (userErrors?.length) {
    const err = userErrors[0];
    const message = err.message;
    // Handle duplicate email - treat as success (already subscribed)
    if (message.toLowerCase().includes('taken') || message.toLowerCase().includes('already')) {
      return {success: true, customer: null, exists: true};
    }
    throw new Error(
      `Shopify API error: ${message}${err.field?.length ? ` (field: ${err.field.join('.')})` : ''}`,
    );
  }

  return {success: true, customer: result.data?.customerCreate?.customer};
}

/**
 * Hydrogen Server Route: handles POST requests for customer newsletter subscription.
 * Uses Admin API customerCreate - no password, no custom metaobject required.
 * POST /api/subscribe (or /{locale}/api/subscribe)
 */
export async function action({request, context}: Route.ActionArgs) {
  try {
    if (request.method !== 'POST') {
      return data(
        {error: 'Method not allowed', success: false},
        {status: 405},
      );
    }

    let email: string | undefined;
    try {
      const formData = await request.formData();
      const raw = formData.get('email');
      email = (typeof raw === 'string' ? raw : '').trim();
    } catch {
      return data({error: 'Email is required', success: false});
    }

    if (!email) {
      return data({error: 'Email is required', success: false});
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return data({error: 'Please enter a valid email address', success: false});
    }

    await createNewsletterSubscription({email, context});
    return data({success: true, error: null});
  } catch (error: unknown) {
    console.error('Newsletter subscription error:', error);
    return data({
      error:
        error instanceof Error
          ? error.message
          : 'Failed to subscribe. Please try again later.',
      success: false,
    });
  }
}

export default function SubscribeRoute() {
  return null;
}
