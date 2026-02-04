import {useState} from 'react';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { Slider } from './Slider';
import { Navigation, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Image } from '@shopify/hydrogen';
import type { ProductFragment } from 'storefrontapi.generated';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

export function ProductGallery({
  media,
}: {
  media: ProductFragment['media']['nodes'];
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const isDesktop = useBreakpoints().isDesktop;

  if (!media || media.length === 0) {
    return null;
  }

  const mainSlides = media
    .filter((m): m is Extract<typeof m, { __typename: 'MediaImage' }> => m.__typename === 'MediaImage' && !!m.image)
    .map((mediaItem) => (
      <div className="product-gallery-main-slide" key={mediaItem.id}>
        <Image
          alt={mediaItem.image!.altText || 'Product Image'}
          aspectRatio="1/1"
          data={mediaItem.image!}
          sizes="400px"
          width="auto"
          height="auto"
        />
      </div>
    ));

  const thumbSlides = media
    .filter((m): m is Extract<typeof m, { __typename: 'MediaImage' }> => m.__typename === 'MediaImage' && !!m.image)
    .map((mediaItem) => (
      <div className="product-gallery-thumb-slide bg-lightGrey rounded-lg" key={mediaItem.id}>
        <Image
          alt={mediaItem.image!.altText || 'Product Thumbnail'}
          data={mediaItem.image!}
          className="mix-blend-darken"
          sizes="100px"
          height="120px"
          width="auto"
        />
      </div>
    ));

  return (
    <div className="-mx-12 pb-12 tablet:rounded-lg product-gallery product-gallery-slide-in">
      <div className="grid grid-cols-8 product-gallery-grid">
        {/* Thumbnails first in tree so thumbsSwiper is set before main Slider mounts */}
        {isDesktop && media.length > 1 && (
          <div className="col-span-1 min-h-0 flex flex-col overflow-hidden product-gallery-thumbs-wrap order-1">
            <Slider
              className="product-gallery-thumbs-vertical rounded mix-blend-darken h-full min-h-0 mr-8"
              settings={{
                ref: setThumbsSwiper,
                direction: 'vertical',
                slidesToShow: 5,
                spaceBetween: 8,
                dots: false,
                arrows: true,
              }}
            >
              {thumbSlides}
            </Slider>
          </div>
        )}

        {/* Main gallery - Slider with Thumbs sync */}
        <div
          className={`bg-lightGrey rounded-lg min-h-0 order-2 overflow-hidden flex flex-col ${
            media.length > 1 ? 'col-span-8 tablet:col-span-7' : 'col-span-8'
          }`}
        >
          <Slider
            className="product-gallery-main mix-blend-darken h-full min-h-0"
            settings={{
              modules: [Navigation, Thumbs],
              thumbs: {
                swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              },
              arrows: true,
              dots: false,
              slidesToScroll: 1,
              slidesToShow: 1,
              spaceBetween: 10,
            }}
          >
            {mainSlides}
          </Slider>
        </div>
      </div>
    </div>
  );
}
