import {useEffect} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { SearchDrawer } from './SearchDrawer';
import { MenuDrawer } from './MenuDrawer';
import { TopBar } from './TopBar';
import { usePlaypeak } from '~/lib/playpeakContext';
import { FilterDrawer } from './FilterDrawer';
import { WishlistDrawer } from './WishlistDrawer';
import { CartDrawer } from './CartDrawer';
import { DesktopTopBar } from './sections/DesktopTopBar';
import { TopBarActions } from './TopBarActions';
import { CountrySelectorDialog } from './ui/CountrySelectorDialog';


interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <PageLayoutContent
      cart={cart}
      footer={footer}
      header={header}
      isLoggedIn={isLoggedIn}
      publicStoreDomain={publicStoreDomain}
    >
      {children}
    </PageLayoutContent>
  );
}

function PageLayoutContent({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  const isDesktop = useBreakpoints().isDesktop;
  const { activeDrawer, openCart, openDrawer, closeDrawer } = usePlaypeak();

  // Expose openCart on window for debugging and as a fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__openCart = openCart;
    }
  }, [openCart]);


  return (
    <Aside.Provider>
      <FilterDrawer />

        <MenuDrawer
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
          header={header}
        />
        <CartDrawer cart={cart} />
        <SearchDrawer />
        <WishlistDrawer />
        <CountrySelectorDialog />

      {/* <TopBar /> */}
      {/* <DesktopTopBar isLoggedIn={isLoggedIn} /> */}
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      {/* <TopBarActions /> */}
      <main>{children}</main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}
