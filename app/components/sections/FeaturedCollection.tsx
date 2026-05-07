import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {useLocalizedPath} from '~/hooks/useLocalePath';
import { ButtonLink } from '../ui/Link';
import { ArrowRight } from 'lucide-react';
import { Slider } from '../Slider';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import type {FeaturedCollectionData} from '~/lib/queries/collections';

interface IFeaturedCollectionProps {
  collections: Promise<FeaturedCollectionData[]> | FeaturedCollectionData[];
  className?: string;
}

export const FeaturedCollection = ({
  collections,
  className = '',
}: IFeaturedCollectionProps) => {
  return (
    <Suspense fallback={<FeaturedCollectionSkeleton className={className} />}>
      <Await resolve={Promise.resolve(collections)}>
        {(resolvedCollections) => {
          console.log({resolvedCollections})
          if (!resolvedCollections?.length) return null;

          return (
            <div className={className}>
              <div className="space-y-12 grid grid-cols-2">
                {resolvedCollections.map((collection) => (
                  <FeaturedCollectionSection
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

function FeaturedCollectionSection({
  collection,
}: {
  collection: FeaturedCollectionData;
}) {
  const withLocale = useLocalizedPath();
  const collectionUrl = withLocale(`/collections/${collection.handle}`);
  const { isDesktop } = useBreakpoints();
  return (
    <article className="">
      <header className="flex flex-row items-center gap-16 tablet:gap-24 mb-16">
        {collection.image?.url && (
          <div className="w-[80px] tablet:w-[120px] p-12">
            <Image
              alt={collection.image.altText || collection.title}
              data={collection.image}
              loading="lazy"
              width="100%"
            />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-regular-semi mb-2">{collection.title}</h2>
          <Link
            to={collectionUrl}
            className="text-medium-semi"
            prefetch="intent"
          >
            View collection
          </Link>
        </div>
      </header>

      <div className="space-y-12">
        {collection.childCollections.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-8">
              {collection.childCollections.map((childCollection) => (
                <ButtonLink
                  key={childCollection.id}
                  href={withLocale(`/collections/${childCollection.handle}`)}
                  className="transition-colors"
                  prefetch="intent"
                  IconAfter={ArrowRight}
                  variant="secondary"
                  size="small"
                >
                  {childCollection.title}
                </ButtonLink>
              ))}
            </div>
          </div>
        )}

        {collection.featuredExpansions.length > 0 && (
          <div>
            <div className="">
              {!isDesktop ? (
                <Slider
                  settings={{
                    slidesToShow: 'auto',
                    spaceBetween: 8,
                    dots: false,
                    arrows: false,
                    options: {
                      active: false,
                    },
                  }}
                >
                  {collection.featuredExpansions.map((expansion) => (
                    <Link
                      key={expansion.id}
                      to={`${collectionUrl}?${getExpansionFilterParam(expansion.id)}`}
                      className="flex mix-blend-darken items-center gap-4 rounded-full bg-lightGrey p-4 hover:bg-accentGrey transition-colors"
                      prefetch="intent"
                    >
                      {expansion.image?.url && (
                        <Image
                          src={expansion.image.url}
                          // aspectRatio="1/1"
                          alt={expansion.image.altText || expansion.title}
                          width="40px"
                          sizes="50"
                          className="rounded object-contain mr-8"
                          loading="lazy"
                        />
                      )}
                      <span className="text-small text-nowrap">
                        {expansion.title}
                      </span>
                    </Link>
                  ))}
                </Slider>
              ) : (
                <div className="flex flex-wrap gap-8">
                  {collection.featuredExpansions.map((expansion) => (
                    <Link
                      key={expansion.id}
                      to={`${collectionUrl}?${getExpansionFilterParam(expansion.id)}`}
                      className="flex mix-blend-darken items-center gap-4 rounded-full bg-lightGrey p-4 hover:bg-accentGrey transition-colors"
                      prefetch="intent"
                    >
                      {expansion.image?.url && (
                        <Image
                          src={expansion.image.url}
                          // aspectRatio="1/1"
                          alt={expansion.image.altText || expansion.title}
                          width="40px"
                          sizes="50"
                          className="rounded object-contain mr-8"
                          loading="lazy"
                        />
                      )}
                      <span className="text-small text-nowrap">
                        {expansion.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function getExpansionFilterParam(expansionId: string) {
  const params = new URLSearchParams();
  params.set(
    'filter.productMetafield',
    JSON.stringify({
      namespace: 'custom',
      key: 'expansions',
      value: expansionId,
    }),
  );
  return params.toString();
}

function FeaturedCollectionSkeleton({className = ''}: {className?: string}) {
  return (
    <div className={className}>
      <div className="space-y-12 animate-pulse">
        {Array.from({length: 2}).map((_, index) => (
          <div
            key={`featured-collection-skeleton-${index}`}
            className="rounded-lg border border-lightGrey p-16 tablet:p-24 bg-white"
          >
            <div className="flex flex-col tablet:flex-row tablet:items-center gap-16 mb-16">
              <div className="w-full tablet:w-[220px] h-[120px] rounded bg-lightGrey" />
              <div className="flex-1 space-y-8">
                <div className="h-20 rounded bg-lightGrey w-2/3" />
                <div className="h-16 rounded bg-lightGrey w-1/3" />
              </div>
            </div>
            <div className="space-y-10">
              <div className="h-16 rounded bg-lightGrey w-40" />
              <div className="grid grid-cols-2 tablet:grid-cols-4 gap-8">
                {Array.from({length: 4}).map((__, chipIndex) => (
                  <div
                    key={`featured-collection-chip-${chipIndex}`}
                    className="h-28 rounded bg-lightGrey"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
