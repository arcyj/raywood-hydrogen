import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {FC} from 'react';
import {useLocalizedPath} from '~/hooks/useLocalePath';

export type CollectionCardData = {
  id: string;
  title: string;
  handle: string;
  shortDescription?: string | null;
  image?: {
    id?: string;
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  } | null;
};

interface ICollectionCardsProps {
  collections: CollectionCardData[];
  className?: string;
  gridClassName?: string;
}

export const CollectionCards: FC<ICollectionCardsProps> = ({
  collections,
  className = '',
  gridClassName = '',
}) => {
  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div
        className={`grid grid-rows-3 grid-cols-2 gap-12 rounded-lg  ${gridClassName}`}
      >
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
};

function CollectionCard({collection}: {collection: CollectionCardData}) {
  const withLocale = useLocalizedPath();
  return (
    <Link
      to={withLocale(`/collections/${collection.handle}`)}
      className="block bg-lightGrey hover:scale-102 transition-all hover:drop-shadow-md rounded-lg overflow-hidden hover:shadow-lg active:bg-accentGrey active:inset-shadow-sm transition-all duration-200 ease-in-out"
      prefetch="intent"
    >
      {collection.image?.url && (
        <div className="text-center p-24 flex items-center justify-center h-full">
          <Image
            alt={collection.image.altText || collection.title}
            data={collection.image}
            width="100%"
            loading="lazy"
          />
        </div>
      )}
    </Link>
  );
}
