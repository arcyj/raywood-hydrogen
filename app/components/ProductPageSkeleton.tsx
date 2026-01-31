/**
 * Skeleton UI for the product page while full product data is loading.
 * Mirrors the layout of the real product page for a smooth transition.
 */
export function ProductPageSkeleton() {
  return (
    <div className="container mx-auto">
      {/* Breadcrumb skeleton */}
      <nav
        aria-hidden
        className="flex items-center gap-2 py-8 min-h-[44px]"
      >
        <div className="h-5 w-8 rounded bg-lightGrey skeleton-pulse" />
        <div className="h-5 w-2 rounded bg-lightGrey skeleton-pulse" />
        <div className="h-5 w-24 rounded bg-lightGrey skeleton-pulse" />
        <div className="h-5 w-2 rounded bg-lightGrey skeleton-pulse" />
        <div className="h-5 w-32 rounded bg-lightGrey skeleton-pulse" />
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-64 min-w-0">
        {/* Gallery skeleton */}
        <div className="min-w-0 -mx-12 pb-12 tablet:rounded-lg">
          <div className="bg-lightGrey rounded-lg aspect-square skeleton-pulse" />
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-1 max-w-[90px] h-[70px] rounded-lg bg-lightGrey skeleton-pulse"
              />
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="product-main">
          <div className="h-4 w-16 rounded bg-lightGrey skeleton-pulse mb-4" />
          <div className="h-8 w-3/4 rounded bg-lightGrey skeleton-pulse mb-12" />
          <div className="h-5 w-24 rounded bg-lightGrey skeleton-pulse mb-12" />
          <div className="flex items-end justify-between mb-24">
            <div className="h-14 w-24 rounded bg-lightGrey skeleton-pulse" />
            <div className="h-8 w-20 rounded bg-lightGrey skeleton-pulse" />
          </div>
          <div className="flex gap-12">
            <div className="flex-1 h-12 rounded bg-lightGrey skeleton-pulse" />
            <div className="h-12 w-12 rounded bg-lightGrey skeleton-pulse" />
          </div>
          <div className="mt-32 space-y-4">
            <div className="h-6 w-full rounded bg-lightGrey skeleton-pulse" />
            <div className="h-20 w-full rounded bg-lightGrey skeleton-pulse" />
            <div className="h-6 w-full rounded bg-lightGrey skeleton-pulse" />
            <div className="h-20 w-full rounded bg-lightGrey skeleton-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
