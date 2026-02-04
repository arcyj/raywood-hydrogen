import { useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import type { IButtonSize } from './themes/ButtonTheme';
import { usePlaypeak } from '~/lib/playpeakContext';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { Cart } from './icons';

function AddToCartButtonInner({
  analytics,
  children,
  disabled,
  onClick,
  onSuccess,
  size,
  fetcher,
  showIcon = true,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  onSuccess?: () => void;
  size?: IButtonSize
  showIcon?: boolean;
  fetcher: FetcherWithComponents<any>;
}) {
  const previousStateRef = useRef<string>('idle');
  const hasCalledSuccessRef = useRef<boolean>(false);

  const {openCart} = usePlaypeak();

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

  const handleClick = () => {
    openCart();
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
        IconBefore={showIcon ? Cart : undefined}
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
  size,
  showIcon = true,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  size?: IButtonSize;
  showIcon?:  boolean;
  onClick?: () => void;
  onSuccess?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <AddToCartButtonInner
          showIcon={showIcon}
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
