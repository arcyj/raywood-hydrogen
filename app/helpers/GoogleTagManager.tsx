import {useAnalytics} from '@shopify/hydrogen';
import {useEffect} from 'react';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

type CartLineLike = {
  quantity?: number;
  merchandise?: {
    id?: string;
    product?: { title?: string };
    price?: { amount?: string };
  };
};

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
