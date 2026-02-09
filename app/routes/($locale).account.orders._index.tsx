import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef, useState, useEffect} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {Input} from '~/components/ui/Input';
import {Button} from '~/components/ui/Button';
import {useLocalizedPath} from '~/hooks/useLocalePath';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;
  const withLocale = useLocalizedPath();

  return (
    <div className="orders">
      <h2 className="text-2xl font-semibold mb-6">Orders</h2>
      <OrderSearchForm currentFilters={filters} />
      <div className="mt-8">
        <OrdersTable orders={orders} filters={filters} withLocale={withLocale} />
      </div>
    </div>
  );
}

function OrdersTable({
  orders,
  filters,
  withLocale,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
  withLocale: (path: string) => string;
}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div className="account-orders" aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => (
            <OrderItem key={order.id} order={order} withLocale={withLocale} />
          )}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} withLocale={withLocale} />
      )}
    </div>
  );
}

function EmptyOrders({
  hasFilters = false,
  withLocale,
}: {
  hasFilters?: boolean;
  withLocale: (path: string) => string;
}) {
  return (
    <div className="py-12 text-center">
      {hasFilters ? (
        <div className="space-y-4">
          <p className="text-gray-600">No orders found matching your search.</p>
          <Link
            to={withLocale('/account/orders')}
            className="text-[#943BF2] hover:text-[#AE6AF5] font-medium inline-flex items-center gap-1"
          >
            Clear filters →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">You haven&apos;t placed any orders yet.</p>
          <Link
            to={withLocale('/collections')}
            className="text-[#943BF2] hover:text-[#AE6AF5] font-medium inline-flex items-center gap-1"
          >
            Start Shopping →
          </Link>
        </div>
      )}
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const [orderNumber, setOrderNumber] = useState(currentFilters.name || '');
  const [confirmationNumber, setConfirmationNumber] = useState(
    currentFilters.confirmationNumber || '',
  );

  useEffect(() => {
    setOrderNumber(currentFilters.name || '');
    setConfirmationNumber(currentFilters.confirmationNumber || '');
  }, [currentFilters.name, currentFilters.confirmationNumber]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();

    const name = orderNumber.trim();
    const confNumber = confirmationNumber.trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="order-search-form"
      aria-label="Search orders"
    >
      <fieldset className="border border-gray-200 rounded-lg p-6 space-y-4">
        <legend className="text-lg font-medium px-2">Filter Orders</legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder="Order #"
            value={orderNumber}
            handleChange={(value) => setOrderNumber(value)}
          />
          <Input
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder="Confirmation #"
            value={confirmationNumber}
            handleChange={(value) => setConfirmationNumber(value)}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSearching} loading={isSearching}>
            {isSearching ? 'Searching' : 'Search'}
          </Button>
          {hasFilters && (
            <Button
              type="button"
              variant="tertiary"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                setOrderNumber('');
                setConfirmationNumber('');
                formRef.current?.reset();
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </fieldset>
    </form>
  );
}

function OrderItem({
  order,
  withLocale,
}: {
  order: OrderItemFragment;
  withLocale: (path: string) => string;
}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-4">
            <Link
              to={withLocale(`/account/orders/${btoa(order.id)}`)}
              className="text-lg font-semibold text-[#943BF2] hover:text-[#AE6AF5]"
            >
              #{order.number}
            </Link>
            <span className="text-sm text-gray-500">
              {new Date(order.processedAt).toDateString()}
            </span>
          </div>
          {order.confirmationNumber && (
            <p className="text-sm text-gray-600">
              Confirmation: {order.confirmationNumber}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
              {order.financialStatus}
            </span>
            {fulfillmentStatus && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {fulfillmentStatus}
              </span>
            )}
          </div>
          <div className="text-lg font-semibold">
            <Money data={order.totalPrice} />
          </div>
        </div>
        <Link
          to={withLocale(`/account/orders/${btoa(order.id)}`)}
          className="text-[#943BF2] hover:text-[#AE6AF5] font-medium inline-flex items-center gap-1 whitespace-nowrap"
        >
          View Order →
        </Link>
      </div>
    </div>
  );
}
