import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import type { CollectionQuery } from "storefrontapi.generated";
import type { ProductFilter } from "@shopify/hydrogen/storefront-api-types";
import { FILTER_URL_PREFIX } from "~/helpers/const";
import { Checkbox } from "../ui/Checkbox";
import { Image } from "@shopify/hydrogen";
import { Accordion } from '~/components/ui/Accordion';
import clsx from "clsx";

// Filter IDs for expansion, language, and vendor
const EXPANSION_FILTER_ID = "filter.p.m.custom.expansions";
const LANGUAGE_FILTER_ID = "filter.p.m.details.language";
// Vendor filter ID - Shopify may use filter.p.vendor or filter.productVendor
const VENDOR_FILTER_IDS = ["filter.p.vendor", "filter.productVendor", "filter.vendor"];

// Type for collection with products
type CollectionWithProducts = NonNullable<CollectionQuery["collection"]> & {
  products: NonNullable<NonNullable<CollectionQuery["collection"]>["products"]>;
};

// Type for filter value with swatch
type FilterValueWithSwatch =
  NonNullable<CollectionWithProducts["products"]["filters"]>[number]["values"][number];

// Type for custom filter (with optional label)
type CustomFilterType = NonNullable<
  CollectionWithProducts["products"]["filters"]
>[number] & {
  label?: string;
};

// Get param key and value from a filter value input
function getParamFromValue(valueInput: string): { key: string; value: string } | null {
  try {
    const filter = JSON.parse(valueInput) as ProductFilter;
    const filterKey = Object.keys(filter)[0];
    const filterValue = JSON.stringify(filter[filterKey as keyof ProductFilter]);
    return { key: `${FILTER_URL_PREFIX}${filterKey}`, value: filterValue };
  } catch {
    return null;
  }
}

// Check if a URL param value belongs to a specific filter (matches one of its value inputs)
function paramBelongsToFilter(
  paramKey: string,
  paramValue: string,
  filter: CustomFilterType
): boolean {
  if (!filter.values) return false;
  return filter.values.some((v) => {
    const p = getParamFromValue(v.input as string);
    return p?.key === paramKey && p?.value === paramValue;
  });
}

