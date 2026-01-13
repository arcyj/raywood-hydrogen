import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import { Button } from './ui/Button';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
  skeletonComponent,
  skeletonCount = 8,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
  skeletonComponent?: React.ComponentType;
  skeletonCount?: number;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        // Show skeletons when loading and no nodes (initial load scenario)
        const showSkeletons = isLoading && nodes.length === 0;
        // Show skeletons at the end when loading more items
        const showLoadingMoreSkeletons = isLoading && nodes.length > 0;

        const skeletons = skeletonComponent
          ? Array.from({length: skeletonCount}, (_, index) => {
              const Skeleton = skeletonComponent;
              return <Skeleton key={`skeleton-${index}`} />;
            })
          : null;

        return (
          <div>
            <PreviousLink>
              {isLoading ? 'Loading...' :  <Button variant="tertiary" className='w-full'>↑ Load previous</Button>}
            </PreviousLink>
            {resourcesClassName ? (
              <div className={resourcesClassName}>
                {showSkeletons ? (
                  skeletons
                ) : (
                  <>
                    {resourcesMarkup}
                    {showLoadingMoreSkeletons && skeletonComponent && (
                      <div className="loading-more-skeletons">
                        {Array.from({length: Math.min(skeletonCount, 8)}, (_, index) => {
                          const Skeleton = skeletonComponent;
                          return <Skeleton key={`loading-skeleton-${index}`} />;
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <>
                {showSkeletons ? (
                  skeletons
                ) : (
                  <>
                    {resourcesMarkup}
                    {showLoadingMoreSkeletons && skeletonComponent && (
                      <div className="loading-more-skeletons">
                        {Array.from({length: Math.min(skeletonCount, 8)}, (_, index) => {
                          const Skeleton = skeletonComponent;
                          return <Skeleton key={`loading-skeleton-${index}`} />;
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            <NextLink>
              {isLoading ? 'Loading...' : <Button variant="tertiary" className='w-full'>Load more ↓</Button>}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
