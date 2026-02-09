import {redirect, useLoaderData, Link} from 'react-router';
import type { CollectionQuery } from 'storefrontapi.generated';
import { Slider } from '~/components/Slider';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import type { FC } from 'react';
import {useLocalizedPath} from '~/hooks/useLocalePath';

interface IChildCollectionSlider {
  className?: string;
}

export const ChildCollectionSlider: FC<IChildCollectionSlider> = ({className}) => {
  const breakpoints = useBreakpoints();
  const { isMobile } = breakpoints;
  const withLocale = useLocalizedPath();

  const {childCollections} = useLoaderData<
      CollectionQuery & {
        childCollections: Array<{ id: string; handle: string; title: string; image:{url: string} }>;
      }
    >();
  return (
    <>
      {childCollections && childCollections.length > 0 && (
        <div className={className}>
          <Slider
            settings={{
              slidesToShow: 'auto',
              spaceBetween: 8,
              dots: false,
              arrows: isMobile ? false : true,
            }}
          >
            {childCollections.map((childCollection) => (
              <Link
                key={childCollection.id}
                to={withLocale(`/collections/${childCollection.handle}`)}
                className="group"
              >
                <div className="border-accentGrey border-[1.5px] py-8 px-24 rounded flex items-center hover:bg-lightGrey hover:shadow-lg active:bg-accentGrey active:inset-shadow-sm transition-all duration-200 ease-in-out">
                  <div className="pr-16">
                    {childCollection.image && (
                      <img
                        src={childCollection.image.url}
                        alt={childCollection.title}
                        className="h-48"
                        width="100%"
                        height="48px"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-medium-semi">{childCollection.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </Slider>
        </div>
      )}
    </>
  );
}
