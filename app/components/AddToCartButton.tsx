import { useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { useFetcher, useRevalidator, type FetcherWithComponents } from 'react-router';
import { CartForm, useAnalytics, type OptimisticCartLineInput } from '@shopify/hydrogen';
import type { IButtonSize, IButtonVariant } from './themes/ButtonTheme';
import { usePlaypeak } from '~/lib/playpeakContext';
import { useCartRoute } from '~/lib/cartRoute';
import { Cart } from './icons';

type CartLineLike = {
  id?: string;
  quantity?: number;
  merchandise?: {
    id?: string;
  };
};

function getCartLines(cartLike: unknown): CartLineLike[] {
  if (!cartLike || typeof cartLike !== 'object') return [];
  const cart = cartLike as {
    lines?: { nodes?: CartLineLike[] } | CartLineLike[];
  };
  if (Array.isArray(cart.lines)) return cart.lines;
  return cart.lines?.nodes ?? [];
}

function AddToCartButtonInner({
  analytics,
  lines,
  children,
  disabled,
  onClick,
  onSuccess,
  size,
  fetcher,
  showIcon = true,
  variant = 'primary',
}: {
  analytics?: unknown;
  lines: Array<OptimisticCartLineInput>;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  onSuccess?: () => void;
  size?: IButtonSize
  showIcon?: boolean;
  variant?: IButtonVariant;
  fetcher: FetcherWithComponents<any>;
}) {
  const previousStateRef = useRef<string>('idle');
  const hasCalledSuccessRef = useRef<boolean>(false);
  const { revalidate } = useRevalidator();
  const { publish, shop, cart, prevCart } = useAnalytics();
  const publishEvent = publish as unknown as (event: string, payload: Record<string, unknown>) => void;



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
      if (typeof window !== 'undefined') {
        const resultCart = fetcher.data?.cart ?? cart;
        const resultLines = getCartLines(resultCart);
        const prevLines = getCartLines(prevCart);

        lines.forEach((lineInput) => {
          const currentLine = resultLines.find(
            (line) => line?.merchandise?.id === lineInput.merchandiseId,
          );
          const prevLine = prevLines.find(
            (line) => line?.merchandise?.id === lineInput.merchandiseId,
          );

          publishEvent('product_added_to_cart', {
            cart: resultCart,
            prevCart,
            currentLine,
            prevLine,
            shop,
            url: window.location.href || '',
          });
        });

        publishEvent('cart_updated', {
          cart: resultCart,
          prevCart,
          shop,
        });
      }
      // Force root loader to re-run so deferred cart promise updates and drawer shows new item
      revalidate();
    }

    previousStateRef.current = fetcher.state;

    // Reset the success flag when starting a new submission
    if (fetcher.state === 'submitting' || fetcher.state === 'loading') {
      hasCalledSuccessRef.current = false;
    }
  }, [
    fetcher.state,
    fetcher.data,
    onSuccess,
    revalidate,
    publish,
    shop,
    cart,
    prevCart,
    lines,
  ]);

  const handleClick = () => {
    if (onClick) {
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
        variant={variant}
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
  variant = 'primary',
  showIcon = true,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  size?: IButtonSize;
  variant?: IButtonVariant;
  showIcon?:  boolean;
  onClick?: () => void;
  onSuccess?: () => void;
}) {
  const cartRoute = useCartRoute();
  const fetcher = useFetcher<{ cart?: unknown; errors?: unknown[] }>();
  const { openCart } = usePlaypeak();
  // Submit programmatically so the request always uses the correct action URL and payload
  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled || fetcher.state !== 'idle') return;
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    fetcher.submit(formData, { method: 'post', action: cartRoute });
    openCart();
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
        lines={lines}
        disabled={disabled}
        onClick={onClick}
        onSuccess={onSuccess}
        fetcher={fetcher}
        variant={variant}
      >
        {children}
      </AddToCartButtonInner>
    </form>
  );
}
