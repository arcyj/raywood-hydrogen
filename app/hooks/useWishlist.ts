import { useState, useEffect, useCallback } from 'react';

// Store only handles in localStorage
const WISHLIST_STORAGE_KEY = 'playpeak-wishlist';
const WISHLIST_UPDATED_EVENT = 'playpeak-wishlist-updated';

function readWishlistFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch (error) {
    console.error('Error loading wishlist from localStorage:', error);
    return [];
  }
}

function persistWishlist(handles: string[]) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(handles));
  } catch (error) {
    console.error('Error saving wishlist to localStorage:', error);
  }
}

export function useWishlist() {
  const [wishlistHandles, setWishlistHandles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    setWishlistHandles(readWishlistFromStorage());
    setIsLoading(false);
  }, []);

  // Keep all hook instances in sync within the same tab and across tabs.
  useEffect(() => {
    const syncFromStorage = () => {
      setWishlistHandles(readWishlistFromStorage());
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === WISHLIST_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(WISHLIST_UPDATED_EVENT, syncFromStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(WISHLIST_UPDATED_EVENT, syncFromStorage);
    };
  }, []);

  const addToWishlist = useCallback((handle: string) => {
    setWishlistHandles((prev) => {
      // Check if handle already exists
      if (prev.includes(handle)) {
        return prev;
      }

      const next = [...prev, handle];
      persistWishlist(next);
      window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
      return next;
    });
  }, []);

  const removeFromWishlist = useCallback((handle: string) => {
    setWishlistHandles((prev) => {
      const next = prev.filter((h) => h !== handle);
      persistWishlist(next);
      window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
      return next;
    });
  }, []);

  const isInWishlist = useCallback(
    (handle: string) => {
      return wishlistHandles.includes(handle);
    },
    [wishlistHandles]
  );

  const clearWishlist = useCallback(() => {
    setWishlistHandles(() => {
      persistWishlist([]);
      window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
      return [];
    });
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
