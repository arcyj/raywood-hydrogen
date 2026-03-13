import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';

import {usePlaypeak} from '~/lib/playpeakContext';

import {useAside} from '~/components/Aside';
import {NavMenuItem} from './ui/NavMenuItem';
import {Cart, Menu} from './icons';
import { Heart } from 'lucide-react';
import {
  MagnifyingGlassIcon,
  ArrowRightIcon
} from '@radix-ui/react-icons';
import { ChevronDown } from 'lucide-react';
import {Dropdown} from './ui/Dropdown';
import {processUrl} from '~/helpers/processUrl';
import {getMenuIconUrl} from '~/helpers/getMenuIconUrl';
import {ButtonLink} from './ui/Link';
import {useLocalizedPath} from '~/hooks/useLocalePath';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import {useWishlist} from '~/hooks/useWishlist';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const withLocale = useLocalizedPath();
  const {shop, menu} = header;
  const { isLargeDesktop, isMobile } = useBreakpoints();

  return (
    <header className="header justify-between shadow-md rounded-b-xl hidden tablet:grid grid-cols-[auto_1fr_auto] items-center ">
      {!isMobile && !isLargeDesktop && <MenuToggle />}
      <NavLink
        prefetch="intent"
        to={withLocale('/')}
        style={activeLinkStyle}
        viewTransition
        end
        className="justify-self-center"
      >
        <Image
          src="./images/LogoPlaypeak.svg"
          alt="Logo"
          width={100}
          height={0}
        />
      </NavLink>
      {isLargeDesktop && (
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
          className="hidden largeDesktop:flex justify-self-center"
        />
      )}
      <div className="flex items-center gap-4">
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
  className,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
  className?: string;
}) {
  const withLocale = useLocalizedPath();
  const containerClass = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={`${containerClass} ${className}`} role="navigation">
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

        const iconUrl = getMenuIconUrl(item);
        const hasSubmenu = item.items.length > 0;

        return (
          <Dropdown key={item.id} openOnHover={true}>
            <Dropdown.Button>
              <NavLink
                className="text-link flex items-center px-8 hover:bg-lightGrey rounded-lg py-8 active:bg-accentGrey active:inset-shadow-sm text-nowrap"
                end
                key={item.id}
                onClick={close}
                prefetch="intent"
                style={activeLinkStyle}
                to={withLocale(url)}
                viewTransition
              >
                {iconUrl && (
                  <Image
                    src={iconUrl}
                    alt={item.title}
                    width={18}
                    height={18}
                    className="inline-block mr-8"
                  />
                )}
                {item.title}
                {hasSubmenu ? (
                  <ChevronDown size={18} className="ml-4 h-[20px] w-[20px]" />
                ) : null}
              </NavLink>
            </Dropdown.Button>
            {hasSubmenu ? (
              <Dropdown.Content>
                <div className="flex flex-col rounded-md">
                  {item.items.map((subItem) => {
                    if (!subItem.url) return null;
                    const subUrl = processUrl(subItem.url);
                    return (
                      <ButtonLink
                        key={subItem.id}
                        href={subUrl}
                        prefetch="intent"
                        IconAfter={ArrowRightIcon}
                        className="text-link w-full block px-12 py-12 bg-lightGrey border-solid border-b-2 border-b-accentGrey hover:bg-accentGrey active:inset-shadow-sm"
                      >
                        {subItem.title}
                      </ButtonLink>
                    );
                  })}
                  <ButtonLink
                    IconAfter={ArrowRightIcon}
                    href={url}
                    prefetch="intent"
                    className="text-link w-full block px-12 py-12 text-white bg-primary border-solid border-b-2 border-b-primary"
                  >
                    View all {item.title}
                  </ButtonLink>
                </div>
              </Dropdown.Content>
            ) : null}
          </Dropdown>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <SearchToggle />
      <WishlistToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function SearchToggle() {
  const {openSearchDrawer} = usePlaypeak();
  return (
    <NavMenuItem
      onClick={openSearchDrawer}
      Icon={() => <MagnifyingGlassIcon className="w-[20px] h-[20px]" />}
      label={'Search'}
      variant="menu"
    />
  );
}

function MenuToggle() {
  const {openMenu, closeDrawer, isDrawerOpen} = usePlaypeak();
  const handleToggle = () => {
    if (isDrawerOpen('menu')) {
      closeDrawer();
    } else {
      openMenu();
    }
  };
  return (
    <NavMenuItem
      onClick={handleToggle}
      Icon={() => <Menu className='w-[18px] h-[18px] flex' />}
      label={'Menu'}
      variant='menu'
    />
  );
}

function WishlistToggle() {
  const {openWishlist} = usePlaypeak();
  const {wishlistHandles} = useWishlist();
  const hasWishlistItems = wishlistHandles.length > 0;

  return (
    <NavMenuItem
      onClick={openWishlist}
      Icon={() => <Heart size={20} className={hasWishlistItems ? 'text-primary fill-primary' : ''} />}
      label={'Wishlist'}
      variant="menu"
    />
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {publish, shop, cart, prevCart} = useAnalytics();
  const {openCart} = usePlaypeak();
  return (
    <NavMenuItem
      onClick={() => {
        openCart();
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      Icon={() => <Cart />}
      label="Cart"
      variant="menu"
      badge={count ? count : undefined}
    />
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);

  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
