import {Form, useActionData, useNavigation, data} from 'react-router';
import type {Route} from './+types/pages.contact-us';

export const meta: Route.MetaFunction = () => {
  return [{title: `Hydrogen | Contact Us`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Custom contact-us page doesn't need to fetch from Shopify
  return {};
}

type ActionResponse = {
  success?: boolean;
  error?: string;
};

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const message = formData.get('message') as string;

  // Validate required fields
  if (!email || !message) {
    return data<ActionResponse>(
      {error: 'Email and message are required'},
      {status: 400}
    );
  }

  try {
    // Get store domain from environment
    const storeDomain = context.env.PUBLIC_STORE_DOMAIN;
    if (!storeDomain) {
      throw new Error('Store domain not configured');
    }

    // Prepare form data in Shopify's contact form format
    const contactFormData = new URLSearchParams();
    contactFormData.append('contact[email]', email);
    if (name) {
      // Split name into first and last if provided
      const nameParts = name.trim().split(' ');
      if (nameParts.length > 1) {
        contactFormData.append('contact[first_name]', nameParts[0]);
        contactFormData.append('contact[last_name]', nameParts.slice(1).join(' '));
      } else {
        contactFormData.append('contact[first_name]', name);
      }
    }
    if (phone) {
      contactFormData.append('contact[phone]', phone);
    }
    contactFormData.append('contact[body]', message);

    // Submit to Shopify's contact endpoint
    const response = await fetch(`https://${storeDomain}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: contactFormData.toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit contact form: ${response.statusText}`);
    }

    return data<ActionResponse>({success: true});
  } catch (error) {
    console.error('Contact form submission error:', error);
    return data<ActionResponse>(
      {
        error: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
      },
      {status: 500}
    );
  }
}

export default function ContactUsPage() {
  const actionData = useActionData<ActionResponse>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="page container mx-auto">
      <header>
        <h1 className="text-h1 text-center mb-24">Contact Us</h1>
      </header>
      <main className="max-w-2xl mx-auto">
        <p className="text-center mb-8">
          We'd love to hear from you! Get in touch with us.
        </p>

        {actionData?.success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
            <p className="font-medium">Thank you for your message!</p>
            <p className="text-sm mt-1">We'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <Form method="POST" className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your phone number"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your message..."
              />
            </div>

            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                <p className="text-sm">{actionData.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </Form>
        )}
      </main>
    </div>
  );
}
