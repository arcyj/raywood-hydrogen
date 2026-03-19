import { Link } from 'react-router';
import { usePlaypeak } from '~/lib/playpeakContext';
import { useWishlist } from '~/hooks/useWishlist';
import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { ProductLineItem } from './ProductLineItem';

interface WishlistProduct {
  id: string;
  title: string;
  handle: string;
  vendor?: string | null;
  priceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    } | null;
  } | null;
  featuredImage?: {
    url: string;
    altText?: string | null;
  } | null;
  selectedOrFirstAvailableVariant?: {
    id: string;
    availableForSale: boolean;
  } | null;
}

export const WishlistMenu: FC = () => {
  const { closeDrawer } = usePlaypeak()
  const { wishlistHandles, isLoading: wishlistLoading, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Fetch products when wishlist handles change
  useEffect(() => {
    if (wishlistHandles.length === 0) {
      setProducts([]);
      return;
    }

    setIsLoadingProducts(true);
    const handlesParam = wishlistHandles.join(',');

    // No locale in URL – currency in context
    fetch(`/api/wishlist/products?handles=${encodeURIComponent(handlesParam)}`)
      .then((res) => res.json() as Promise<{ products?: WishlistProduct[] }>)
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
        }
      })
      .catch((error) => {
        console.error('Error fetching wishlist products:', error);
        setProducts([]);
      })
      .finally(() => {
        setIsLoadingProducts(false);
      });
  }, [wishlistHandles]);

  const isLoading = wishlistLoading || isLoadingProducts;

  if (isLoading) {
    return (
      <div className="wishlist-menu pt-12">
        <ul className="predictive-search-result-items">
          <li className="predictive-search-result-item flex w-full mt-8">
            <div className="mix-blend-darken mr-8">
              <div className="skeleton-shimmer rounded aspect-square h-[60px] w-[60px]" />
            </div>
            <div className="mt-4 space-y-2 flex-1 w-full">
              <div className="h-4 skeleton-shimmer rounded w-2/3" />
              <div className="h-4 skeleton-shimmer rounded w-1/3" />
              <div className="h-12 skeleton-shimmer rounded w-24 mt-4" />
            </div>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="wishlist-menu pt-12 overflow-y-auto h-full pb-64">
      {wishlistHandles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-body-regular text-text-layout-secondary mb-16">
            Your wishlist is empty
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {products.map((product) => (
            <ProductLineItem
              key={product.id}
              product={product as any}
              onRemove={() => removeFromWishlist(product.handle)}
              onClose={closeDrawer}
              variantId={product.selectedOrFirstAvailableVariant?.id}
              variantAvailableForSale={product.selectedOrFirstAvailableVariant?.availableForSale}
            />
          ))}
        </div>
      )}
    </div>
  );
};
