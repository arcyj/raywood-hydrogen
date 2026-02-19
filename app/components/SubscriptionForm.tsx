import {useState, useEffect} from 'react';
import {Link, useFetcher} from 'react-router';
import {Input} from '~/components/ui/Input';
import {Button} from '~/components/ui/Button';
import {useLocalizedPath} from '~/hooks/useLocalePath';
import { Privacy } from './icons';

type ActionResponse = {
  success?: boolean;
  error?: string | null;
};

interface SubscriptionFormProps {
  /** Optional placeholder for the email input */
  placeholder?: string;
  /** Optional button text */
  buttonText?: string;
  /** Optional success message */
  successMessage?: string;
  /** Optional class name for the form container */
  className?: string;
  /** Compact layout (single row) vs stacked layout */
  variant?: 'default' | 'compact';
}

/**
 * Customer subscription form that submits to the Hydrogen API server route.
 * Uses useFetcher for non-navigating form submission.
 */
export function SubscriptionForm({
  placeholder = 'Your email',
  buttonText = 'Subscribe',
  successMessage = "Thanks for subscribing! Use SUB10 with your next order to recieve 10% off discount code.",
  className = '',
  variant = 'default',
}: SubscriptionFormProps) {
  const fetcher = useFetcher<ActionResponse>();
  const withLocale = useLocalizedPath();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const isSubmitting = fetcher.state === 'submitting';
  const actionData = fetcher.data;

  // Build the action URL - use current path to preserve locale
  const subscribeAction = withLocale('/api/subscribe');

  useEffect(() => {
    if (actionData?.success) {
      setEmail('');
      setError('');
    }
    if (actionData?.error) {
      setError(actionData.error);
    }
  }, [actionData]);

  const handleChange = (value: string) => {
    setEmail(value);
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const trimmed = email.trim();
    if (!trimmed) {
      e.preventDefault();
      setError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      e.preventDefault();
      setError('Please enter a valid email address');
      return;
    }
    setError('');
  };

  if (variant === 'compact') {
    return (
      <div className={className}>
        <fetcher.Form method="POST" action={subscribeAction} className="flex gap-8" onSubmit={handleSubmit}>
          <div className="flex-1 min-w-0">
            <Input
              name="email"
              type="email"
              value={email}
              handleChange={handleChange}
              placeholder={placeholder}
              error={error}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="shrink-0"
          >
            {buttonText}
          </Button>
        </fetcher.Form>
        {error && (
          <p className="mt-8 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-cover rounded-lg px-24 py-44 relative ${className}`}
      style={{
        backgroundImage: `url(https://cdn.shopify.com/s/files/1/0738/0054/8663/files/269814421_08eac03a-33d6-4e73-81c8-8e1c9a783d8e.webp?v=1771499467)`,
      }}
    >
      <div className="max-w-[1200px] mx-auto grid grid-cols-3 justify-center items-center z-20 relative">
        <div className="col-span-3 md:col-span-2 pr-24 text-white">
          <h2 className="text-h1 font-semibold mb-12">
            Stay ahead of the game and recieve 10% off
          </h2>
          <p className="text-gray-600 mb-8 text-large-semi text-white">
            Subscribe to our newsletter and be the first to hear about brand-new
            TCG releases, restocks, exclusive drops, and special offers
          </p>
          <p className="text-gray-600 text-regular-semi text-white">
            As a welcome bonus, you’ll receive{' '}
            <span className="font-bold text-[18px]">10% off</span> your next
            order — just for joining our community!
          </p>
        </div>
        <fetcher.Form
          method="POST"
          action={subscribeAction}
          className="bg-white rounded-lg p-24 col-span-3 desktop:col-span-1 max-desktop:mt-44"
          onSubmit={handleSubmit}
        >
          {actionData?.success ? (
            <div className='text-center'>
              <p className="text-h3 text-green-600 pb-12" role="alert">
                Thanks for subscribing!
              </p>
              <p className="text-regular-semi" >Use <span className="text-large-semi font-bold">SUB10</span> discount code with your next order to receive 10% off</p>
            </div>
          ) : (
            <div className="space-y-16">
              <Input
                name="email"
                type="email"
                value={email}
                handleChange={handleChange}
                placeholder={placeholder}
                error={error}
                required
              />
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="w-full"
                variant="tertiary"
                size="medium"
              >
                {isSubmitting ? 'Subscribing...' : buttonText}
              </Button>
              <div className="mt-8 flex items-center">
                <Privacy size={32} />
                <p className="pl-12 text-small text-gray-600 border-l-2 border-solid border-black">
                  100% safe, Read more on{' '}
                  <Link
                    to="/policies/privacy-policy"
                    className="underline"
                    prefetch="intent"
                  >
                    privacy policy
                  </Link>
                  <br></br>
                  Unsubscribe anytime
                </p>
              </div>
            </div>
          )}
        </fetcher.Form>
      </div>
      <div className="absolute top-0 left-0 w-full h-full tw-inset-0 bg-primary opacity-40 z-10 rounded-lg"></div>
    </div>
  );
}
