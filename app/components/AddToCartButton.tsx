import { useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import type { IButtonSize } from './themes/ButtonTheme';
import { useNavbar } from './Navbar';
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
  const navbarContext = useNavbar();
  const navbarRef = useRef(navbarContext);
  
  useEffect(() => {
    navbarRef.current = navbarContext;
  }, [navbarContext]);
  
  // Debug: Log context availability
  useEffect(() => {
    console.log('AddToCartButton mounted/updated', { 
      navbar: navbarContext, 
      hasOpenCart: !!navbarContext?.openCart,
      isMobileDevice: typeof window !== 'undefined' ? window.innerWidth <= 768 : false 
    });
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

  // Handle onClick - on mobile, also open cart immediately
  const handleClick = () => {
    // Open cart drawer on mobile immediately when button is clicked
    // Use isMobileDevice for more reliable detection
    // Use ref to get latest context value
    const currentNavbar = navbarRef.current;
    console.log('handleClick called', { 
      isMobileDevice, 
      isDesktop, 
      navbar: currentNavbar, 
      hasOpenCart: !!currentNavbar?.openCart,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'N/A' 
    });
    
    if (isMobileDevice) {
      if (currentNavbar?.openCart) {
        console.log('Calling navbar.openCart()');
        currentNavbar.openCart();
      } else {
        console.warn('Navbar context not available on mobile, trying window fallback', { 
          navbar: currentNavbar, 
          isMobileDevice, 
          isDesktop,
          navbarContextValue: currentNavbar 
        });
        // Fallback: try to call openCart from window if context is not available
        if (typeof window !== 'undefined' && (window as any).__openCart) {
          console.log('Using window fallback to open cart');
          (window as any).__openCart();
        }
      }
    } else if (isDesktop && onClick) {
      // Only call desktop onClick on desktop (for cart aside)
      onClick();
    }
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
