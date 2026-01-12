import { Link } from 'react-router';
import { useDrawer } from './ui/Drawer';
import { useWishlist } from '~/hooks/useWishlist';
import { Money, Image} from '@shopify/hydrogen';
import { useVariantUrl } from '~/lib/variants';
import type { MoneyV2 } from '@shopify/hydrogen/storefront-api-types';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

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
            <WishlistItem
              key={product.id}
              product={product}
              onRemove={() => removeFromWishlist(product.handle)}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function WishlistItem({
  product,
  onRemove,
  onClose,
}: {
  product: WishlistProduct;
  onRemove: () => void;
  onClose: () => void;
}) {
  const variantUrl = useVariantUrl(product.handle);

  return (
    <div className="wishlist-item flex gap-16 border-b border-gray-200 pb-16 pt-12">
      {/* Product Image */}
      {product.featuredImage ? (
        <Link
          to={variantUrl}
          onClick={onClose}
          className="flex-shrink-0 w-[50px] h-[50px] "
          prefetch="intent"
        >
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            className="w-[50px] h-[50px] object-cover rounded"
            sizes='50px'
          />
        </Link>
      ) : (
        <div className="w-[50px] h-[50px] bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
          <span className="text-gray-400 text-sm">No Image</span>
        </div>
      )}

      {/* Product Details */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {product.vendor && (
          <p className="text-sm text-gray-600">{product.vendor}</p>
        )}
        <Link
          to={variantUrl}
          onClick={onClose}
          prefetch="intent"
          className="hover:underline"
        >
          <h3 className="font-semibold text-lg mb-4 mt-0 leading-[20px]">{product.title}</h3>
        </Link>
        {/* Price */}
        {product.priceRange?.minVariantPrice ? (
          <div className="text-lg font-bold mb-8">
            <Money
              data={{
                amount: product.priceRange.minVariantPrice.amount,
                currencyCode: product.priceRange.minVariantPrice.currencyCode,
              } as MoneyV2}
            />
          </div>
        ) : (
          <div className="text-sm text-gray-500 mb-8">Price not available</div>
        )}

        {/* Actions */}
        <div className="flex gap-8 mt-auto">
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
