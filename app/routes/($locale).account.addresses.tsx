import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type Fetcher,
} from 'react-router';
import type {Route} from './+types/account.addresses';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';
import {Input} from '~/components/ui/Input';
import {Button} from '~/components/ui/Button';
import {useState, useEffect} from 'react';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Addresses'}];
};

export async function loader({context}: Route.LoaderArgs) {
  context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {defaultAddress, addresses} = customer;

  return (
    <div className="account-addresses">
      <h2 className="text-2xl font-semibold mb-6">Addresses</h2>
      {!addresses.nodes.length ? (
        <div className="py-8">
          <p className="text-gray-600 mb-4">You have no addresses saved.</p>
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Create address</h3>
            <NewAddressForm />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium mb-4">Create address</h3>
            <NewAddressForm />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Existing addresses</h3>
            <ExistingAddresses
              addresses={addresses}
              defaultAddress={defaultAddress}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div className="pt-4">
          <button
            disabled={stateForMethod('POST') !== 'idle'}
            type="submit"
            formMethod="POST"
            className="inline-flex items-center justify-center rounded text-center no-underline font-semibold transition-all duration-100 ease-in-out border-2 border-[#943BF2] bg-[#943BF2] text-white hover:bg-[#AE6AF5] hover:border-[#AE6AF5] text-label-l h-56 px-16 disabled:bg-surface-high-primary-disabled disabled:cursor-not-allowed"
          >
            {stateForMethod('POST') !== 'idle' ? 'Creating' : 'Create'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
}: Pick<CustomerFragment, 'addresses' | 'defaultAddress'>) {
  return (
    <div className="space-y-6">
      {addresses.nodes.map((address) => (
        <div key={address.id} className="border border-gray-200 rounded-lg p-6">
          <AddressForm
            addressId={address.id}
            address={address}
            defaultAddress={defaultAddress}
          >
            {({stateForMethod}) => (
              <div className="flex gap-3 pt-4">
                <button
                  disabled={stateForMethod('PUT') !== 'idle'}
                  formMethod="PUT"
                  type="submit"
                  className="inline-flex items-center justify-center rounded text-center no-underline font-semibold transition-all duration-100 ease-in-out border-2 border-[#943BF2] bg-[#943BF2] text-white hover:bg-[#AE6AF5] hover:border-[#AE6AF5] text-label-l h-56 px-16 disabled:bg-surface-high-primary-disabled disabled:cursor-not-allowed"
                >
                  {stateForMethod('PUT') !== 'idle' ? 'Saving' : 'Save'}
                </button>
                <button
                  disabled={stateForMethod('DELETE') !== 'idle'}
                  formMethod="DELETE"
                  type="submit"
                  className="inline-flex items-center justify-center rounded text-center no-underline font-semibold transition-all duration-100 ease-in-out border border-solid border-buttons-tertiary bg-transparent-full text-text-buttons-tertiary hover:border-layout-accent hover:bg-surface-low-brand-focus hover:text-text-buttons-tertiary-focus text-label-l h-56 px-16 disabled:border-layout-high disabled:text-text-layout-medium disabled:cursor-not-allowed"
                >
                  {stateForMethod('DELETE') !== 'idle' ? 'Deleting' : 'Delete'}
                </button>
              </div>
            )}
          </AddressForm>
        </div>
      ))}
    </div>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;

  const [formData, setFormData] = useState({
    firstName: address?.firstName ?? '',
    lastName: address?.lastName ?? '',
    company: address?.company ?? '',
    address1: address?.address1 ?? '',
    address2: address?.address2 ?? '',
    city: address?.city ?? '',
    zoneCode: address?.zoneCode ?? '',
    zip: address?.zip ?? '',
    territoryCode: address?.territoryCode ?? '',
    phoneNumber: address?.phoneNumber ?? '',
  });

  useEffect(() => {
    setFormData({
      firstName: address?.firstName ?? '',
      lastName: address?.lastName ?? '',
      company: address?.company ?? '',
      address1: address?.address1 ?? '',
      address2: address?.address2 ?? '',
      city: address?.city ?? '',
      zoneCode: address?.zoneCode ?? '',
      zip: address?.zip ?? '',
      territoryCode: address?.territoryCode ?? '',
      phoneNumber: address?.phoneNumber ?? '',
    });
  }, [address]);

  const updateField = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  return (
    <Form id={addressId}>
      <fieldset className="space-y-4">
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="firstName"
            type="text"
            placeholder="First name"
            value={formData.firstName}
            handleChange={updateField('firstName')}
          />
          <Input
            name="lastName"
            type="text"
            placeholder="Last name"
            value={formData.lastName}
            handleChange={updateField('lastName')}
          />
        </div>
        <Input
          name="company"
          type="text"
          placeholder="Company"
          value={formData.company}
          handleChange={updateField('company')}
        />
        <Input
          name="address1"
          type="text"
          placeholder="Address line 1"
          value={formData.address1}
          handleChange={updateField('address1')}
        />
        <Input
          name="address2"
          type="text"
          placeholder="Address line 2"
          value={formData.address2}
          handleChange={updateField('address2')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="city"
            type="text"
            placeholder="City"
            value={formData.city}
            handleChange={updateField('city')}
          />
          <Input
            name="zoneCode"
            type="text"
            placeholder="State / Province"
            value={formData.zoneCode}
            handleChange={updateField('zoneCode')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="zip"
            type="text"
            placeholder="Zip / Postal Code"
            value={formData.zip}
            handleChange={updateField('zip')}
          />
          <Input
            name="territoryCode"
            type="text"
            placeholder="Country Code"
            value={formData.territoryCode}
            handleChange={updateField('territoryCode')}
          />
        </div>
        <Input
          name="phoneNumber"
          type="tel"
          placeholder="+16135551111"
          value={formData.phoneNumber}
          handleChange={updateField('phoneNumber')}
        />
        <div className="flex items-center gap-2 pt-2">
          <input
            defaultChecked={isDefaultAddress}
            id={`defaultAddress-${addressId}`}
            name="defaultAddress"
            type="checkbox"
            className="w-4 h-4 text-[#943BF2] border-gray-300 rounded focus:ring-[#943BF2]"
          />
          <label
            htmlFor={`defaultAddress-${addressId}`}
            className="text-sm text-gray-700 cursor-pointer"
          >
            Set as default address
          </label>
        </div>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {children({
          stateForMethod: (method) => (formMethod === method ? state : 'idle'),
        })}
      </fieldset>
    </Form>
  );
}
