import { createContext, useContext, useRef, useState, useCallback, useMemo, useEffect, type ReactNode, type MutableRefObject } from 'react';
import {
  DEFAULT_LOCALE,
  type SelectedLocale,
  type AvailableCountry,
} from '~/helpers/currencies';
import { PREFERRED_CURRENCY_COOKIE, PREFERRED_COUNTRY_COOKIE, PREFERRED_LANGUAGE_COOKIE } from '~/lib/i18n';

export type SupportedLanguage = 'EN' | 'SV' | 'LV' | 'ET' | 'LT';
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['EN', 'SV', 'LV', 'ET', 'LT'];
const LANGUAGE_STORAGE_KEY = 'preferred_language';

const STORAGE_PREFIX = 'playpeak-';
const LOCALE_STORAGE_KEY = 'selected_locale';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function persistLocale(locale: SelectedLocale) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(locale));
}

function getStoredLocale(): SelectedLocale | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as SelectedLocale; } catch { return null; }
}

export type DrawerType = 'search' | 'menu' | 'profile' | 'wishlist' | 'cart' | 'filter' | null;

interface PlaypeakContextValue {
  // Unified locale – country + currency in one object
  locale: SelectedLocale;
  setLocale: (locale: SelectedLocale) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;

  // Settings (persisted in localStorage)
  getSetting: <T>(key: string) => T | null;
  setSetting: <T>(key: string, value: T) => void;
  collectionGrid: 4 | 6;
  setCollectionGrid: (cols: 4 | 6) => void;

  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;

  // Drawer management
  activeDrawer: DrawerType;
  openDrawer: (drawer: DrawerType) => void;
  closeDrawer: () => void;
  isDrawerOpen: (drawer: DrawerType) => boolean;

  // Ref to the search input — set by SearchDrawer so openSearchDrawer can
  // focus it synchronously inside the user-gesture call stack (required by iOS
  // to show the keyboard).
  searchInputRef: MutableRefObject<HTMLInputElement | null>;

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

  // Country selector
  availableCountries: AvailableCountry[];
  isCountrySelectorOpen: boolean;
  openCountrySelector: () => void;
  closeCountrySelector: () => void;
}

const PlaypeakContext = createContext<PlaypeakContextValue | null>(null);

// Add displayName for React DevTools
PlaypeakContext.displayName = 'PlaypeakContext';

interface PlaypeakProviderProps {
  children: ReactNode;
  initialLocale?: SelectedLocale;
  initialLanguage?: SupportedLanguage;
  initialDarkMode?: boolean;
  initialAvailableCountries?: AvailableCountry[];
}

export function PlaypeakProvider({
  children,
  initialLocale,
  initialLanguage,
  initialDarkMode = false,
  initialAvailableCountries,
}: PlaypeakProviderProps) {
  // --- Locale state (country + currency unified) ---
  const [locale, setLocaleState] = useState<SelectedLocale>(
    () => initialLocale ?? getStoredLocale() ?? DEFAULT_LOCALE,
  );
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const stored = getStoredLanguage();
    if (stored) return stored;
    if (initialLanguage && SUPPORTED_LANGUAGES.includes(initialLanguage)) return initialLanguage;
    return 'EN';
  });

  const setLocale = useCallback((newLocale: SelectedLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      persistLocale(newLocale);
      setCookie(PREFERRED_CURRENCY_COOKIE, newLocale.currency);
      setCookie(PREFERRED_COUNTRY_COOKIE, newLocale.countryCode ?? '');
    }
  }, []);

  // Sync from server when locale changes (driven by updated cookies on the server)
  useEffect(() => {
    if (initialLocale?.countryCode) {
      setLocaleState(initialLocale);
      persistLocale(initialLocale);
    }
  }, [initialLocale?.countryCode, initialLocale?.currency]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setCookie(PREFERRED_LANGUAGE_COOKIE, lang);
    }
  }, []);

  // --- Country selector ---
  const [availableCountries] = useState<AvailableCountry[]>(initialAvailableCountries ?? []);
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);

  const openCountrySelector = useCallback(() => setIsCountrySelectorOpen(true), []);
  const closeCountrySelector = useCallback(() => setIsCountrySelectorOpen(false), []);

  // Auto-open country selector when country couldn't be detected and user has no stored preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasStored = Boolean(localStorage.getItem(LOCALE_STORAGE_KEY));
    const dismissed = Boolean(sessionStorage.getItem('country-selector-dismissed'));
    if (!hasStored && !dismissed && !initialLocale?.countryCode) {
      setIsCountrySelectorOpen(true);
    }
  }, []);

  // --- Settings ---
  const getSetting = useCallback(<T,>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as T;
    }
  }, []);

  const setSetting = useCallback(<T,>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  }, []);

  const [collectionGrid, setCollectionGridState] = useState<4 | 6>(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem(STORAGE_PREFIX + 'collection-grid');
      if (v !== null) {
        const n = parseInt(v, 10);
        if (n === 4 || n === 6) return n;
      }
    }
    return 6;
  });

  const setCollectionGrid = useCallback((cols: 4 | 6) => {
    setCollectionGridState(cols);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PREFIX + 'collection-grid', String(cols));
    }
  }, []);

  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_PREFIX + 'dark-mode');
      return stored ? stored === 'true' : initialDarkMode;
    }
    return initialDarkMode;
  });

  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Sync dark mode with localStorage and document class
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PREFIX + 'dark-mode', darkMode.toString());
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
    // Focus synchronously here, inside the user-gesture call stack.
    // iOS Safari only shows the keyboard when focus() is called directly
    // from a user interaction — setTimeout/useEffect breaks that chain.
    searchInputRef.current?.focus();
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
      locale,
      setLocale,
      language,
      setLanguage,
      getSetting,
      setSetting,
      collectionGrid,
      setCollectionGrid,
      darkMode,
      toggleDarkMode,
      setDarkMode,
      activeDrawer,
      openDrawer,
      closeDrawer,
      isDrawerOpen,
      searchInputRef,
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
      availableCountries,
      isCountrySelectorOpen,
      openCountrySelector,
      closeCountrySelector,
    }),
    [
      locale,
      setLocale,
      language,
      setLanguage,
      getSetting,
      setSetting,
      collectionGrid,
      setCollectionGrid,
      darkMode,
      toggleDarkMode,
      setDarkMode,
      activeDrawer,
      openDrawer,
      closeDrawer,
      isDrawerOpen,
      searchInputRef,
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
      availableCountries,
      isCountrySelectorOpen,
      openCountrySelector,
      closeCountrySelector,
    ],
  );

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

function getStoredLanguage(): SupportedLanguage | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (!raw) return null;
  const upper = raw.toUpperCase() as SupportedLanguage;
  return SUPPORTED_LANGUAGES.includes(upper) ? upper : null;
}
