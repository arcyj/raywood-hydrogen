/**
 * Returns a function that returns the path as-is (no locale prefix).
 * Currency is in context, not URL.
 */
export function useLocalizedPath(): (path: string) => string {
  return (path: string) => path;
}
