import {useAnalytics} from '@shopify/hydrogen';
import {useEffect} from 'react';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export function GoogleTagManager() {
  const {subscribe, register} = useAnalytics();
  const {ready} = register('Google Tag Manager');

  useEffect(() => {
    subscribe('product_viewed', () => {
      // Triggering a custom event in GTM when a product is viewed
      window.dataLayer.push({'event': 'viewed-product'});
    });

    subscribe('cart_viewed', (payload) => {
      window.dataLayer.push({event: 'cart-viewed', payload});
    });

    subscribe('cart_updated', (payload) => {
      window.dataLayer.push({event: 'cart-updated', payload});
    });

    subscribe('product_added_to_cart', (payload) => {
      window.dataLayer.push({event: 'product-added-to-cart', payload});
    });

    subscribe('product_removed_from_cart', (payload) => {
      window.dataLayer.push({event: 'product-removed-from-cart', payload});
    });

    ready();
  }, [ready, subscribe]);

  return null;
}
