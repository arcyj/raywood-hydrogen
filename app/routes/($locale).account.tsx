import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {Button} from '~/components/ui/Button';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="account max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-h1 font-bold mb-8 mb-24 mt-44">{heading}</h1>
      <AccountMenu />
      <div className="mt-8">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  return (
    <nav role="navigation" className="flex items-center gap-4 pb-6 border-b border-gray-200">
      <NavLink
        to="/account/orders"
        className={({isActive, isPending}) =>
          `text-base font-medium transition-colors ${
            isPending
              ? 'text-gray-400'
              : isActive
                ? 'text-[#943BF2] border-b-2 border-[#943BF2] pb-1'
                : 'text-gray-700 hover:text-[#943BF2]'
          }`
        }
      >
        Orders
      </NavLink>
      <span className="text-gray-300">|</span>
      <NavLink
        to="/account/profile"
        className={({isActive, isPending}) =>
          `text-base font-medium transition-colors ${
            isPending
              ? 'text-gray-400'
              : isActive
                ? 'text-[#943BF2] border-b-2 border-[#943BF2] pb-1'
                : 'text-gray-700 hover:text-[#943BF2]'
          }`
        }
      >
        Profile
      </NavLink>
      <span className="text-gray-300">|</span>
      <NavLink
        to="/account/addresses"
        className={({isActive, isPending}) =>
          `text-base font-medium transition-colors ${
            isPending
              ? 'text-gray-400'
              : isActive
                ? 'text-[#943BF2] border-b-2 border-[#943BF2] pb-1'
                : 'text-gray-700 hover:text-[#943BF2]'
          }`
        }
      >
        Addresses
      </NavLink>
      <span className="flex-1"></span>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form method="POST" action="/account/logout">
      <Button type="submit" variant="tertiary" size="medium">
        Sign out
      </Button>
    </Form>
  );
}
