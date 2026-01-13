import { useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import type { IButtonSize } from './themes/ButtonTheme';
import { usePlaypeak } from '~/lib/playpeakContext';
import { useBreakpoints } from '~/hooks/useBreakpoints';

function AddToCartButtonInner({
  analytics,
  children,
  disabled,
  onClick,
  onSuccess,
  size,
  fetcher,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  onSuccess?: () => void;
  size?: IButtonSize
  fetcher: FetcherWithComponents<any>;
}) {
  const previousStateRef = useRef<string>('idle');
  const hasCalledSuccessRef = useRef<boolean>(false);

  // Get navbar context - use a ref to ensure we have the latest value
  const navbarContext = usePlaypeak();
  const navbarRef = useRef(navbarContext);

  useEffect(() => {
    navbarRef.current = navbarContext;
  }, [navbarContext]);



  const breakpoints = useBreakpoints();
  const { isMobile, isDesktop } = breakpoints;

  // More reliable mobile check - check window width directly
  const isMobileDevice = typeof window !== 'undefined'
    ? window.innerWidth <= 768
    : isMobile;

  // Call onSuccess when fetcher completes successfully
  useEffect(() => {
    const wasNotIdle = previousStateRef.current !== 'idle';
    const isNowIdle = fetcher.state === 'idle';

    // Log all fetcher data for debugging
    if (wasNotIdle && isNowIdle) {
      console.log('AddToCartButton fetcher data:', fetcher.data);
      if (fetcher.data?.errors) {
        console.error('AddToCartButton error:', fetcher.data.errors);
      }
      if (fetcher.data?.warnings) {
        console.warn('AddToCartButton warnings:', fetcher.data.warnings);
      }
    }

    const hasData = fetcher.data && !fetcher.data.errors;

    // If we transitioned from a non-idle state to idle with successful data, call onSuccess
    if (wasNotIdle && isNowIdle && hasData && !hasCalledSuccessRef.current) {
      hasCalledSuccessRef.current = true;

      // Open cart drawer on mobile when item is successfully added
      // This works for all AddToCartButton instances (product page, wishlist, etc.)
      // Use isMobileDevice for more reliable detection
      // Use ref to get latest context value
      const currentNavbar = navbarRef.current;
      if (isMobileDevice && currentNavbar?.openCart) {
        currentNavbar.openCart();
      }

      if (onSuccess) {
        onSuccess();
      }
    }

    previousStateRef.current = fetcher.state;

    // Reset the success flag when starting a new submission
    if (fetcher.state === 'submitting' || fetcher.state === 'loading') {
      hasCalledSuccessRef.current = false;
    }
  }, [fetcher.state, fetcher.data, onSuccess, isMobileDevice]);

  // Handle onClick - on desktop, open cart aside if onClick is provided
  // On mobile, we wait for successful form submission before opening cart
  const handleClick = () => {
    // Only handle desktop onClick for cart aside
    // Don't open cart on mobile here - wait for successful submission
    if (isDesktop && onClick) {
      onClick();
    }
    // On mobile, the cart will open after successful submission (see useEffect above)
  };

  return (
    <>
      <input
        name="analytics"
        type="hidden"
        value={JSON.stringify(analytics)}
      />
      <Button
        size={size}
        type="submit"
        onClick={handleClick}
        disabled={disabled ?? fetcher.state !== 'idle'}
        className='w-full'
      >
        {children}
      </Button>
    </>
  );
}

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  onSuccess,
  size
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  size?: IButtonSize;
  onClick?: () => void;
  onSuccess?: () => void;
}) {
  // Debug: Log lines being sent to cart
  if (process.env.NODE_ENV === 'development') {
    console.log('AddToCartButton - lines:', lines);
  }

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <AddToCartButtonInner
          size={size}
          analytics={analytics}
          disabled={disabled}
          onClick={onClick}
          onSuccess={onSuccess}
          fetcher={fetcher}
        >
          {children}
        </AddToCartButtonInner>
      )}
    </CartForm>
  );
}
