import {Suspense} from 'react';
import { Drawer } from './ui/Drawer';
import { NavMenuItem } from './ui/NavMenuItem';
import { DropDownMenu } from './ui/DropdownMenu';
import { ProfileMenu } from './ProfileMenu';
import { WishlistMenu } from './WishlistMenu';
import { CartMenu } from './CartMenu';
import { Cart, Menu } from './icons';
import { Heart } from 'lucide-react';
import {useWishlist} from '~/hooks/useWishlist';
import {usePlaypeak} from '~/lib/playpeakContext';
import {Await} from 'react-router';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import { IconButton } from './ui/IconButton';
import { MagnifyingGlassIcon, Cross1Icon } from "@radix-ui/react-icons";

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

  const {isDrawerOpen, closeDrawer, openSearchDrawer, closeSearchDrawer, } = usePlaypeak();

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

  const DrawerHeader = ({
    title,
    close,
  }: {
    title: string;
    close?: () => void;
  }) => {
    return (
      <div className="flex justify-between items-center">
        <span className="text-h1">{title}</span>
        <IconButton
          Icon={Cross1Icon}
          variant="secondary"
          size="medium"
          onClick={close ?? onClose}
        ></IconButton>
      </div>
    );
  };

  const renderDrawerHeader = () => {
    switch (activeMenu) {
      case 'menu':
        return <DrawerHeader title="Menu" close={closeDrawer} />;
      case 'profile':
        return <DrawerHeader title="Account" close={closeDrawer} />;
      case 'wishlist':
        return <DrawerHeader title="WishList" close={closeDrawer} />;
      case 'cart':
        return <DrawerHeader title="Cart" close={closeDrawer} />;
      default:
        return null;
    }
  };

  const handleSearchToggle = () => {
    if (isDrawerOpen('search')) {
      closeSearchDrawer();
    } else {
      openSearchDrawer();
    }
  };

    const {wishlistHandles} = useWishlist();
    const hasWishlistItems = wishlistHandles.length > 0;

  return (
    <div className="bottom-0 w-full">
      <Drawer
        onClose={onClose}
        visible={activeMenu !== null}
        position="bottom"
        className="bg-white"
        panelClassName="bg-white px-12 pt-16 rounded-t-xl pb-80"
        header={renderDrawerHeader()}
      >
        {renderMenuContent()}
      </Drawer>
      <nav className="fixed inset-x-0 bottom-0 w-full rounded-t-md z-[9999] bg-transparent pb-0">
        <div className="grid grid-cols-4 p-4 gap-4 bg-lightGrey shadow-large">
          <NavMenuItem
            onClick={() => onMenuToggle('menu')}
            Icon={() => <Menu />}
            label={'Menu'}
            active={activeMenu === 'menu'}
          />
          <NavMenuItem
            onClick={handleSearchToggle}
            Icon={() => <MagnifyingGlassIcon className="w-[20px] h-[20px]" />}
            label={'Search'}
          />
          <NavMenuItem
            onClick={() => onMenuToggle('wishlist')}
            Icon={() => <Heart size={20} className={hasWishlistItems ? 'text-primary fill-primary' : ''} />}
            active={activeMenu === 'wishlist'}
            label={'Wishlist'}
          />
          <Suspense
            fallback={
              <NavMenuItem
                onClick={() => onMenuToggle('cart')}
                Icon={() => <Cart />}
                active={activeMenu === 'cart'}
                label={'Cart'}
              />
            }
          >
            <Await resolve={cart}>
              {(resolvedCart) => (
                <NavMenuItem
                  onClick={() => onMenuToggle('cart')}
                  Icon={() => <Cart />}
                  active={activeMenu === 'cart'}
                  label={'Cart'}
                  badge={
                    resolvedCart?.totalQuantity
                      ? resolvedCart?.totalQuantity
                      : undefined
                  }
                />
              )}
            </Await>
          </Suspense>
        </div>
      </nav>
    </div>
  );
}
