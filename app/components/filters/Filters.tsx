import { useMatches } from "react-router";
import { PriceRangeFilter } from "./PriceRangeFilter";
import type { CollectionQuery } from "storefrontapi.generated";
import type { AppliedFilter } from "~/types/filterTypes";
import { CustomFilter } from "./CustomFilter";

export const Filters = () => {
  // Use useMatches to access loader data from the collection route
  const matches = useMatches();

  // Find the collection route match by checking for collection data
  const collectionMatch = matches.find(
    (match) => {
      const data = match.data as any;
      return data?.collection && typeof data.collection === 'object' && 'highestPriceProduct' in data.collection;
    }
  );

  // Get collection data from the route loader
  const collectionData = collectionMatch?.data as
    | (CollectionQuery & {
        collections: Array<{ handle: string; title: string }>;
        appliedFilters: AppliedFilter[];
      })
    | undefined;

  const collection = collectionData?.collection;

  return (
    <div className="">
      <CustomFilter collection={collection} />
      {collection && (
        <PriceRangeFilter
          collection={collection}
          className="my-12"
        />
      )}
    </div>
  );
}
