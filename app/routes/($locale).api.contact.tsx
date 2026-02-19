import {data} from 'react-router';
import {CONTACT_FORM_MUTATION} from '~/graphql/ContactFormMutation';
import type {Route} from './+types/api.contact';

export type ActionResponse = {
  success?: boolean;
  error?: string | null;
};

/**
 * Creates a contact form entry in Shopify using Admin API metaobjects.
 */
async function createContactFormEntry({
  name,
  email,
  subject,
  message,
  context,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
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

  const timestamp = Date.now();
  const handle = `contact-${timestamp}-${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.substring(0, 255);

  const variables = {
    handle: {
      handle,
      type: 'contact_form',
    },
    metaobject: {
      fields: [
        {key: 'name', value: name},
        {key: 'email', value: email},
        {key: 'subject', value: subject},
        {key: 'message', value: message},
        {key: 'date', value: new Date().toISOString()},
      ],
      capabilities: {
        publishable: {
          status: 'ACTIVE',
        },
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
      query: CONTACT_FORM_MUTATION,
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
      metaobjectUpsert?: {
        metaobject?: {id: string; handle: string; type: string};
        userErrors?: Array<{field: string[]; message: string}>;
      };
    };
  };

  if (result.errors?.length) {
    throw new Error(
      `GraphQL errors: ${result.errors.map((e) => e.message).join(', ')}`,
    );
  }

  const userErrors = result.data?.metaobjectUpsert?.userErrors;
  if (userErrors?.length) {
    const err = userErrors[0];
    throw new Error(
      `Shopify API error: ${err.message}${err.field?.length ? ` (field: ${err.field.join('.')})` : ''}`,
    );
  }

  return {success: true, metaobject: result.data?.metaobjectUpsert?.metaobject};
}

/**
 * Hydrogen Server Route: handles POST requests for contact form submission.
 * Uses Admin API metaobjectUpsert to store contact entries.
 * POST /api/contact (or /{locale}/api/contact)
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return data(
      {error: 'Method not allowed', success: false},
      {status: 405},
    );
  }

  const formData = await request.formData();

  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const subject = (formData.get('subject') as string)?.trim();
  const message = (formData.get('message') as string)?.trim();

  if (!name || !email || !subject || !message) {
    return data(
      {error: 'All fields are required', success: false},
      {status: 400},
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return data(
      {error: 'Please enter a valid email address', success: false},
      {status: 400},
    );
  }

  try {
    await createContactFormEntry({
      name,
      email,
      subject,
      message,
      context,
    });
    return data({success: true, error: null});
  } catch (error: unknown) {
    console.error('Contact form submission error:', error);
    return data(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to submit contact form. Please try again later.',
        success: false,
      },
      {status: 500},
    );
  }
}

export default function ContactRoute() {
  return null;
}
