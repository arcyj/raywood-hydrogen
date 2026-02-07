import {useState, useEffect} from 'react';
import {Form, useActionData, useNavigation, data} from 'react-router';
import {Input} from '~/components/ui/Input';
import {Button} from '~/components/ui/Button';
import {CONTACT_FORM_MUTATION} from '~/graphql/ContactFormMutation';
import type {Route} from './+types/pages.contact';
import { getSeoMeta, getAbsoluteUrl } from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches, location}) => {
  const url = getAbsoluteUrl(matches ?? [], location);
  return getSeoMeta({
    title: 'Contact Us | Playpeak',
    description: 'Get in touch with Playpeak.',
    url,
    type: 'website',
  });
};

export async function loader(args: Route.LoaderArgs) {
  // Custom contact-us page doesn't need to fetch from Shopify
  return {};
}

export type ActionResponse = {
  success?: boolean;
  error?: string | null;
};

/**
 * Creates a contact form entry in Shopify using Admin API metaobjects
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

  // Check if Admin API credentials are available
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

  // Clean store domain (remove https:// if present)
  const cleanDomain = storeDomain
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  const adminApiUrl = `https://distream.myshopify.com/admin/api/2024-10/graphql.json`;

  // Generate a unique handle for this submission
  const timestamp = Date.now();
  const handle = `contact-${timestamp}-${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.substring(0, 255); // Shopify has a 255 character limit for handles

  const variables = {
    handle: {
      handle: handle,
      type: 'contact_form',
    },
    metaobject: {
      fields: [
        {
          key: 'name',
          value: name,
        },
        {
          key: 'email',
          value: email,
        },
        {
          key: 'subject',
          value: subject,
        },
        {
          key: 'message',
          value: message,
        },
        {
          key: 'date',
          value: new Date().toISOString(),
        },
      ],
      capabilities: {
        publishable: {
          status: 'ACTIVE',
        },
      },
    },
  };

  try {
    const requestBody = {
      query: CONTACT_FORM_MUTATION,
      variables,
    };

    const response = await fetch(adminApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify(requestBody),
    });

    // Check if response is OK
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
          metaobject?: {
            id: string;
            handle: string;
            type: string;
          };
          userErrors?: Array<{field: string[]; message: string}>;
        };
      };
    };

    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors.map((e) => e.message).join(', ');
      throw new Error(`GraphQL errors: ${errorMessages}`);
    }

    const userErrors = result.data?.metaobjectUpsert?.userErrors;
    if (userErrors && userErrors.length > 0) {
      const userError = userErrors[0];
      throw new Error(
        `Shopify API error: ${userError.message} (field: ${userError.field.join('.')})`,
      );
    }

    return {
      success: true,
      metaobject: result.data?.metaobjectUpsert?.metaobject,
    };
  } catch (error: any) {
    console.error('Error creating contact form entry:', error);
    throw error;
  }
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  // Basic validation
  if (!name || !email || !subject || !message) {
    return data(
      {error: 'All fields are required', success: false},
      {status: 400},
    );
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return data(
      {error: 'Please enter a valid email address', success: false},
      {status: 400},
    );
  }

  try {
    // Submit to Shopify using Admin API
    await createContactFormEntry({
      name,
      email,
      subject,
      message,
      context,
    });

    return data({success: true, error: null});
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    return data(
      {
        error:
          error.message ||
          'Failed to submit contact form. Please try again later.',
        success: false,
      },
      {status: 500},
    );
  }
}

export default function ContactUsPage() {
  const actionData = useActionData<ActionResponse>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form on successful submission
  useEffect(() => {
    if (actionData?.success) {
      setFormData({name: '', email: '', subject: '', message: ''});
      setErrors({});
    }
  }, [actionData?.success]);

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({...prev, [field]: value}));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({...prev, [field]: ''}));
    }
  };

  const successMessage = actionData?.success ? (
    <div className="mb-16 rounded-lg bg-green-50 p-16 text-green-800">
      Thank you for contacting us! We'll get back to you soon.
    </div>
  ) : null;

  const errorMessage = actionData?.error ? (
    <div className="mb-16 rounded-lg bg-red-50 p-16 text-red-800">
      {actionData.error}
    </div>
  ) : null;

  return (
    <div className="mx-auto max-w-2xl px-16 py-32">
      <h1 className="mb-32 text-4xl font-bold">Contact Us</h1>
      <p className="mb-32 text-lg text-gray-600">
        Have a question? We'd love to hear from you. Send us a message and we'll
        respond as soon as possible.
      </p>

      {successMessage}
      {errorMessage}

      <Form method="POST" className="space-y-24">
        <Input
          name="name"
          value={formData.name}
          handleChange={handleChange('name')}
          placeholder="Your Name"
          error={errors.name}
        />

        <Input
          name="email"
          type="email"
          value={formData.email}
          handleChange={handleChange('email')}
          placeholder="Your Email"
          error={errors.email}
        />

        <Input
          name="subject"
          value={formData.subject}
          handleChange={handleChange('subject')}
          placeholder="Subject"
          error={errors.subject}
        />

        <div className="relative">
          <label
            htmlFor="message"
            className="mb-8 block text-sm font-medium text-gray-700"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={(e) => handleChange('message')(e.target.value)}
            placeholder="Your Message"
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-16 py-12 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {errors.message && (
            <p className="mt-8 text-sm text-red-600">{errors.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </Form>
    </div>
  );
}
