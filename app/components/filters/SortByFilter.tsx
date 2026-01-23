import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocation, useSearchParams } from "react-router";
import { Link } from "react-router";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { SortParam } from "~/types/filterTypes";
import { twClasses } from "~/helpers/twMerge";

const SORT_LIST: { label: string; key: SortParam }[] = [
  { label: "Featured", key: "featured" },
  {
    label: "Relevance",
    key: "relevance",
  },
  {
    label: "Price, (low to high)",
    key: "price-low-high",
  },
  {
    label: "Price, (high to low)",
    key: "price-high-low",
  },
  {
    label: "Best selling",
    key: "best-selling",
  },
  {
    label: "Newest",
    key: "newest",
  },
];

export function SortByFilter() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const currentSort =
    SORT_LIST.find(({ key }) => key === searchParams.get("sort")) ||
    SORT_LIST[0];
  const params = new URLSearchParams(searchParams);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex h-40 px-16 items-center gap-1.5 bg-lightGrey rounded py-2.5 focus-visible:outline-hidden hover:shadow-lg active:bg-accentGrey active:inset-shadow-sm">
        <span className="hidden lg:inline">
          Sort by: <span className="font-semibold">{currentSort.label}</span>
        </span>
        <span className="lg:hidden">Sort</span>
        <ChevronDownIcon />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="flex flex-col gap-2 border border-line-subtle bg-white p-5"
        >
          {SORT_LIST.map(({ key, label }) => {
            params.set("sort", key);
            return (
              <DropdownMenu.Item key={key} asChild>
                <Link
                  to={`${location.pathname}?${params.toString()}`}
                  className={twClasses(
                    ['underline-offset-[6px] hover:underline hover:outline-hidden'],
                    {
                      ['font-bold']: currentSort.key === key,
                    },
                  )}
                  preventScrollReset
                >
                  {label}
                </Link>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
