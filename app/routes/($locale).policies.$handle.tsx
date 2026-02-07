import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/policies.$handle';
import {type Shop} from '@shopify/hydrogen/storefront-api-types';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';
import { POLICIES_QUERY } from './($locale).policies._index';
import { getSeoMeta, getAbsoluteUrl } from '~/lib/seo';

type SelectedPolicies = keyof Pick<
  Shop,
  'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
>;

export const meta: Route.MetaFunction = ({data, matches, location}) => {
  const title = data?.policy?.title ? `${data.policy.title} | Playpeak` : 'Policies | Playpeak';
  const url = getAbsoluteUrl(matches ?? [], location);
  return getSeoMeta({ title, url, type: 'website' });
};

export async function loader({params, context}: Route.LoaderArgs) {

    const policyData: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

    const shopPolicies = policyData.shop;
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


  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as SelectedPolicies;

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  return {policy, policies};
}

export default function Policy() {
  const {policy, policies} = useLoaderData<typeof loader>();
  const currentHandle = policy.handle;
  return (
    <div className="policy container-narrow pt-24 pb-80 max-tablet:pt-44">
      <nav className="flex justify-center pb-24 flex-wrap">
        {policies.map((policy) => (
          <fieldset key={policy.id}>
            <Link
              to={`/policies/${policy.handle}`}
              className={`text-medium-semi hover:text-primary ${policy.handle === currentHandle ? 'text-primary underline': null}`}
            >
              {policy.title}
            </Link>
          </fieldset>
        ))}
      </nav>
      <div className="col-span-6">
        <h1 className="text-h1 mb-24 text-center">{policy.title}</h1>
        <div
          className="page-content"
          dangerouslySetInnerHTML={{__html: policy.body}}
        />
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
` as const;
