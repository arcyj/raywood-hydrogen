import { Drawer } from './ui/Drawer';
import { NavMenuItem } from './ui/NavMenuItem';
import { DropDownMenu } from './ui/DropdownMenu';
import { ProfileMenu } from './ProfileMenu';
import { WishlistMenu } from './WishlistMenu';
import { CartMenu } from './CartMenu';
import { Cart, Heart, Profile, Menu } from './icons';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';

type MenuType = 'menu' | 'profile' | 'wishlist' | 'cart' | null;

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
    <div className="bottom-0 w-full">
      <Drawer
        onClose={onClose}
        visible={activeMenu !== null}
        position="bottom"
        className='bg-white'
        panelClassName="bg-white px-12 pt-16 rounded-t-xl"
      >
        {renderMenuContent()}
      </Drawer>
      <nav className="fixed inset-x-0 bottom-0 w-full rounded-t-md z-[9999] bg-transparent pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 p-4 gap-4 bg-lightGrey shadow-large">
          <NavMenuItem
            onClick={() => onMenuToggle('menu')}
            Icon={() => <Menu />}
            label={'Menu'}
            active={activeMenu === 'menu'}
          />
          <NavMenuItem
            onClick={() => onMenuToggle('profile')}
            Icon={() => <Profile />}
            active={activeMenu === 'profile'}
            label={'Account'}
          />
          <NavMenuItem
            onClick={() => onMenuToggle('wishlist')}
            Icon={() => <Heart />}
            active={activeMenu === 'wishlist'}
            label={'Wishlist'}
          />
          <NavMenuItem
            onClick={() => onMenuToggle('cart')}
            Icon={() => <Cart />}
            active={activeMenu === 'cart'}
            label={'Cart'}
          />
        </div>
      </nav>
    </div>
  );
}
