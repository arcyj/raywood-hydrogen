import getScrollbarWidth from '../helpers/getScrollBarWidth';

export const useScrollLocker =
  () =>
  (lock = true) => {
    if (lock) {
      const padding = getScrollbarWidth();
      document.body.style.cssText = `overflow: hidden; padding-right: ${padding}px;`;
    } else {
      document.body.style.cssText = '';
    }
  };
