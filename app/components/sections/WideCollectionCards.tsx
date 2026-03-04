import {Await, Link} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {FC} from 'react';
import {useLocalizedPath} from '~/hooks/useLocalePath';
import type {CollectionCardData} from '~/components/sections/CollectionCards';

interface IWideCollectionCardsProps {
  collections: Promise<CollectionCardData[] | null>;
  className?: string;
  gridClassName?: string;
}

export const WideCollectionCards: FC<IWideCollectionCardsProps> = ({
  collections,
  className = '',
  gridClassName = '',
}) => {


  return (
    <Suspense
      fallback={<div className="h-[50px] bg-lightGrey rounded animate-pulse" />}
    >
      <Await resolve={collections}>
        {(response) => {
          const collections = response;
          if (!collections || collections.length === 0) {
            return null;
          }
          return (
            <div className={className}>
              <div
                className={`gap-12 grid grid-rows-3 rounded-lg  ${gridClassName}`}
              >
                {collections.map((collection) => (
                  <WideCollectionCard
                    key={collection.id}
                    collection={collection}
                  />
                ))}
              </div>
            </div>
          );
        }}
      </Await>
    </Suspense>
  );
};

function WideCollectionCard({collection}: {collection: CollectionCardData}) {
  const withLocale = useLocalizedPath();
  return (
    <Link
      to={withLocale(`/collections/${collection.handle}`)}
      className="block bg-lightGrey hover:scale-102 transition-all hover:drop-shadow-md rounded-lg overflow-hidden hover:shadow-lg active:bg-accentGrey active:inset-shadow-sm transition-all duration-200 ease-in-out"
      prefetch="intent"
    >
      {collection.image?.url && (
        <div className="p-24 flex items-center h-full gap-24">
          <Image
            alt={collection.image.altText || collection.title}
            data={collection.image}
            width="110px"
            loading="lazy"
          />
          <div className="flex flex-col text-left">
            <span className="text-regular-semi">{collection.title}</span>
            {collection.shortDescription ? (
              <span className="text-small text-grey mt-4">
                {collection.shortDescription}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </Link>
  );
}
