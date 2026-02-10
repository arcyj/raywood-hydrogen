import getScrollbarWidth from '../helpers/getScrollBarWidth';

const BODY_LOCK_ATTR = 'data-scroll-lock';
const BODY_STYLE_ATTR = 'data-scroll-lock-style';
const HTML_STYLE_ATTR = 'data-scroll-lock-html-style';

export const useScrollLocker =
  () =>
  (lock = true) => {
    if (typeof document === 'undefined') return;

    const body = document.body;
    const html = document.documentElement;

    if (lock) {
      if (body.getAttribute(BODY_LOCK_ATTR) === 'true') return;

      const padding = getScrollbarWidth();
      body.setAttribute(BODY_STYLE_ATTR, body.style.cssText);
      html.setAttribute(HTML_STYLE_ATTR, html.style.cssText);

      body.style.overflow = 'hidden';
      body.style.paddingRight = `${padding}px`;
      html.style.overflow = 'hidden';
      body.setAttribute(BODY_LOCK_ATTR, 'true');
    } else {
      if (body.getAttribute(BODY_LOCK_ATTR) !== 'true') return;

      body.style.cssText = body.getAttribute(BODY_STYLE_ATTR) || '';
      html.style.cssText = html.getAttribute(HTML_STYLE_ATTR) || '';
      body.removeAttribute(BODY_LOCK_ATTR);
      body.removeAttribute(BODY_STYLE_ATTR);
      html.removeAttribute(HTML_STYLE_ATTR);
    }
  };
