import {createContext, useContext} from 'react';
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
  activeMenu: MenuType;
  onMenuToggle: (menuType: MenuType) => void;
  onClose: () => void;
}

export function Navbar({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
  activeMenu,
  onMenuToggle,
  onClose,
}: NavbarProps) {
  const {menu} = header;

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
    <>
      <Drawer
        onClose={onClose}
        visible={activeMenu !== null}
        position="bottom"
        className="bg-white min-h-[600px] px-12 pt-16 rounded-t-xl"
      >
        {renderMenuContent()}
      </Drawer>
      <nav className="fixed full bottom-0 w-full p-4 rounded-t-md z-10 bg-transparent">
        <div className="grid grid-cols-4 gap-4 m-4 bg-white shadow-lg rounded-full">
          <NavMenuItem
            onClick={() => onMenuToggle('menu')}
            Icon={() => <Menu />}
            label={'Menu'}
            active={activeMenu === 'menu'}
          />
          <NavMenuItem
            onClick={() => onMenuToggle('profile')}
            Icon={() => <Profile />}
            label={'Account'}
          />
          <NavMenuItem
            onClick={() => onMenuToggle('wishlist')}
            Icon={() => <Heart />}
            label={'Wishlist'}
          />
          <NavMenuItem
            onClick={() => onMenuToggle('cart')}
            Icon={() => <Cart />}
            label={'Cart'}
          />
        </div>
      </nav>
    </>
  );
}
