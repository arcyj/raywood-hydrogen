import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';
import {useLocalizedPath} from '~/hooks/useLocalePath';

export async function loader({context}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();
  const withLocale = useLocalizedPath();

  return (
    <div className="policies container-narrow mx-auto max-tablet:pt-24">
      <h1 className="text-h1 text-center mb-24 mt-44">Policies</h1>
      <div className="flex justify-center flex-wrap">
        {policies.map((policy) => (
          <fieldset key={policy.id} >
            <Link
              to={withLocale(`/policies/${policy.handle}`)}
              className="text-regular-semi bg-lightGrey py-24 px-12 rounded hover:bg-accentGrey "
            >
              {policy.title}
            </Link>
          </fieldset>
        ))}
      </div>
    </div>
  );
}

export const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
