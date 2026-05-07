import { useEffect } from "react";
import { Image } from "@shopify/hydrogen";
import { useLocation, useNavigate, NavLink } from "react-router";
import { twClasses } from "~/helpers/twMerge";
import { ChevronLeftIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { usePlaypeak } from "~/lib/playpeakContext";
import { Button } from "./ui/Button";
import {useLocalizedPath} from '~/hooks/useLocalePath';

const BACK_PREV_KEY = 'pp-back-prev';
const BACK_CURR_KEY = 'pp-back-curr';

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const { isDrawerOpen, closeFilter, openFilter } = usePlaypeak();

  const initial = 'fixed top-0 left-0 border-t-4 border-[#35204d] flex w-full justify-between px-4 pb-8 z-20';

  const classes = twClasses([initial], {}, );

  // Track previous in-app path so Back works correctly (history.length is unreliable in SPAs)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = location.pathname + location.search;
    const prev = sessionStorage.getItem(BACK_CURR_KEY);
    if (prev !== null && prev !== path) {
      sessionStorage.setItem(BACK_PREV_KEY, prev);
    }
    sessionStorage.setItem(BACK_CURR_KEY, path);
  }, [location.pathname, location.search]);

  // Determine which buttons to show based on current route
  const isProductPage = location.pathname.includes('/products/');
  const isCollectionPage = location.pathname.includes('/collections/') && !location.pathname.includes('/collections/all');

  const handleBack = () => {
    if (typeof window === 'undefined') {
      navigate(withLocale('/'));
      return;
    }
    const prevPath = sessionStorage.getItem(BACK_PREV_KEY);
    const currPath = location.pathname + location.search;
    // If we have a previous in-app path (and it's not current), go there; else homepage
    if (prevPath && prevPath !== currPath) {
      navigate(prevPath);
    } else {
      navigate(withLocale('/'));
    }
  };

  const handleFilter = () => {
    if (isDrawerOpen('filter')) {
      closeFilter();
    } else {
      openFilter();
    }
  };

  return (
    <div className={classes}>
      <div className="flex justify-start mt-4">
        {isProductPage && (
          <Button
            onClick={handleBack}
            variant="action"
            size="extra-small"
            className=""
            aria-label="Go back"
            IconBefore={ChevronLeftIcon}
          >
            Back
          </Button>
        )}
        {isCollectionPage && (
          <>
            <Button
              onClick={handleFilter}
              variant="action"
              size="extra-small"
              className=""
              aria-label="Go back"
              IconBefore={MixerHorizontalIcon}
            >
              Filter
            </Button>
          </>
        )}
      </div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[#35204d] inline-block rounded-b-xl px-8 pb-4 h-auto">
        <div className="relative">
          <div className="inverted-radius-left bg-[#35204d] w-[40px] h-[42px] absolute -left-[20px] -top-[30px]"></div>
          <NavLink prefetch="intent" to={withLocale('/')} viewTransition end>
            <Image
              src="./images/RAYWOODSTORE.svg"
              alt="Logo"
              width={65}
              height={0}
              className="p-4"
            />
          </NavLink>
          <div className="inverted-radius-right bg-[#35204d] w-[40px] h-[42px] absolute -right-[20px] -top-[30px]"></div>
        </div>
      </div>
    </div>
  );
}
