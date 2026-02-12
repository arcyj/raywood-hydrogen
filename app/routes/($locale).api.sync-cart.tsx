import type {CountryCode} from '@shopify/hydrogen/storefront-api-types';
import {data} from 'react-router';
import type {Route} from './+types/api.sync-cart';

/**
 * Syncs the cart's buyer identity to the selected currency's country.
 * Called when user changes currency via CurrencySwitcher. Uses country from cookie.
 * POST /api/sync-cart – no locale in URL.
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({error: 'Method not allowed'}, {status: 405});
  }

  const {cart, storefront} = context;
  const countryCode = (storefront.i18n as {country?: string}).country as
    | CountryCode
    | undefined;

  if (!countryCode) {
    return Response.json({synced: false, reason: 'no-locale'}, {status: 200});
  }

  const existing = await cart.get();
  if (!existing?.id) {
    return Response.json({synced: false, reason: 'no-cart'}, {status: 200});
  }

  if (existing.buyerIdentity?.countryCode === countryCode) {
    return Response.json({synced: true, reason: 'already-synced'}, {status: 200});
  }

  const result = await cart.updateBuyerIdentity({countryCode});
  const headers = result?.cart?.id ? cart.setCartId(result.cart.id) : new Headers();

  return data(
    {synced: true, cart: result?.cart},
    {status: 200, headers},
  );
}

export default function SyncCartRoute() {
  return null;
}
