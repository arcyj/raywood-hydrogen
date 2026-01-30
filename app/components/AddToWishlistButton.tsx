import { useWishlist } from '~/hooks/useWishlist';
import { Button } from './ui/Button';
import { Heart } from './icons/Heart';
import { IconButton } from './ui/IconButton';

// Support both product and variant structures
type ProductInput =
  | {
      // Product structure
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
  | {
      // Variant structure (when passing selectedVariant)
      id: string;
      product: {
        title: string;
        handle: string;
      };
      price?: {
        amount: string;
        currencyCode: string;
      } | null;
      image?: {
        url: string;
        altText?: string | null;
      } | null;
    };

interface AddToWishlistButtonProps {
  product: ProductInput;
  // Optional product-level data when passing variant
  productData?: {
    id: string;
    vendor?: string | null;
    featuredImage?: {
      url: string;
      altText?: string | null;
    } | null;
  };
  variant?: 'button' | 'icon';
  className?: string;
}

export function AddToWishlistButton({
  product,
  productData,
  variant = 'button',
  className = '',
}: AddToWishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Determine if this is a variant structure (has nested product)
  const isVariant = 'product' in product && product.product !== undefined;

  // Get product handle - for variants, use product.handle, otherwise use product.handle directly
  const productHandle = isVariant
    ? (product as Extract<ProductInput, { product: { handle: string } }>).product.handle
    : (product as Extract<ProductInput, { handle: string }>).handle;

  const inWishlist = isInWishlist(productHandle);

  const handleClick = () => {
    if (inWishlist) {
      removeFromWishlist(productHandle);
    } else {
      addToWishlist(productHandle);
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleClick();
  };

  if (variant === 'icon') {
    return (
      <IconButton
        Icon={Heart}
        variant='secondary'
        size='large'
        active={inWishlist}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClick();
        }}
        className={`wishlist-icon-button ${className}`}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
      </IconButton>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleButtonClick}
      className={`wishlist-button ${className}`}
    >
      <Heart
        size={16}
        className={`mr-8 ${inWishlist ? 'fill-current' : ''}`}
        style={{ color: inWishlist ? '#ef4444' : 'currentColor' }}
      />
      {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    </Button>
  );
}
