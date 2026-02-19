import {useState, useEffect} from 'react';
import {useFetcher} from 'react-router';
import {Input} from '~/components/ui/Input';
import {Button} from '~/components/ui/Button';
import {useLocalizedPath} from '~/hooks/useLocalePath';
import type {Route} from './+types/pages.contact';
import {getSeoMeta, getAbsoluteUrl} from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches, location}) => {
  const url = getAbsoluteUrl(matches ?? [], location);
  return getSeoMeta({
    title: 'Contact Us | Playpeak',
    description: 'Get in touch with Playpeak.',
    url,
    type: 'website',
  });
};

export async function loader(_args: Route.LoaderArgs) {
  return {};
}

export type ActionResponse = {
  success?: boolean;
  error?: string | null;
};

export default function ContactUsPage() {
  const fetcher = useFetcher<ActionResponse>();
  const withLocale = useLocalizedPath();
  const actionData = fetcher.data;
  const isSubmitting = fetcher.state === 'submitting';

  const contactAction = withLocale('/api/contact');

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
    <div className="mx-auto container max-tablet:pt-24 tablet:pb-44">
      <h1 className="text-h1 text-center mb-24 mt-44">Contact Us</h1>
      <div className="px-16 py-32 grid grid-cols-1 gap-32 tablet:grid-cols-2">
        <div>
          <span className="text-medium-semi text-gray block">Address:</span>
          <span className="text-regular-semi block mb-24">DISTREAM OU, Sakala tn 7-2, 10141 Tallinn , Estonia</span>

          <span className="text-medium-semi text-gray block">Phone:</span>
          <span className="text-regular-semi block mb-24"><a href="tel:+37258855058" className='hover:text-primary'>+372 58855058</a></span>

          <span className="text-medium-semi text-gray block">Email:</span>
          <span className="text-regular-semi block mb-24"><a href="mailto:info@playpeak.eu" className='hover:text-primary'>info@playpeak.eu</a></span>

          <span className="text-medium-semi text-gray block">VAT number:</span>
          <span className="text-regular-semi block mb-24">EE102414905</span>

          <span className="text-medium-semi text-gray block">Hours:</span>
          <span className="text-regular-semi block">Monday - Friday: 9am - 6pm</span>
          <span className="text-regular-semi block mb-24">Saturday and Sunday - Closed</span>
        </div>
        <div>
          <p className="mb-32 text-regular-semi text-gray-600">
            Have a question? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>

          {successMessage}
          {errorMessage}

          <fetcher.Form
            method="POST"
            action={contactAction}
            className="space-y-24"
          >
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
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
