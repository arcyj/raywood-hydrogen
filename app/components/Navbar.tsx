import {useState, createContext, useContext} from 'react';
import { Drawer } from './ui/Drawer';
import { NavMenuItem } from './ui/NavMenuItem';
import { DropDownMenu } from './ui/DropdownMenu';
import { ProfileMenu } from './ProfileMenu';
import { WishlistMenu } from './WishlistMenu';
import { CartMenu } from './CartMenu';
import { Cart, Heart, Profile, Menu } from './icons';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';

type MenuType = 'menu' | 'profile' | 'wishlist' | 'cart' | null;

interface NavbarContextValue {
  openCart: () => void;
}

export const NavbarContext = createContext<NavbarContextValue | null>(null);

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  return context;
};

interface NavbarProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

export function Navbar({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: NavbarProps) {
  const {menu} = header;
  const [activeMenu, setActiveMenu] = useState<MenuType>(null);

  const handleMenuToggle = (menuType: MenuType) => {
    setActiveMenu(activeMenu === menuType ? null : menuType);
  };

  const handleClose = () => {
    setActiveMenu(null);
  };

  const openCart = () => {
    setActiveMenu('cart');
  };

  const renderMenuContent = () => {
    switch (activeMenu) {
      case 'menu':
        return (
          <DropDownMenu
            menu={menu}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
            primaryDomainUrl={publicStoreDomain}
          />
        );
      case 'profile':
        return <ProfileMenu isLoggedIn={isLoggedIn} />;
      case 'wishlist':
        return <WishlistMenu />;
      case 'cart':
        return <CartMenu cart={cart} />;
      default:
        return null;
    }
  };

  return (
    <NavbarContext.Provider value={{openCart}}>
      <Drawer
        onClose={handleClose}
        visible={activeMenu !== null}
        position="bottom"
        className="bg-white min-h-[600px] px-12 pt-16 rounded-t-xl"
      >
        {renderMenuContent()}
      </Drawer>
      <nav className="fixed full bottom-0 w-full p-8 rounded-t-md z-10">
        <div className="flex justify-center gap-12 m-4 bg-white shadow-lg rounded-full">
          <NavMenuItem
            onClick={() => handleMenuToggle('menu')}
            Icon={() => <Menu />}
            label={'Menu'}
            active={activeMenu === 'menu'}
          />
          <NavMenuItem
            onClick={() => handleMenuToggle('profile')}
            Icon={() => <Profile />}
            label={'Account'}
          />
          <NavMenuItem
            onClick={() => handleMenuToggle('wishlist')}
            Icon={() => <Heart />}
            label={'Wishlist'}
          />
          <NavMenuItem
            onClick={() => handleMenuToggle('cart')}
            Icon={() => <Cart />}
            label={'Cart'}
          />
        </div>
      </nav>
    </NavbarContext.Provider>
  );
}
