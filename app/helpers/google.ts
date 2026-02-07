/** GTM container ID – change if using a different container */
export const GTM_ID = 'GTM-N58NQWWC';

/** Inline GTM script: loads gtm.js async and initializes dataLayer. Run once in document head. */
export const googleTag = () =>
  `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`;

/** No-script iframe fallback for GTM (valid HTML string; style must be plain HTML, not JSX). */
export const googleTagNoScript = () =>
  `<iframe title="Google Tag Manager" src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/** Push a virtual page_view to dataLayer for SPA route changes (client-only). */
export function pushPageView(path: string, title?: string): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_path: path,
    ...(title != null && { page_title: title }),
  });
}