export function CustomFilter({
  collection,
  className,
}: {
  collection: CollectionQuery["collection"];
  className?: string;
}) {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Optimistic state: map filterId -> Set of selected value IDs
  const [optimisticSelections, setOptimisticSelections] = useState<
    Record<string, Set<string>>
  >({});
  const optimisticSelectionsRef = useRef<Record<string, Set<string>>>({});
  const isUserUpdatingRef = useRef(false);
  const pendingUpdatesRef = useRef<Record<string, Set<string>>>({});

  const filters = (collection as CollectionWithProducts)?.products?.filters ?? [];
  const vendorFilter = filters.find(
    (f): f is CustomFilterType => VENDOR_FILTER_IDS.includes(f.id)
  );
  const expansionFilter = filters.find(
    (f): f is CustomFilterType => f.id === EXPANSION_FILTER_ID
  );
  const languageFilter = filters.find(
    (f): f is CustomFilterType => f.id === LANGUAGE_FILTER_ID
  );
  // Only show vendor filter when there are multiple brands
  const vendorFilterToShow =
    vendorFilter?.values && vendorFilter.values.length > 1 ? vendorFilter : null;
  const customFilters = [languageFilter, vendorFilterToShow, expansionFilter].filter(
    Boolean
  ) as CustomFilterType[];

  // Sync optimistic state with URL params
  useEffect(() => {
    if (isUserUpdatingRef.current || customFilters.length === 0) return;

    const nextSelections: Record<string, Set<string>> = {};
    const nextPending: Record<string, Set<string>> = {};

    for (const filter of customFilters) {
      if (!filter.values) continue;

      const selected = new Set<string>();
      filter.values.forEach((value) => {
        const p = getParamFromValue(value.input as string);
        if (!p) return;
        if (params.getAll(p.key).includes(p.value)) {
          selected.add(value.id);
        }
      });

      const pending = pendingUpdatesRef.current[filter.id] ?? new Set();
      const merged = new Set([...selected, ...pending]);
      nextSelections[filter.id] = merged;
      nextPending[filter.id] = new Set();
    }

    setOptimisticSelections(nextSelections);
    optimisticSelectionsRef.current = nextSelections;
    pendingUpdatesRef.current = nextPending;
  }, [params, expansionFilter, languageFilter, vendorFilterToShow]);

  if (customFilters.length === 0) return null;

  const isValueSelected = (filterId: string, valueId: string, valueInput: string): boolean => {
    const selections = optimisticSelectionsRef.current[filterId];
    if (selections?.has(valueId)) return true;

    const p = getParamFromValue(valueInput);
    if (!p) return false;
    return params.getAll(p.key).includes(p.value);
  };

  const handleToggle = (filter: CustomFilterType, valueId: string, valueInput: string) => {
    isUserUpdatingRef.current = true;

    const currentSelections =
      optimisticSelectionsRef.current[filter.id] ?? new Set();
    const isSelected = currentSelections.has(valueId);

    const updatedSelections = new Set(currentSelections);
    const pending = pendingUpdatesRef.current[filter.id] ?? new Set();
    if (isSelected) {
      updatedSelections.delete(valueId);
      pending.delete(valueId);
    } else {
      updatedSelections.add(valueId);
      pending.add(valueId);
    }
    pendingUpdatesRef.current[filter.id] = pending;

    const nextSelections = {
      ...optimisticSelectionsRef.current,
      [filter.id]: updatedSelections,
    };
    setOptimisticSelections(nextSelections);
    optimisticSelectionsRef.current = nextSelections;

    // Build URL: keep params from OTHER filters, replace only this filter's params
    const paramsClone = new URLSearchParams();

    params.forEach((value, key) => {
      // Keep param if it doesn't belong to any of our custom filters
      const belongsToUs = customFilters.some((f) =>
        paramBelongsToFilter(key, value, f)
      );
      if (!belongsToUs) {
        paramsClone.append(key, value);
      }
    });

    // Add all selected values from ALL our custom filters
    for (const f of customFilters) {
      const selections = optimisticSelectionsRef.current[f.id];
      if (!selections || !f.values) continue;

      f.values.forEach((v) => {
        if (selections.has(v.id)) {
          const p = getParamFromValue(v.input as string);
          if (p) paramsClone.append(p.key, p.value);
        }
      });
    }

    setTimeout(() => {
      isUserUpdatingRef.current = false;
    }, 100);

    navigate(`${location.pathname}?${paramsClone.toString()}`, {
      preventScrollReset: true,
      replace: true,
    });
  };

  return (
    <Accordion className={className} defaultOpenAll={true}>
      {customFilters.map((filter) => {
        const filterLabel =
          (filter as CustomFilterType & {label?: string}).label ??
          (VENDOR_FILTER_IDS.includes(filter.id) ? 'Brand' : undefined);
        return (
          <Accordion.Item value={filter.id} key={filter.id}>
            <div key={filter.id} className="space-y-3 p-8">
              {filterLabel && (
                <Accordion.Trigger>
                  <h3 className="text-h3 font-semibold text-gray-900">
                    {filterLabel}
                  </h3>
                </Accordion.Trigger>
              )}
              <Accordion.Content
                data-state="open"
                className="pb-24 pt-12"
              >
                <div className="space-y-2 flex flex-wrap gap-8">
                  {filter.values?.map((value: FilterValueWithSwatch) => {
                    const isSelected = isValueSelected(
                      filter.id,
                      value.id,
                      value.input as string,
                    );
                    return (
                      <Checkbox
                        onChange={() =>
                          handleToggle(filter, value.id, value.input as string)
                        }
                        checked={isSelected}
                        key={value.id}
                      >
                        <div className="flex items-center gap-2">
                          {value.swatch?.image?.image?.src && (
                            <Image
                              src={value.swatch.image.image.src}
                              width="40px"
                              sizes="50"
                              alt={value.label || ''}
                              className="rounded object-contain mr-8"
                            />
                          )}
                          <span>{value.label}</span>
                          {value.count !== undefined && (
                            <span className="text-xs">({value.count})</span>
                          )}
                        </div>
                      </Checkbox>
                    );
                  })}
                </div>
              </Accordion.Content>
            </div>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}
