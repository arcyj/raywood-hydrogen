import {useCallback, useEffect, useMemo, useState} from 'react';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { Slider } from './Slider';
import type { EmblaCarouselType } from 'embla-carousel';
import { Image } from '@shopify/hydrogen';
import type { ProductFragment } from 'storefrontapi.generated';

export function ProductGallery({
  media,
  selectedImage,
}: {
  media: ProductFragment['media']['nodes'];
  selectedImage?: NonNullable<ProductFragment['selectedOrFirstAvailableVariant']>['image'] | null;
}) {
  const [thumbsApi, setThumbsApi] = useState<EmblaCarouselType | null>(null);
  const [mainApi, setMainApi] = useState<EmblaCarouselType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedMainImages, setLoadedMainImages] = useState<Record<string, boolean>>({});
  const {isDesktop} = useBreakpoints();

  const markMainImageLoaded = useCallback((id: string) => {
    setLoadedMainImages((prev) => (prev[id] ? prev : {...prev, [id]: true}));
  }, []);

  useEffect(() => {
    if (!thumbsApi) {
      return;
    }
    thumbsApi.scrollTo(activeIndex);
  }, [thumbsApi, activeIndex]);

  const imageMediaItems = useMemo(
    () =>
      media.filter(
        (m): m is Extract<typeof m, { __typename: 'MediaImage' }> =>
          m.__typename === 'MediaImage' && !!m.image,
      ),
    [media],
  );

  useEffect(() => {
    if (!mainApi || !selectedImage) return;

    const selectedImageId = selectedImage.id;
    const selectedImageUrl = selectedImage.url;
    const selectedImageIndex = imageMediaItems.findIndex(
      (mediaItem) =>
        mediaItem.image?.id === selectedImageId ||
        mediaItem.image?.url === selectedImageUrl,
    );

    if (
      selectedImageIndex >= 0 &&
      selectedImageIndex !== mainApi.selectedScrollSnap()
    ) {
      mainApi.scrollTo(selectedImageIndex);
      setActiveIndex(selectedImageIndex);
    }
  }, [mainApi, selectedImage, imageMediaItems]);

  if (!media || media.length === 0) {
    return null;
  }

  const mainSlides = imageMediaItems.map((mediaItem) => {
      const isLoaded = !!loadedMainImages[mediaItem.id];
      return (
        <div
          className={`product-gallery-main-slide bg-lightGrey ${isLoaded ? '' : 'product-gallery-main-slide--loading'}`}
          key={mediaItem.id}
        >
          {!isLoaded && <div className="product-gallery-main-slide-skeleton" aria-hidden="true" />}
          <Image
            alt={mediaItem.image!.altText || 'Product Image'}
            data={mediaItem.image!}
            sizes="600px"
            loading="lazy"
            onLoad={() => markMainImageLoaded(mediaItem.id)}
            className={`product-gallery-main-image mix-blend-darken h-full w-full object-contain ${isLoaded ? 'is-loaded' : ''}`}
          />
        </div>
      );
    });

  const thumbSlides = imageMediaItems.map((mediaItem, index) => (
      <button
        type="button"
        onClick={() => mainApi?.scrollTo(index)}
        className={`product-gallery-thumb-slide bg-lightGrey rounded-lg ${activeIndex === index ? 'ring-2 ring-black' : ''}`}
        key={mediaItem.id}
        aria-label={`View image ${index + 1}`}
      >
        <Image
          alt={mediaItem.image!.altText || 'Product Thumbnail'}
          data={mediaItem.image!}
          loading="lazy"
          className="mix-blend-darken"
          sizes="100px"
          height="120px"
          width="auto"
        />
      </button>
    ));

  return (
    <div className="tablet:rounded-lg product-gallery product-gallery-slide-in">
      <div className="">
        {/* {isDesktop && media.length > 1 && (
          <div className="col-span-1 min-h-0 flex flex-col overflow-hidden product-gallery-thumbs-wrap order-1">
            <Slider
              className="product-gallery-thumbs-vertical rounded mix-blend-darken mr-8"
              settings={{
                ref: setThumbsApi,
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
        )} */}

        {/* Main gallery - Slider with Thumbs sync */}
        <div
          className={`rounded-lg min-h-0 order-2 overflow-hidden ${
            media.length > 1 ? 'col-span-8 tablet:col-span-8' : 'col-span-8'
          }`}
        >
          <Slider
            className={`product-gallery-main mix-blend-darken min-h-0 ${
              media.length > 1 ? 'product-gallery-main--peek-mobile' : ''
            }`}
            settings={{
              ref: setMainApi,
              afterChange: setActiveIndex,
              arrows: isDesktop ? true : false,
              dots: false,
              slidesToScroll: 1,
              slidesToShow: media.length > 1 ? 'auto' : 1,
              spaceBetween: 8,
              loop: true,
            }}
          >
            {mainSlides}
          </Slider>
        </div>
      </div>
    </div>
  );
}
