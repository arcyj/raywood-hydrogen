import { Link } from 'react-router';
import { useDrawer } from './ui/Drawer';
import type { FC } from 'react';

export const WishlistMenu: FC = () => {
  const { onClose } = useDrawer();

  // Placeholder for wishlist functionality
  // This can be extended later with actual wishlist data
  const wishlistItems: any[] = [];

  return (
    <div className="wishlist-menu p-16">
      <h2 className="text-2xl font-bold mb-16">Wishlist</h2>
      {wishlistItems.length === 0 ? (
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
          {wishlistItems.map((item) => (
            <div key={item.id} className="border-b border-gray-200 pb-12">
              {/* Wishlist items will be rendered here */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
