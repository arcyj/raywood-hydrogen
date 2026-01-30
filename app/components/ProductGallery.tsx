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
    <div className="-mx-12 pb-12 tablet:rounded-lg">
      {/* Main Swiper */}
      <div className="bg-lightGrey rounded-lg">
        <Swiper
          modules={[Navigation, Thumbs]}
          navigation={{ nextEl: ".arrow-left", prevEl: ".arrow-right" }}
          spaceBetween={10}
          thumbs={{swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null}}
          className="product-gallery-main mix-blend-darken "
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
                      width="auto"
                      height="auto"
                    />
                  </div>
                </SwiperSlide>
              );
            }
            return null;
          })}
        </Swiper>
      </div>

      {/* Thumbnails Swiper */}
      {isDesktop && media.length > 1 && (
        <Swiper
          modules={[FreeMode, Navigation, Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={5}
          slidesPerView={6}
          freeMode={true}
          watchSlidesProgress={true}
          className="product-gallery-thumbs rounded mix-blend-darken"
        >
          {media.map((mediaItem) => {
            if (mediaItem.__typename === 'MediaImage' && mediaItem.image) {
              return (
                <SwiperSlide key={mediaItem.id}>
                  <div className="product-gallery-thumb-slide bg-lightGrey rounded-lg">
                    <Image
                      alt={mediaItem.image.altText || 'Product Thumbnail'}
                      data={mediaItem.image}
                      className='mix-blend-darken'
                      sizes='100px'
                      height="90px"
                      width="auto"
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
