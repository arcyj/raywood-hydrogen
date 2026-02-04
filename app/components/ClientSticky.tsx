import {useEffect, useState, type ReactNode} from 'react';

type StickyProps = {
  children: ReactNode;
  enabled?: boolean;
  top?: number;
  bottomBoundary?: number | string;
  className?: string;
  [key: string]: unknown;
};

/**
 * Wraps react-stickynode so it only loads on the client. Avoids SSR errors
 * from subscribe-ui-event/eventemitter3 (e.g. "default is not a constructor").
 * Renders children in a non-sticky container during SSR and initial client render,
 * then switches to Sticky once the component is mounted and the library is loaded.
 */
export function ClientSticky({children, ...props}: StickyProps) {
  const [StickyComponent, setStickyComponent] = useState<React.ComponentType<StickyProps> | null>(null);

  useEffect(() => {
    import('react-stickynode').then((mod) => {
      setStickyComponent(() => mod.default);
    });
  }, []);

  if (StickyComponent) {
    return (
      <StickyComponent {...props}>
        {children}
      </StickyComponent>
    );
  }

  return <>{children}</>;
}
