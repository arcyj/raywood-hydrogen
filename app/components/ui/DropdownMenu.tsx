import { useMemo } from 'react';
import { Accordion } from "radix-ui";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { NavLink } from 'react-router';
import { twc, twClasses } from '~/helpers/twMerge';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import type { MouseEvent, KeyboardEvent, FC } from 'react';
import { useDrawer } from './Drawer';


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
}) => {
  const { base } = dropDownMenuItemStyle;

  console.log(menu);
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

  if (!item || !url) return null;

  const hasSubItems = item.items && item.items.length > 0;

  // Process sub-item URLs - convert absolute URLs to relative paths
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

  return (
    <Accordion.Item value={item.id}>
      <Accordion.Header>
        <Accordion.Trigger className="flex w-full border-b-2 border-lightGrey items-center justify-between py-16 text-left text-body-regular font-semibold leading-none text-text-layout-powerful hover:bg-gray-100">
          {hasSubItems ? (
            item.title
          ) : (
            <NavLink
              to={url}
              className="w-full"
              end
              prefetch="intent"
              style={activeLinkStyle}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
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
                  to={subUrl}
                  end
                  prefetch="intent"
                  style={activeLinkStyle}
                  className="hover:text-text-layout-powerful transition-colors mb-4 py-8 px-8 bg-lightGrey rounded-md"
                  onClick={onClose}
                >
                  {subItem.title}
                </NavLink>
              );
            })}
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
