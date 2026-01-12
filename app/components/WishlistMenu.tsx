import { Link } from 'react-router';
import { useDrawer } from './ui/Drawer';
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
  const { onClose } = useDrawer();
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

    // Get current locale from URL or default to empty
    const currentPath = window.location.pathname;
    const localeMatch = currentPath.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';

    fetch(`${localePrefix}/api/wishlist/products?handles=${encodeURIComponent(handlesParam)}`)
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
      <div className="wishlist-menu p-16">
        <h2 className="text-2xl font-bold mb-16">Wishlist</h2>
        <p className="text-body-regular text-text-layout-secondary">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="wishlist-menu p-16">
      <h2 className="text-2xl font-bold mb-16">Wishlist</h2>
      {wishlistHandles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-body-regular text-text-layout-secondary mb-16">
            Your wishlist is empty
          </p>
          <Link
            to="/collections"
            onClick={onClose}
            className="px-16 py-12 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {products.map((product) => (
            <ProductLineItem
              key={product.id}
              product={product as any}
              onRemove={() => removeFromWishlist(product.handle)}
              onClose={onClose}
              variantId={product.selectedOrFirstAvailableVariant?.id}
              variantAvailableForSale={product.selectedOrFirstAvailableVariant?.availableForSale}
            />
          ))}
        </div>
      )}
    </div>
  );
};
