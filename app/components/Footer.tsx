import {Suspense} from 'react';
import { Image } from '@shopify/hydrogen';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="footer pb-12 max-mediumDesktop:px-12 max-mediumDesktop:pt-44 max-desktop:pb-[80px] bg-midnight">
            <Image
              src="/images/footer.svg"
              alt="footer peaks"
              sizes="25px"
              className="w-full relative -top-[40px] hidden mediumDesktop:block"
            />
            <div className="container mx-auto grid grid-cols-2 tablet:grid-cols-2 desktop:grid-cols-4 gap-24">
              {footer?.menu && header.shop.primaryDomain?.url && (
                <FooterMenu
                  menu={footer.menu}
                  primaryDomainUrl={header.shop.primaryDomain.url}
                  publicStoreDomain={publicStoreDomain}
                  title="Info"
                />
              )}
              {footer?.menuBrands && header.shop.primaryDomain?.url && (
                <FooterMenu
                  menu={footer.menuBrands}
                  primaryDomainUrl={header.shop.primaryDomain.url}
                  publicStoreDomain={publicStoreDomain}
                  title="Brands"
                />
              )}
              <div className="flex flex-col">
                <p className="text-h4 text-white mb-12">Resources</p>
                <a
                  href="https://www.facebook.com/profile.php?id=61550358300608"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-white opacity-80 hover:opacity-100 py-8"
                >
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/playpeakeu/"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-white opacity-80 hover:opacity-100 py-8"
                >
                  Instagram
                </a>
                <NavLink
                  end
                  prefetch="intent"
                  style={activeLinkStyle}
                  to="/blog"
                  className="opacity-80 hover:opacity-100 py-8"
                >
                  Blog
                </NavLink>
              </div>
              <div className='text-center flex flex-col items-center justify-center'>
                <Image
                  src="./images/badge_cardmarket.jpg"
                  alt="Logo"
                  width={110}
                  height="100%"
                />
                <p className="text-white text-medium-semi pt-16 max-w-[180px]">Playpeak is a certified seller on Cardmarket</p>
              </div>
            </div>
            <div className="w-full mt-24 border-[#3b2844] border-t pt-12">
              <p className="text-small text-accentGrey text-center">
                © 2026, PlayPeak
              </p>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
  title = 'Info',
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
  title?: string;
}) {
  return (
    <nav className="" role="navigation">
      <p className='text-h4 text-white mb-12'>{title}</p>
      <div className='flex flex-col'>
        {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
          if (!item.url) return null;
          // if the url is internal, we strip the domain
          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname
              : item.url;
          const isExternal = !url.startsWith('/');
          return isExternal ? (
            <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
              {item.title}
            </a>
          ) : (
            <NavLink
              end
              key={item.id}
              prefetch="intent"
              style={activeLinkStyle}
              to={url}
              className="opacity-80 hover:opacity-100 py-8"
            >
              {item.title}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
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
    color: isPending ? 'grey' : 'white',
  };
}
