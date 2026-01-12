import {useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import {Navigation, Thumbs, FreeMode} from 'swiper/modules';
import type {Swiper as SwiperType} from 'swiper';
import {Image} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

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

  return (
    <div className=" bg-lightGrey -mx-12 pb-12 tablet:rounded-lg">
      {/* Main Swiper */}
      <Swiper
        modules={[Navigation, Thumbs]}
        navigation={{ nextEl: ".arrow-left", prevEl: ".arrow-right" }}
        spaceBetween={10}
        thumbs={{swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null}}
        className="product-gallery-main mix-blend-darken"
      >
        {media.map((mediaItem) => {
          if (mediaItem.__typename === 'MediaImage' && mediaItem.image) {
            return (
              <SwiperSlide key={mediaItem.id}>
                <div className="product-gallery-main-slide">
                  <Image
                    alt={mediaItem.image.altText || 'Product Image'}
                    aspectRatio="1/1"
                    data={mediaItem.image}
                    sizes="400px"
                  />
                </div>
              </SwiperSlide>
            );
          }
          return null;
        })}
      </Swiper>

      {/* Thumbnails Swiper */}
      {isDesktop && media.length > 1 && (
        <Swiper
          modules={[FreeMode, Navigation, Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          className="product-gallery-thumbs rounded mix-blend-darken"
        >
          {media.map((mediaItem) => {
            if (mediaItem.__typename === 'MediaImage' && mediaItem.image) {
              return (
                <SwiperSlide key={mediaItem.id}>
                  <div className="product-gallery-thumb-slide">
                    <Image
                      alt={mediaItem.image.altText || 'Product Thumbnail'}
                      aspectRatio="1/1"
                      data={mediaItem.image}
                      sizes="70px"
                    />
                  </div>
                </SwiperSlide>
              );
            }
            return null;
          })}
        </Swiper>
      )}
    </div>
  );
}
