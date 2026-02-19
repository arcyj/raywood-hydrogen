import {SubscriptionForm} from '~/components/SubscriptionForm';
import type {Route} from './+types/pages.subscribe';
import {getSeoMeta, getAbsoluteUrl} from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches, location}) => {
  const url = getAbsoluteUrl(matches ?? [], location);
  return getSeoMeta({
    title: 'Newsletter | Playpeak',
    description: 'Subscribe to our newsletter for updates and offers.',
    url,
    type: 'website',
  });
};

export async function loader(_args: Route.LoaderArgs) {
  return {};
}

export default function SubscribePage() {
  return (
    <div className="mx-auto container">
      <SubscriptionForm
        placeholder="Your email address"
        buttonText="Subscribe"
        successMessage="Thanks for subscribing! We'll be in touch soon."
        className="max-w-md"
      />
    </div>
  );
}
