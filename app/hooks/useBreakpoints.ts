import { useEffect, useState } from 'react';
// import { useServerProp } from './selectors/useServerProp';

enum Breakpoints {
  SMALL_MOBILE = 375,
  SMALL_TABLET = 600,
  TABLET = 768,
  LARGE_TABLET = 840,
  DESKTOP = 1024,
  LARGE_DESKTOP = 1400,
}

interface IBreakpoints {
  isMobileSmall: boolean;
  isMobile: boolean;
  isTabletSmall: boolean;
  isTablet: boolean;
  isTabletLarge: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
}

const getBreakpoints = (width: number): IBreakpoints => ({
  isMobileSmall: width < Breakpoints.SMALL_MOBILE,
  isMobile: width <= Breakpoints.TABLET,
  isTabletSmall: width < Breakpoints.SMALL_TABLET,
  isTablet: width > Breakpoints.TABLET,
  isTabletLarge: width < Breakpoints.LARGE_TABLET,
  isDesktop: width >= Breakpoints.DESKTOP,
  isLargeDesktop: width >= Breakpoints.LARGE_DESKTOP,
});

export const useBreakpoints = () => {
  // set initial breakpoint based on detected device type
  // avoid flicker when effect is run for the first time
  // const isDesktop = useServerProp('isDesktop');
  const [breakpoints, setBreakpoints] = useState(getBreakpoints(Breakpoints.DESKTOP));

  useEffect(() => {
    setBreakpoints(getBreakpoints(window.innerWidth));
    const handleResize = () => setBreakpoints(getBreakpoints(window.innerWidth));

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoints;
};
