import { Image } from "@shopify/hydrogen";
import { useLocation, useNavigate } from "react-router";
import { twClasses } from "~/helpers/twMerge";
import { ChevronLeftIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Filter } from "./icons";
import { useAside } from "./Aside";
import { Button } from "./ui/Button";

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useAside();

  const initial = 'fixed top-0 left-0 border-t-4 border-[#1D1229]/69 flex w-full justify-between px-4 z-10';

  const classes = twClasses([initial], {}, );

  // Determine which buttons to show based on current route
  const isProductPage = location.pathname.includes('/products/');
  const isCollectionPage = location.pathname.includes('/collections/') && !location.pathname.includes('/collections/all');

  const handleBack = () => {
    navigate(-1);
  };

  const handleFilter = () => {
    open('filter');
  };

  const handleSearch = () => {
    open('search');
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
            onClick={handleBack}
            variant="action"
            size="extra-small"
            className=""
            aria-label="Go back"
            IconBefore={ChevronLeftIcon}
          >
            Back
          </Button>
            <button
              onClick={handleFilter}
              className="p-2 hover:opacity-70 transition-opacity"
              aria-label="Filter products"
            >
              <Filter size={24} />
            </button>
          </>
        )}
      </div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[#1D1229]/69 inline-block rounded-b-xl px-8 pb-4 h-auto">
        <Image src="./images/LogoPlaypeak.svg" alt="Logo" width={55} height={0} />
      </div>
      <div className="mt-4 ml-auto">
          <Button
            onClick={handleSearch}
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
