import {useState, useEffect, useCallback, type RefCallback} from 'react';

export function useIsNotVisible(): [boolean, RefCallback<Element>] {
  const [element, setElement] = useState<Element | null>(null);
  const [isIntersecting, setIntersecting] = useState(true);

  const callbackRef = useCallback((el: Element | null) => {
    setElement(el);
  }, []);

  useEffect(() => {
    if (!element) {
      setIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting),
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return [isIntersecting, callbackRef];
}
