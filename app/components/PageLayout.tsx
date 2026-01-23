import {useEffect} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import { Navbar } from './Navbar';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { SearchDrawer } from './SearchDrawer';
import { TopBar } from './TopBar';
import { PlaypeakProvider, usePlaypeak } from '~/lib/playpeakContext';
import { FilterDrawer } from './FilterDrawer';
import { WishlistDrawer } from './WishlistDrawer';
import { CartDrawer } from './CartDrawer';


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
    <PlaypeakProvider>
      <PageLayoutContent
        cart={cart}
        footer={footer}
        header={header}
        isLoggedIn={isLoggedIn}
        publicStoreDomain={publicStoreDomain}
      >
        {children}
      </PageLayoutContent>
    </PlaypeakProvider>
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

  // Convert DrawerType to MenuType (excluding 'search')
  const activeMenu: 'menu' | 'profile' | 'wishlist' | 'cart' | null =
    activeDrawer === 'search' ? null :
    (activeDrawer === 'menu' || activeDrawer === 'profile' || activeDrawer === 'wishlist' || activeDrawer === 'cart' ? activeDrawer : null);

  const handleMenuToggle = (menuType: 'menu' | 'profile' | 'wishlist' | 'cart' | null) => {
    if (activeDrawer === menuType) {
      closeDrawer();
    } else {
      openDrawer(menuType);
    }
  };

  const handleClose = () => {
    closeDrawer();
  };

  return (
    <Aside.Provider>
      <FilterDrawer />
      {isDesktop && (
        <>
          <CartDrawer cart={cart} />
          <SearchDrawer />
          <WishlistDrawer />
        </>
      )}
      {!isDesktop && (
        <>
          <TopBar />
          <SearchDrawer />
        </>
      )}
      {header && isDesktop && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <main>{children}</main>
      {header && !isDesktop && (
        <Navbar
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
          activeMenu={activeMenu}
          onMenuToggle={handleMenuToggle}
          onClose={handleClose}
        />
      )}
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

// function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
//   return (
//     <Aside type="cart" heading="CART">
//       <Suspense fallback={<p>Loading cart ...</p>}>
//         <Await resolve={cart}>
//           {(cart) => {
//             return <CartMain cart={cart} layout="aside" />;
//           }}
//         </Await>
//       </Suspense>
//     </Aside>
//   );
// }

// function NavBarAside() {
//   return (
//     <Aside type="navbar" heading="MENU">
//       <Drawer onClose={() => setShowMenu(false)} visible={showMenu} position="bottom" className='bg-slate-100/89 backdrop-blur-xl min-h-[600px]'>
//         <DropDownMenu menu={menu} isLoggedIn={isLoggedIn} publicStoreDomain={publicStoreDomain} primaryDomainUrl={publicStoreDomain} />
//       </Drawer>
//     </Aside>
//   );
// }
