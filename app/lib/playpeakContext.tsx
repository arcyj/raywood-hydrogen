import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';

export type DrawerType = 'search' | 'menu' | 'profile' | 'wishlist' | 'cart' | 'filter' | null;

interface PlaypeakContextValue {
  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;

  // Drawer management
  activeDrawer: DrawerType;
  openDrawer: (drawer: DrawerType) => void;
  closeDrawer: () => void;
  isDrawerOpen: (drawer: DrawerType) => boolean;

  // Convenience methods for specific drawers
  openSearchDrawer: () => void;
  closeSearchDrawer: () => void;
  openCart: () => void;
  closeCart: () => void;
  openMenu: () => void;
  openProfile: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  openFilter: () => void;
  closeFilter: () => void;
}

const PlaypeakContext = createContext<PlaypeakContextValue | null>(null);

// Add displayName for React DevTools
PlaypeakContext.displayName = 'PlaypeakContext';

interface PlaypeakProviderProps {
  children: ReactNode;
  initialDarkMode?: boolean;
}

export function PlaypeakProvider({ children, initialDarkMode = false }: PlaypeakProviderProps) {
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    // Check localStorage on initial load
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('playpeak-dark-mode');
      return stored ? stored === 'true' : initialDarkMode;
    }
    return initialDarkMode;
  });

  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);

  // Sync dark mode with localStorage and document class
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('playpeak-dark-mode', darkMode.toString());
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkModeState((prev) => !prev);
  }, []);

  const setDarkMode = useCallback((enabled: boolean) => {
    setDarkModeState(enabled);
  }, []);

  const openDrawer = useCallback((drawer: DrawerType) => {
    setActiveDrawer(drawer);
  }, []);

  const closeDrawer = useCallback(() => {
    setActiveDrawer(null);
  }, []);

  const isDrawerOpen = useCallback(
    (drawer: DrawerType) => {
      return activeDrawer === drawer;
    },
    [activeDrawer],
  );

  // Convenience methods
  const openSearchDrawer = useCallback(() => {
    openDrawer('search');
  }, [openDrawer]);

  const closeSearchDrawer = useCallback(() => {
    if (activeDrawer === 'search') {
      closeDrawer();
    }
  }, [activeDrawer, closeDrawer]);

  const openCart = useCallback(() => {
    openDrawer('cart');
  }, [openDrawer]);

  const closeCart = useCallback(() => {
    if (activeDrawer === 'cart') {
      closeDrawer();
    }
  }, [activeDrawer, closeDrawer]);

  const openFilter = useCallback(() => {
    openDrawer('filter');
  }, [openDrawer]);

  const closeFilter = useCallback(() => {
    if (activeDrawer === 'filter') {
      closeDrawer();
    }
  }, [activeDrawer, closeDrawer]);

  const closeWishlist = useCallback(() => {
    if (activeDrawer === 'wishlist') {
      closeDrawer();
    }
  }, [activeDrawer, closeDrawer]);

  const openMenu = useCallback(() => {
    openDrawer('menu');
  }, [openDrawer]);

  const openProfile = useCallback(() => {
    openDrawer('profile');
  }, [openDrawer]);

  const openWishlist = useCallback(() => {
    openDrawer('wishlist');
  }, [openDrawer]);

  const value = useMemo(
    () => ({
      darkMode,
      toggleDarkMode,
      setDarkMode,
      activeDrawer,
      openDrawer,
      closeDrawer,
      isDrawerOpen,
      openSearchDrawer,
      closeSearchDrawer,
      openCart,
      closeCart,
      openMenu,
      openProfile,
      openWishlist,
      closeWishlist,
      openFilter,
      closeFilter,
    }),
    [
      darkMode,
      toggleDarkMode,
      setDarkMode,
      activeDrawer,
      openDrawer,
      closeDrawer,
      isDrawerOpen,
      openSearchDrawer,
      closeSearchDrawer,
      openCart,
      closeCart,
      openMenu,
      openProfile,
      openWishlist,
      closeWishlist,
      openFilter,
      closeFilter,
    ],
  );

  // Debug: Log context value in development
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[PlaypeakContext] Provider mounted with value:', {
        darkMode,
        activeDrawer,
      });
    }
  }, [darkMode, activeDrawer]);

  return <PlaypeakContext.Provider value={value}>{children}</PlaypeakContext.Provider>;
}

// Add displayName for React DevTools
PlaypeakProvider.displayName = 'PlaypeakProvider';

export function usePlaypeak() {
  const context = useContext(PlaypeakContext);
  if (!context) {
    throw new Error('usePlaypeak must be used within a PlaypeakProvider');
  }
  return context;
}
