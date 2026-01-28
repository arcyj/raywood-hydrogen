import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import type {Route} from './+types/account.profile';
import {Input} from '~/components/ui/Input';
import {Button} from '~/components/ui/Button';
import {useState, useEffect} from 'react';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Profile'}];
};

export async function loader({context}: Route.LoaderArgs) {
  context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;

  const [firstName, setFirstName] = useState(customer.firstName ?? '');
  const [lastName, setLastName] = useState(customer.lastName ?? '');

  useEffect(() => {
    setFirstName(customer.firstName ?? '');
    setLastName(customer.lastName ?? '');
  }, [customer.firstName, customer.lastName]);

  return (
    <div className="account-profile">
      <h2 className="text-2xl font-semibold mb-6">My profile</h2>
      <Form method="PUT" className="max-w-2xl">
        <fieldset className="space-y-6">
          <legend className="text-lg font-medium mb-4">Personal information</legend>
          <div className="space-y-4">
            <Input
              name="firstName"
              type="text"
              placeholder="First name"
              value={firstName}
              handleChange={(value) => setFirstName(value)}
            />
            <Input
              name="lastName"
              type="text"
              placeholder="Last name"
              value={lastName}
              handleChange={(value) => setLastName(value)}
            />
          </div>
          {action?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{action.error}</p>
            </div>
          )}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={state !== 'idle'}
              loading={state !== 'idle'}
            >
              {state !== 'idle' ? 'Updating' : 'Update'}
            </Button>
          </div>
        </fieldset>
      </Form>
    </div>
  );
}
