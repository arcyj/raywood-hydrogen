import { useMemo, Suspense } from 'react';
import { Accordion } from "radix-ui";
import { Image } from "@shopify/hydrogen";
import { ChevronDownIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { NavLink, Await, Form } from 'react-router';
import { twc, twClasses } from '~/helpers/twMerge';
import type {HeaderQuery} from 'storefrontapi.generated';
import type { FC } from 'react';
import { useDrawer } from './Drawer';
import { getMenuIconUrl } from '~/helpers/getMenuIconUrl';
import { ChevronRight, Profile } from '../icons';
import {useLocalizedPath} from '~/hooks/useLocalePath';
import { processUrl } from '~/helpers/processUrl';
import { ButtonLink } from './Link';
import { Button } from './Button';

interface IDropDownMenuProps {
  menu: HeaderQuery['menu'];
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  primaryDomainUrl: string;
  className?: string;
}

const dropDownMenuItemStyle = {
  base: {
    initial: twc`w-full rounded-md shadow-black/5`,
  },
};

export const DropDownMenu: FC<IDropDownMenuProps> = ({
  className,
  menu,
  publicStoreDomain,
  primaryDomainUrl,
  isLoggedIn,
}) => {
  const { base } = dropDownMenuItemStyle;
  const { onClose } = useDrawer();
  const withLocale = useLocalizedPath();

  const classes = useMemo(
    () => twClasses([base['initial']], {}, className),
    [base, className],
  );

  // Helper function to convert absolute URLs to relative paths
  const processUrl = (itemUrl: string): string => {
    // If it's already a relative path, return as-is
    if (itemUrl.startsWith('/')) {
      return itemUrl;
    }

    // If it's an absolute URL, extract the pathname
    if (itemUrl.startsWith('http://') || itemUrl.startsWith('https://')) {
      try {
        return new URL(itemUrl).pathname;
      } catch {
        // If URL parsing fails, return as-is
        return itemUrl;
      }
    }

    // For any other format, return as-is
    return itemUrl;
  };

  const navLinkStyle = twc`text-medium-semi transition-colors mb-4 py-12 px-8 bg-lightGrey rounded-md flex justify-between items-center  active:bg-accentGrey active:inset-shadow-sm`

  return (
    <Accordion.Root className={classes} type="single" collapsible>
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        const url = processUrl(item.url);
        return (
          <DropDownMenuItem
            key={item.id}
            item={item as MenuItem}
            url={url}
            publicStoreDomain={publicStoreDomain}
            primaryDomainUrl={primaryDomainUrl}
          />
        );
      })}
      <Accordion.Item value="account">
        <Accordion.Header>
          <Accordion.Trigger className="flex w-full border-b-2 border-lightGrey items-center justify-between py-16 text-left text-body-regular font-semibold leading-none text-text-layout-powerful hover:bg-gray-100  active:bg-lightGrey active:inset-shadow-b-sm">
            <span>
              <Profile size={20} className="inline-block mr-8" />
              Account
            </span>
            <ChevronDownIcon />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content className="my-8 text-body-regular text-text-layout-secondary">
          <NavLink
            to={withLocale('/account/orders')}
            className={navLinkStyle}
            onClick={onClose}
          >
            <span>Orders</span>
            <ChevronRight size={20} />
          </NavLink>
          <NavLink
            to={withLocale('/account/profile')}
            className={navLinkStyle}
            onClick={onClose}
          >
            <span>Profile</span>
            <ChevronRight size={20} />
          </NavLink>
          <NavLink
            to={withLocale('/account/addresses')}
            className={navLinkStyle}
            onClick={onClose}
          >
            <span>Addresses</span>
            <ChevronRight size={20} />
          </NavLink>
          <div className="border-t border-gray-200 mt-12 pt-12">
            <Suspense fallback={<div className="px-16 py-12">Loading...</div>}>
              <Await resolve={isLoggedIn}>
                {(loggedIn) =>
                  loggedIn ? (
                    <Form
                      method="POST"
                      action={withLocale('/account/logout')}
                      onSubmit={onClose}
                    >
                      <Button
                        type="submit"
                        variant="secondary"
                        className="w-full"
                        size="medium"
                      >
                        Sign Out
                      </Button>
                    </Form>
                  ) : (
                    <ButtonLink
                      href="/account/login"
                      className="w-full"
                      onClick={onClose}
                      variant="primary"
                    >
                      Sign In
                    </ButtonLink>
                  )
                }
              </Await>
            </Suspense>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

type MenuItem = NonNullable<HeaderQuery['menu']>['items'][number];

interface IDropDownMenuItemProps {
  item?: MenuItem;
  url: string;
  publicStoreDomain: string;
  primaryDomainUrl: string;
}

const DropDownMenuItem: FC<IDropDownMenuItemProps> = ({
  item,
  url,
  publicStoreDomain,
  primaryDomainUrl,
}) => {
  const { onClose } = useDrawer();
  const withLocale = useLocalizedPath();

  if (!item || !url) return null;

  const hasSubItems = item.items && item.items.length > 0;
  const iconUrl = getMenuIconUrl(item);

  return (
    <Accordion.Item value={item.id}>
      <Accordion.Header>
        <Accordion.Trigger className="flex w-full border-b-2 border-lightGrey items-center justify-between py-16 text-left text-body-regular font-semibold leading-none text-text-layout-powerful hover:bg-gray-100  active:bg-lightGrey active:inset-shadow-b-sm">
          {hasSubItems ? (
            <span>
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
            </span>
          ) : (
            <NavLink
              to={withLocale(url)}
              className="w-full"
              end
              prefetch="intent"
              style={activeLinkStyle}
              viewTransition
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
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
            </NavLink>
          )}
          {hasSubItems && <ChevronDownIcon />}
        </Accordion.Trigger>
      </Accordion.Header>
      {hasSubItems && (
        <Accordion.Content className="my-8 text-body-regular text-text-layout-secondary">
          <nav className="flex flex-col mb-4">
            {item.items.map((subItem) => {
              if (!subItem.url) return null;
              const subUrl = processUrl(subItem.url);
              return (
                <NavLink
                  key={subItem.id}
                  to={withLocale(subUrl)}
                  end
                  prefetch="intent"
                  style={activeLinkStyle}
                  className="text-medium-semi transition-colors mb-4 py-12 px-8 bg-lightGrey rounded-md flex justify-between items-center  active:bg-accentGrey active:inset-shadow-sm"
                  onClick={onClose}
                  viewTransition
                >
                  {subItem.title}
                  <ChevronRight size={20} />
                </NavLink>
              );
            })}
            <ButtonLink
              IconAfter={ArrowRightIcon}
              href={withLocale(url)}
              prefetch="intent"
              onClick={onClose}
              size='large'
              className="text-link rounded-md w-full block px-12 py-12 text-white bg-primary border-solid border-b-2 border-b-primary mt-4"
            >
              View all {item.title}
            </ButtonLink>
          </nav>
        </Accordion.Content>
      )}
    </Accordion.Item>
  );
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
