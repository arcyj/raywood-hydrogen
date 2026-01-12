export function ProductItemSkeleton() {
  return (
    <div className="product-item bg-lightGrey rounded px-12 pt-12 pb-24 skeleton-pulse">
      <div>
        {/* Image skeleton */}
        <div className="mix-blend-darken">
          <div className="skeleton-shimmer rounded aspect-square w-full" />
        </div>
        {/* Vendor skeleton */}
        <div className="h-3 skeleton-shimmer rounded mt-4 w-20" />
        {/* Title skeleton - 2 lines matching text-h4 */}
        <div className="mt-4 space-y-2">
          <div className="h-4 skeleton-shimmer rounded w-full" />
          <div className="h-4 skeleton-shimmer rounded w-3/4" />
        </div>
        {/* Price skeleton matching text-[18px] desktop:text-[22px] */}
        <div className="h-6 skeleton-shimmer rounded w-24 mt-4" />
      </div>
    </div>
  );
}
