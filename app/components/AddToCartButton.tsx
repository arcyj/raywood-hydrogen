import { useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { useFetcher, useRevalidator, type FetcherWithComponents } from 'react-router';
import { CartForm, type OptimisticCartLineInput } from '@shopify/hydrogen';
import type { IButtonSize } from './themes/ButtonTheme';
import { usePlaypeak } from '~/lib/playpeakContext';
import { useCartRoute } from '~/lib/cartRoute';
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
  const { revalidate } = useRevalidator();

  const {openCart} = usePlaypeak();

  const breakpoints = useBreakpoints();
  const { isMobile, isDesktop } = breakpoints;

  // More reliable mobile check - check window width directly
  const isMobileDevice = typeof window !== 'undefined'
    ? window.innerWidth <= 768
    : isMobile;

  // Call onSuccess and revalidate when fetcher completes successfully so cart drawer updates
  useEffect(() => {
    const wasNotIdle = previousStateRef.current !== 'idle';
    const isNowIdle = fetcher.state === 'idle';

    const hasData = fetcher.data && !fetcher.data.errors;

    // If we transitioned from a non-idle state to idle with successful data, call onSuccess and revalidate root
    if (wasNotIdle && isNowIdle && hasData && !hasCalledSuccessRef.current) {
      hasCalledSuccessRef.current = true;

      if (onSuccess) {
        onSuccess();
      }
      if (isMobileDevice) {
        openCart();
      }
      // Force root loader to re-run so deferred cart promise updates and drawer shows new item
      revalidate();
    }

    previousStateRef.current = fetcher.state;

    // Reset the success flag when starting a new submission
    if (fetcher.state === 'submitting' || fetcher.state === 'loading') {
      hasCalledSuccessRef.current = false;
    }
  }, [fetcher.state, fetcher.data, onSuccess, isMobileDevice, revalidate]);

  const handleClick = () => {
    if (isDesktop) {
      openCart();
      if (onClick) {
        onClick();
      }
    }
    // On mobile, the cart opens after successful submission (see useEffect above)
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
  const cartRoute = useCartRoute();
  const fetcher = useFetcher<{ cart?: unknown; errors?: unknown[] }>();

  // Submit programmatically so the request always uses the correct action URL and payload
  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled || fetcher.state !== 'idle') return;
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    fetcher.submit(formData, { method: 'post', action: cartRoute });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input
        type="hidden"
        name={CartForm.INPUT_NAME}
        value={JSON.stringify({
          action: CartForm.ACTIONS.LinesAdd,
          inputs: { lines },
        })}
      />
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
    </form>
  );
}
