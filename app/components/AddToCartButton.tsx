import { useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

function AddToCartButtonInner({
  analytics,
  children,
  disabled,
  onClick,
  onSuccess,
  fetcher,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  onSuccess?: () => void;
  fetcher: FetcherWithComponents<any>;
}) {
  const previousStateRef = useRef<string>('idle');
  const hasCalledSuccessRef = useRef<boolean>(false);

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
  }, [fetcher.state, fetcher.data, onSuccess]);

  return (
    <>
      <input
        name="analytics"
        type="hidden"
        value={JSON.stringify(analytics)}
      />
      <Button
        type="submit"
        onClick={onClick}
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
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  onSuccess?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <AddToCartButtonInner
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
