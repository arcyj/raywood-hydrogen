import * as React from 'react';
import {Link, useNavigation} from 'react-router';
import {Pagination} from '@shopify/hydrogen';
import { Button } from './ui/Button';
import {useLocalizedPath} from '~/hooks/useLocalePath';

type ConnectionWithNodes<NodesType> = {
  nodes: NodesType[];
  pageInfo: {hasNextPage: boolean};
};

/**
 * <PaginatedResourceSection> encapsulates previous/next pagination.
 * When nextPageUrl is provided (page-based), the list survives refresh; otherwise uses cursor-based Pagination.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
  skeletonComponent,
  skeletonCount = 8,
  nextPageUrl,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
  skeletonComponent?: React.ComponentType;
  skeletonCount?: number;
  /** When set, use page-based pagination (URL persists on refresh). Must match loader that uses ?page= */
  nextPageUrl?: string | null;
}) {
  const navigation = useNavigation();

  if (nextPageUrl != null) {
    return (
      <PageBasedSection<NodesType>
        connection={connection as ConnectionWithNodes<NodesType>}
        children={children}
        resourcesClassName={resourcesClassName}
        skeletonComponent={skeletonComponent}
        skeletonCount={skeletonCount}
        nextPageUrl={nextPageUrl}
        isLoading={navigation.state === 'loading'}
      />
    );
  }

  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        const showSkeletons = isLoading && nodes.length === 0;
        const showLoadingMoreSkeletons = isLoading && nodes.length > 0;

        const skeletons = skeletonComponent
          ? Array.from({length: skeletonCount}, (_, index) => {
              const Skeleton = skeletonComponent;
              return <Skeleton key={`skeleton-${index}`} />;
            })
          : null;

        return (
          <div>
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
              {isLoading ? 'Loading...' : <Button variant="secondary" className='w-full'>Load more ↓</Button>}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}

function PageBasedSection<NodesType>({
  connection,
  children,
  resourcesClassName,
  skeletonComponent,
  skeletonCount,
  nextPageUrl,
  isLoading,
}: {
  connection: ConnectionWithNodes<NodesType>;
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
  skeletonComponent?: React.ComponentType;
  skeletonCount?: number;
  nextPageUrl: string;
  isLoading: boolean;
}) {
  const withLocale = useLocalizedPath();
  const nodes = connection.nodes ?? [];
  const hasNextPage = connection.pageInfo?.hasNextPage ?? false;
  const resourcesMarkup = nodes.map((node, index) =>
    children({node, index}),
  );

  const showSkeletons = isLoading && nodes.length === 0;
  const showLoadingMoreSkeletons = isLoading && nodes.length > 0;

  const skeletons = skeletonComponent
    ? Array.from({length: skeletonCount ?? 8}, (_, index) => {
        const Skeleton = skeletonComponent;
        return <Skeleton key={`skeleton-${index}`} />;
      })
    : null;

  const content = (
    <>
      {showSkeletons ? (
        skeletons
      ) : (
        <>
          {resourcesMarkup}
          {showLoadingMoreSkeletons && skeletonComponent && (
            <div className="loading-more-skeletons">
              {Array.from({length: Math.min(skeletonCount ?? 8, 8)}, (_, index) => {
                const Skeleton = skeletonComponent;
                return <Skeleton key={`loading-skeleton-${index}`} />;
              })}
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <div>
      {resourcesClassName ? (
        <div className={resourcesClassName}>{content}</div>
      ) : (
        content
      )}
      {hasNextPage && (
        <div className="text-center">
          <Link to={withLocale(nextPageUrl)} preventScrollReset replace>
            {isLoading ? 'Loading...' : <Button variant="primary" className='w-full max-w-[450px] mx-auto'>Load more ↓</Button>}
          </Link>
        </div>
      )}
    </div>
  );
}
