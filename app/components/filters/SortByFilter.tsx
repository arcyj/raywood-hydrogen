import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocation, useSearchParams } from "react-router";
import { Link } from "react-router";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { SortParam } from "~/types/filterTypes";
import { twClasses } from "~/helpers/twMerge";
import { useTranslation } from "~/lib/i18nContext";
import type { TranslationKey } from "~/lib/i18nContext";

const SORT_LIST: { labelKey: TranslationKey; key: SortParam }[] = [
  { labelKey: "filter.featured", key: "featured" },
  { labelKey: "filter.relevance", key: "relevance" },
  { labelKey: "filter.price_asc", key: "price-low-high" },
  { labelKey: "filter.price_desc", key: "price-high-low" },
  { labelKey: "filter.best_selling", key: "best-selling" },
  { labelKey: "filter.newest", key: "newest" },
];

export function SortByFilter() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { t } = useTranslation();

  const currentSort =
    SORT_LIST.find(({ key }) => key === searchParams.get("sort")) ||
    SORT_LIST[0];
  const params = new URLSearchParams(searchParams);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex h-40 px-16 items-center gap-1.5 bg-lightGrey rounded-2xl py-2.5 focus-visible:outline-hidden hover:shadow-lg active:bg-accentGrey active:inset-shadow-sm">
        <span className="inline">
          {t('filter.sort_by')}: <span className="font-semibold">{t(currentSort.labelKey)}</span>
        </span>
        <ChevronDownIcon />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="flex flex-col gap-2 border border-accentGrey bg-white shadow-2xl rounded-2xl p-8"
        >
          {SORT_LIST.map(({ key, labelKey }) => {
            params.set("sort", key);
            return (
              <DropdownMenu.Item key={key} asChild>
                <Link
                  to={`${location.pathname}?${params.toString()}`}
                  className={twClasses(
                    [' hover:underline hover:outline-hidden font-regular rounded-md px-12 py-4'],
                    {
                      ['bg-lightGrey']: currentSort.key != key,
                      ['font-bold bg-accentGrey']: currentSort.key === key,
                    },
                  )}
                  preventScrollReset
                >
                  {t(labelKey)}
                </Link>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
