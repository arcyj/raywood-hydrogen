import { Image } from "@shopify/hydrogen";
import { useLocation, useNavigate } from "react-router";
import { twClasses } from "~/helpers/twMerge";
import { ChevronLeftIcon, MagnifyingGlassIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { useAside } from "./Aside";
import { usePlaypeak } from "~/lib/playpeakContext";
import { Button } from "./ui/Button";

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useAside();
  const { openSearchDrawer, closeSearchDrawer, isDrawerOpen, closeFilter, openFilter } = usePlaypeak();

  const initial = 'fixed top-0 left-0 border-t-4 border-[#1D1229]/69 flex w-full justify-between px-4 pb-8 z-20 bg-[#1D1229]';

  const classes = twClasses([initial], {}, );

  // Determine which buttons to show based on current route
  const isProductPage = location.pathname.includes('/products/');
  const isCollectionPage = location.pathname.includes('/collections/') && !location.pathname.includes('/collections/all');

  const handleBack = () => {
    navigate(-1);
  };

  const handleFilter = () => {
    if (isDrawerOpen('filter')) {
      closeFilter();
    } else {
      openFilter();
    }
  };

    const handleSearchToggle = () => {
    if (isDrawerOpen('search')) {
      closeSearchDrawer();
    } else {
      openSearchDrawer();
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
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-[#1D1229]/69 inline-block rounded-b-xl px-8 pb-4 h-auto">
        <Image src="./images/LogoPlaypeak.svg" alt="Logo" width={55} height={0} />
      </div>
      <div className="mt-4 ml-auto">
          <Button
            onClick={handleSearchToggle}
            variant="action"
            size="extra-small"
            className=""
            aria-label="search"
            IconBefore={MagnifyingGlassIcon}
          >
            Search
          </Button>
      </div>
    </div>
  );
}
