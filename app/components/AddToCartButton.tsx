import { useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { useFetcher, useRevalidator, type FetcherWithComponents } from 'react-router';
import { CartForm, type OptimisticCartLineInput } from '@shopify/hydrogen';
import type { IButtonSize, IButtonVariant } from './themes/ButtonTheme';
import { usePlaypeak } from '~/lib/playpeakContext';
import { useCartRoute } from '~/lib/cartRoute';
import { Cart } from './icons';
import { useAnalytics } from '@shopify/hydrogen';
import { usePostHog } from '@posthog/react'

function getCartLines(cart: unknown): Array<{ id?: string; quantity?: number; merchandise?: { id?: string } }> {
  if (!cart || typeof cart !== 'object') return [];
  const c = cart as { lines?: { nodes?: unknown[]; edges?: Array<{ node?: unknown }> } };
  const conn = c.lines;
  if (!conn) return [];
  const nodes = conn.nodes ?? (conn.edges ?? []).map((e: { node?: unknown }) => e.node);
  return (nodes ?? []).filter(Boolean) as Array<{ id?: string; quantity?: number; merchandise?: { id?: string } }>;
}

function AddToCartButtonInner({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  onSuccess,
  size,
  fetcher,
  showIcon = true,
  variant = 'primary',
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  onSuccess?: () => void;
  size?: IButtonSize
  showIcon?: boolean;
  variant?: IButtonVariant;
  fetcher: FetcherWithComponents<any>;
}) {
  const posthog = usePostHog()
  const previousStateRef = useRef<string>('idle');
  const hasCalledSuccessRef = useRef<boolean>(false);
  const { revalidate } = useRevalidator();
  const { publish, shop, cart: prevCart } = useAnalytics();
  const publishEvent = publish as (event: string, payload: Record<string, unknown>) => void;

  // Call onSuccess, publish product_added_to_cart, and revalidate when fetcher completes successfully
  useEffect(() => {
    const wasNotIdle = previousStateRef.current !== 'idle';
    const isNowIdle = fetcher.state === 'idle';

    const hasData = fetcher.data && !fetcher.data.errors;

    // If we transitioned from a non-idle state to idle with successful data, call onSuccess, publish analytics, and revalidate root
    if (wasNotIdle && isNowIdle && hasData && !hasCalledSuccessRef.current) {
      hasCalledSuccessRef.current = true;

      if (onSuccess) {
        onSuccess();
      }

      // Publish product_added_to_cart for each newly added line so Shopify analytics and GTM receive the event
      const resultCart = fetcher.data?.cart as unknown;
      if (resultCart && typeof window !== 'undefined') {
        const resultLines = getCartLines(resultCart);
        const prevLines = getCartLines(prevCart ?? null);
        lines.forEach((lineInput) => {
          const merchandiseId = typeof lineInput.merchandiseId === 'string'
            ? lineInput.merchandiseId
            : (lineInput.merchandiseId as { id?: string })?.id;
          const currentLine = resultLines.find((l) => l.merchandise?.id === merchandiseId);
          const prevLine = prevLines.find((l) => l.merchandise?.id === merchandiseId);
          const prevQty = prevLine?.quantity ?? 0;
          const currentQty = currentLine?.quantity ?? 0;
          if (currentLine && currentQty > prevQty) {
            publishEvent('product_added_to_cart', {
              cart: resultCart,
              prevCart: prevCart ?? null,
              currentLine,
              prevLine: prevLine ?? null,
              shop,
              url: window.location.href || '',
            });
          }
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
    lines,
    onSuccess,
    prevCart,
    publishEvent,
    revalidate,
    shop,
  ]);

  const handleClick = () => {
    posthog.capture('add_to_cart', { button_name: 'add_to_cart' })
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
        disabled={disabled}
        lines={lines}
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
