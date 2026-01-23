import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import type { CollectionQuery } from "storefrontapi.generated";
import type { ProductFilter } from "@shopify/hydrogen/storefront-api-types";
import { FILTER_URL_PREFIX } from "~/helpers/const";
import { filterInputToParams } from "~/helpers/filterInputToParams";
import { Checkbox } from "../ui/Checkbox";
import { Image } from "@shopify/hydrogen";
import clsx from "clsx";

// Type for collection with products
type CollectionWithProducts = NonNullable<CollectionQuery["collection"]> & {
  products: NonNullable<NonNullable<CollectionQuery["collection"]>["products"]>;
};

// Type for filter value with swatch
type FilterValueWithSwatch = NonNullable<CollectionWithProducts["products"]["filters"]>[number]["values"][number];

// Type for expansion filter (with optional label that may not be in generated types yet)
type ExpansionFilter = NonNullable<CollectionWithProducts["products"]["filters"]>[number] & {
  label?: string;
};

export function ExpansionFilter({
  collection,
  className
}: {
  collection: CollectionQuery["collection"];
  className?: string;
}) {

  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Optimistic state for selected values - updates immediately
  const [optimisticSelections, setOptimisticSelections] = useState<Set<string>>(new Set());

  // Ref to track current optimistic selections for rapid clicks (always up-to-date)
  const optimisticSelectionsRef = useRef<Set<string>>(new Set());

  // Track if we're in the middle of user-initiated updates to prevent overwriting
  const isUserUpdatingRef = useRef(false);
  const pendingUpdatesRef = useRef<Set<string>>(new Set());

  // Find the expansion filter
  const expansionFilter = (collection as CollectionWithProducts)?.products?.filters?.find(
    (filter): filter is ExpansionFilter => filter.id === "filter.p.m.custom.expansions"
  );


  // Sync optimistic state with URL params only when not in the middle of user updates
  useEffect(() => {
    // Don't sync if user is actively updating (rapid clicks) or if filter doesn't exist
    if (isUserUpdatingRef.current || !expansionFilter?.values) {
      return;
    }

    const selected = new Set<string>();
    expansionFilter.values.forEach((value) => {
      const filter = JSON.parse(value.input as string) as ProductFilter;
      const filterKey = Object.keys(filter)[0];
      const filterValue = JSON.stringify(filter[filterKey as keyof ProductFilter]);
      const paramKey = `${FILTER_URL_PREFIX}${filterKey}`;

      if (params.getAll(paramKey).includes(filterValue)) {
        selected.add(value.id);
      }
    });

    // Merge with any pending updates
    selected.forEach(id => pendingUpdatesRef.current.add(id));
    const mergedSelections = new Set([...selected, ...pendingUpdatesRef.current]);
    setOptimisticSelections(mergedSelections);
    optimisticSelectionsRef.current = mergedSelections;
    pendingUpdatesRef.current.clear();
  }, [params, expansionFilter]);

    if (!expansionFilter || !expansionFilter.values.length) {
    return null;
  }

  // Check which expansions are currently selected (uses optimistic state)
  const isExpansionSelected = (valueId: string, valueInput: string): boolean => {
    // Check optimistic state first for immediate feedback
    if (optimisticSelections.has(valueId)) {
      return true;
    }

    // Fallback to URL params
    const filter = JSON.parse(valueInput) as ProductFilter;
    const filterKey = Object.keys(filter)[0];
    const filterValue = JSON.stringify(filter[filterKey as keyof ProductFilter]);
    const paramKey = `${FILTER_URL_PREFIX}${filterKey}`;
    return params.getAll(paramKey).includes(filterValue);
  };

  // Toggle a filter value with optimistic updates
  const handleToggle = (valueId: string, valueInput: string) => {
    const filter = JSON.parse(valueInput) as ProductFilter;
    const filterKey = Object.keys(filter)[0];
    const filterValue = JSON.stringify(filter[filterKey as keyof ProductFilter]);
    const paramKey = `${FILTER_URL_PREFIX}${filterKey}`;

    // Mark that we're in the middle of user updates
    isUserUpdatingRef.current = true;

    // Use ref for immediate access to latest state (critical for rapid clicks)
    // This ensures each rapid click sees the immediately previous click's state
    const currentSelections = optimisticSelectionsRef.current;
    const isSelected = currentSelections.has(valueId);

    // Calculate the updated selections immediately (before state update)
    const updatedSelections = new Set(currentSelections);
    if (isSelected) {
      updatedSelections.delete(valueId);
      pendingUpdatesRef.current.delete(valueId);
    } else {
      updatedSelections.add(valueId);
      pendingUpdatesRef.current.add(valueId);
    }

    // Update both state and ref immediately for next rapid click
    setOptimisticSelections(updatedSelections);
    optimisticSelectionsRef.current = updatedSelections;

    // Build URL params from updated optimistic state (not from current URL params)
    // This ensures rapid clicks all get included
    const paramsClone = new URLSearchParams();

    // Copy all existing params first (for other filters like price, etc.)
    params.forEach((value, key) => {
      if (!key.startsWith(paramKey)) {
        paramsClone.append(key, value);
      }
    });

    // Add all selected expansion values to params based on updated optimistic state
    expansionFilter.values.forEach((value) => {
      if (updatedSelections.has(value.id)) {
        const valueFilter = JSON.parse(value.input as string) as ProductFilter;
        const valueFilterKey = Object.keys(valueFilter)[0];
        const valueFilterValue = JSON.stringify(valueFilter[valueFilterKey as keyof ProductFilter]);
        const valueParamKey = `${FILTER_URL_PREFIX}${valueFilterKey}`;
        paramsClone.append(valueParamKey, valueFilterValue);
      }
    });

    // Reset the flag after a short delay to allow rapid clicks to complete
    setTimeout(() => {
      isUserUpdatingRef.current = false;
    }, 100);

    // Navigate with replace to avoid history bloat and make it feel faster
    navigate(`${location.pathname}?${paramsClone.toString()}`, {
      preventScrollReset: true,
      replace: true,
    });
  };

  // Get the first value's swatch image if available (for filter header)
  const firstValueWithImage = expansionFilter.values.find(
    (value: FilterValueWithSwatch): value is FilterValueWithSwatch =>
      value.swatch?.image?.image?.src != null
  );

  // Type assertion for label (will be in generated types after regeneration)
  const filterLabel = (expansionFilter as ExpansionFilter & { label?: string }).label;

  return (
    <div className={clsx("space-y-3 p-8", className)}>
      {filterLabel && (
        <h3 className="text-h2 font-semibold text-gray-900">
          {filterLabel}
        </h3>
      )}
      <div className="space-y-2 flex flex-wrap gap-8">
        {expansionFilter.values.map((value: FilterValueWithSwatch) => {
          const isSelected = isExpansionSelected(value.id, value.input as string);
          const valueWithSwatch = value;

          return (
            <Checkbox
              onChange={() => handleToggle(value.id, value.input as string)}
              checked={isSelected}
              key={value.id}
            >
              <div className="flex items-center gap-2">
                {valueWithSwatch.swatch?.image?.image?.src && (
                  <Image
                    src={valueWithSwatch.swatch.image.image.src}
                    width={50}
                    height='100%'
                    alt={value.label || ""}
                    className="rounded"
                  />
                )}
                <span>{value.label}</span>
                {value.count !== undefined && (
                  <span className="text-xs ">({value.count})</span>
                )}
              </div>
            </Checkbox>
          );
        })}
      </div>
    </div>
  );
}
