import { useState, useEffect, useCallback } from 'react';

// Store only handles in localStorage
const WISHLIST_STORAGE_KEY = 'playpeak-wishlist';

export function useWishlist() {
  const [wishlistHandles, setWishlistHandles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const handles = JSON.parse(stored) as string[];
        setWishlistHandles(handles);
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistHandles));
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error);
      }
    }
  }, [wishlistHandles, isLoading]);

  const addToWishlist = useCallback((handle: string) => {
    setWishlistHandles((prev) => {
      // Check if handle already exists
      if (prev.includes(handle)) {
        return prev;
      }
      return [...prev, handle];
    });
  }, []);

  const removeFromWishlist = useCallback((handle: string) => {
    setWishlistHandles((prev) => prev.filter((h) => h !== handle));
  }, []);

  const isInWishlist = useCallback(
    (handle: string) => {
      return wishlistHandles.includes(handle);
    },
    [wishlistHandles]
  );

  const clearWishlist = useCallback(() => {
    setWishlistHandles([]);
  }, []);

  return {
    wishlistHandles,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };
}
