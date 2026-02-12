import type {CountryCode} from '@shopify/hydrogen/storefront-api-types';
import {Analytics, getShopAnalytics, useNonce, Script} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  Link,
} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {Route} from './+types/root';
import {redirect} from 'react-router';
import {FOOTER_QUERY, HEADER_QUERY, LOCALIZATION_QUERY} from '~/lib/fragments';
import {
  buildLocaleOptionsFromApi,
  getDetectedCountryCode,
  getPreferredCurrencyFromCookie,
} from '~/lib/i18n';
import {
  DEFAULT_CURRENCY,
  getCurrencyByCode,
  getCurrencyForCountry,
} from '~/helpers/currencies';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import resetStyles from '~/styles/reset.css?url';
import {PageLayout} from './components/PageLayout';
import {ErrorPage} from './components/ErrorPage';
import { GoogleTagManager } from './helpers/GoogleTagManager';
import {CurrencyProvider} from '~/lib/CurrencyContext';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export type RootLoader = typeof loader;
export type RootLoaderData = Awaited<ReturnType<RootLoader>>;

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {
      rel: 'preconnect',
      href: 'https://www.googletagmanager.com',
    },
    { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.ico' },
    { rel: 'icon', type: 'image/svg+xml', href: '/images/favicon.svg' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/images/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/images/favicon-16x16.png' },
    { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/images/favicon-96x96.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
  ];
}

/** Redirect paths with locale segment (e.g. /en-gb/cart) to path without locale (/cart) */
function redirectIfLocaleInPath(request: Request) {
  const url = new URL(request.url);
  const segment = url.pathname.slice(1).split('/')[0] ?? '';
  if (/^[a-z]{2}-[a-z]{2}$/i.test(segment)) {
    const pathWithoutLocale = url.pathname.slice(segment.length + 1) || '/';
    throw redirect(pathWithoutLocale + url.search);
  }
}

export async function loader(args: Route.LoaderArgs) {
  redirectIfLocaleInPath(args.request);

  const criticalData = await loadCriticalData(args);
  const {storefront, env} = args.context;
  const detectedCountry = getDetectedCountryCode(args.request);
  const preferredCurrency = getPreferredCurrencyFromCookie(args.request);
  const initialCurrency = preferredCurrency
    ? (getCurrencyByCode(preferredCurrency) ?? DEFAULT_CURRENCY)
    : getCurrencyForCountry(detectedCountry ?? 'LV');

  const deferredData = loadDeferredData(args);

  return {
    ...deferredData,
    ...criticalData,
    detectedCountry,
    initialCurrency,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: true,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header, localization] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    storefront
      .query(LOCALIZATION_QUERY, {
        cache: storefront.CacheLong(),
      })
      .catch(() => null),
  ]);

  const availableLocales = buildLocaleOptionsFromApi(localization);

  return {header, availableLocales};
}

/**
 * Load data for below-the-fold content. Returns promises so the loader doesn't block –
 * cart streams in for fast navigation.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;
  const countryCode = (storefront.i18n as {country?: string}).country;

  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer',
        footerBrandsMenuHandle: 'footer-brands',
      },
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  const cartPromise = (async () => {
    const raw = await cart.get();
    if (raw?.id && countryCode && raw.buyerIdentity?.countryCode !== countryCode) {
      const updated = await cart.updateBuyerIdentity({
        countryCode: countryCode as CountryCode,
      });
      if (updated?.cart) return updated.cart;
    }
    return raw;
  })();

  return {
    cart: cartPromise,
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,viewport-fit=cover"
        />
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <meta name="apple-mobile-web-app-title" content="Playpeak" />
        <meta
          name="google-site-verification"
          content="eemZ-QHeaOHL0Gyk9T5Rmq9B3mE7EGWODW2N1ggDBD4"
        />
        <Meta />
        <Links />
        {/* @description Add Google Tag Manager script to head */}
        <Script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N58NQWWC');`,
          }}
        ></Script>
      </head>
      <body>
        <noscript>
          <iframe
            title="Google Tag Manager"
            src="https://www.googletagmanager.com/ns.html?id=GTM-N58NQWWC"
            height="0"
            width="0"
            style={{
              display: 'none',
              visibility: 'hidden',
            }}
          ></iframe>
        </noscript>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return (
      <>
        <GoogleTagManager />
        <Outlet />
      </>
    );
  }

  return (
    <CurrencyProvider
      initialCurrency={data.initialCurrency}
      initialDetectedCountry={data.detectedCountry}
    >
      <Analytics.Provider
        cart={data.cart}
        shop={data.shop}
        consent={data.consent}
      >
        <GoogleTagManager />
        <PageLayout {...data}>
          <Outlet />
        </PageLayout>
      </Analytics.Provider>
    </CurrencyProvider>
  );
}

function ErrorLayout({
  children,
  withFullLayout,
  data,
}: {
  children: React.ReactNode;
  withFullLayout: boolean;
  data: RootLoaderData | undefined;
}) {
  if (withFullLayout && data) {
    return (
      <PageLayout
        cart={data.cart}
        footer={data.footer}
        header={data.header}
        isLoggedIn={data.isLoggedIn}
        publicStoreDomain={data.publicStoreDomain}
      >
        {children}
      </PageLayout>
    );
  }

  return (
    <>
      <header className="flex items-center justify-center shadow-md rounded-b-xl min-h-[var(--header-height)] px-4 py-2">
        <div className="flex items-center justify-center w-full">
          <Link to="/" prefetch="intent" className="inline-block">
            <Image
              src="./images/LogoPlaypeak.svg"
              alt="Playpeak"
              width={100}
              height={40}
            />
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer bg-midnight py-12">
        <div className="container mx-auto text-center">
          <p className="text-small text-white/80">© {new Date().getFullYear()}, PlayPeak</p>
        </div>
      </footer>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const data = useRouteLoaderData<RootLoader>('root') as RootLoaderData | undefined;
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
  } else if (error instanceof Error) {
    // keep 500 for unknown errors
  }

  const withFullLayout = Boolean(data);

  return (
    <>
      <GoogleTagManager />
      <ErrorLayout withFullLayout={withFullLayout} data={data}>
        <ErrorPage status={errorStatus} />
      </ErrorLayout>
    </>
  );
}
