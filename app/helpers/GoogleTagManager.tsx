import {useAnalytics, sendShopifyAnalytics, AnalyticsEventName, getClientBrowserParameters} from '@shopify/hydrogen';
import {useEffect} from 'react';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

function getHasUserConsent(): boolean {
  if (typeof window === 'undefined') return false;
  const cp = (window as any).Shopify?.customerPrivacy;
  return typeof cp?.analyticsProcessingAllowed === 'function'
    ? cp.analyticsProcessingAllowed()
    : true;
}

type CartLineLike = {
  quantity?: number;
  merchandise?: {
    id?: string;
    product?: { id?: string; title?: string; vendor?: string; productType?: string };
    price?: { amount?: string };
    title?: string;
    sku?: string;
  };
};

type ShopLike = {
  shopId?: string;
  currency?: string;
  acceptedLanguage?: string;
  hydrogenSubchannelId?: string;
  storefrontId?: string;
};

/** Send add-to-cart event to Shopify Analytics (separate from GA4/GTM) */
function sendAddToCartToShopify(payload: Record<string, unknown>) {
  const cart = payload.cart as { id?: string; lines?: { nodes?: CartLineLike[] } } | undefined;
  const currentLine = payload.currentLine as CartLineLike | undefined;
  const shop = payload.shop as ShopLike | undefined;

  if (!cart?.id || !shop?.shopId || !shop?.currency) return;

  const hasUserConsent = getHasUserConsent();
  if (!hasUserConsent) return;

  const line = currentLine ?? cart?.lines?.nodes?.[0];
  const merch = line?.merchandise;
  const product = merch?.product;

  if (!product?.id || !merch?.id || !merch?.price?.amount || !product?.title || !product?.vendor)
    return;

  const shopifyProduct = {
    productGid: product.id,
    variantGid: merch.id,
    name: product.title,
    variantName: merch.title,
    brand: product.vendor,
    category: product.productType,
    price: merch.price.amount,
    sku: merch.sku,
    quantity: line?.quantity ?? 1,
  };

  const analyticsPayload = {
    ...getClientBrowserParameters(),
    hasUserConsent,
    shopId: shop.shopId,
    currency: shop.currency,
    hydrogenSubchannelId: shop.hydrogenSubchannelId ?? shop.storefrontId,
    acceptedLanguage: shop.acceptedLanguage ?? 'en',
    shopifySalesChannel: 'hydrogen' as const,
    cartId: cart.id,
    products: [shopifyProduct],
  };

  sendShopifyAnalytics({
    eventName: AnalyticsEventName.ADD_TO_CART,
    payload: analyticsPayload as Parameters<typeof sendShopifyAnalytics>[0]['payload'],
  });
}

/** Build GA4 ecommerce items from cart payload (currentLine or cart.lines) */
function getGA4ItemsFromPayload(payload: Record<string, unknown>): {
  items: Array<{
    item_id?: string;
    item_name?: string;
    price?: number;
    quantity?: number;
    item_variant?: string;
  }>;
  value?: number;
  currency?: string;
} {
  const cart = payload.cart as { lines?: { nodes?: CartLineLike[] } } | undefined;
  const currentLine = payload.currentLine as CartLineLike | undefined;
  const shop = payload.shop as { currency?: string } | undefined;
  const linesArray = cart?.lines;
  const nodes = linesArray?.nodes ?? (currentLine ? [currentLine] : []);
  const items = nodes.map((line) => {
    const merch = line?.merchandise;
    const amount = merch?.price?.amount;
    const qty = line?.quantity ?? 1;
    return {
      item_id: merch?.id,
      item_name: merch?.product?.title,
      price: amount != null ? parseFloat(String(amount)) : undefined,
      quantity: qty,
      item_variant: merch?.id,
    };
  });
  const value = items.reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 1), 0);
  return {
    items,
    value: value || undefined,
    currency: shop?.currency,
  };
}

export function GoogleTagManager() {
  const {subscribe, register} = useAnalytics();
  const {ready} = register('Google Tag Manager');

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];

    subscribe('product_viewed', () => {
      window.dataLayer.push({event: 'viewed-product'});
    });

    subscribe('cart_viewed', (payload) => {
      window.dataLayer.push({event: 'cart-viewed', payload});
    });

    subscribe('cart_updated', (payload) => {
      window.dataLayer.push({event: 'cart-updated', payload});
    });

    subscribe('product_added_to_cart', (payload: Record<string, unknown>) => {
      window.dataLayer.push({event: 'product-added-to-cart', payload});

      // Send to Shopify Analytics (Admin → Reports → Analytics)
      sendAddToCartToShopify(payload);

      const {items, value, currency} = getGA4ItemsFromPayload(payload);
      if (items.length) {
        window.dataLayer.push({ecommerce: null});
        window.dataLayer.push({
          event: 'add_to_cart',
          ecommerce: {
            currency: currency ?? undefined,
            value: value ?? 0,
            items,
          },
        });
      }
    });

    subscribe('product_removed_from_cart', (payload) => {
      window.dataLayer.push({event: 'product-removed-from-cart', payload});
    });

    ready();
  }, [ready, subscribe]);

  return null;
}
