import { useRef, useMemo, forwardRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from './icons';
import type { Swiper as SwiperType } from 'swiper';
import type { SwiperOptions } from 'swiper/types';
import type { FC, ReactNode } from 'react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { IconButton } from './ui/IconButton';

interface INavArrowProps {
  onClick?(): void;
  disabled?: boolean;
  className?: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClassName?: string;
}

const NextArrow = forwardRef<HTMLButtonElement, INavArrowProps>(
  ({ onClick, disabled, className, Icon, iconClassName }, ref) => {
    const IconWithClass = iconClassName
      ? (p: { size?: number; className?: string }) => <Icon {...p} className={[p.className, iconClassName].filter(Boolean).join(' ')} />
      : Icon;
    return (
      <IconButton
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={className ?? 'absolute top-1/2 right-12 -translate-y-1/2 z-2 bg-none border-none p-0 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:hidden'}
        aria-label="Next slide"
        Icon={IconWithClass as Parameters<typeof IconButton>[0]['Icon']}
      />
    );
  },
);

NextArrow.displayName = 'NextArrow';

const PrevArrow = forwardRef<HTMLButtonElement, INavArrowProps>(
  ({ onClick, disabled, className, Icon, iconClassName }, ref) => {
    const IconWithClass = iconClassName
      ? (p: { size?: number; className?: string }) => <Icon {...p} className={[p.className, iconClassName].filter(Boolean).join(' ')} />
      : Icon;
    return (
      <IconButton
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={className ?? 'absolute top-1/2 left-12 -translate-y-1/2 z-2 bg-none border-none p-0 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:hidden'}
        aria-label="Previous slide"
        Icon={IconWithClass as Parameters<typeof IconButton>[0]['Icon']}
      />
    );
  },
);

PrevArrow.displayName = 'PrevArrow';

// Map react-slick Settings to Swiper options
interface SwiperSettings extends Omit<SwiperOptions, 'modules' | 'navigation' | 'pagination' | 'onSlideChangeTransitionStart' | 'onSlideChangeTransitionEnd'> {
  slidesToShow?: number | 'auto';
  slidesToScroll?: number;
  dots?: boolean;
  arrows?: boolean;
  speed?: number;
  responsive?: Array<{
    breakpoint: number;
    settings: Partial<SwiperSettings>;
  }>;
  beforeChange?: (currentSlide: number, nextSlide: number) => void;
  afterChange?: (currentSlide: number) => void;
  adaptiveHeight?: boolean;
  ref?: React.Ref<SwiperType>;
  /** Pass Swiper modules (e.g. Thumbs) and options when using thumbs or other modules */
  modules?: SwiperOptions['modules'];
  thumbs?: SwiperOptions['thumbs'];
}

const defaults: Partial<SwiperSettings> = {
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
  dots: true,
  speed: 500,
  responsive: [],
};

export interface ICarouselProps {
  className?: string;
  settings?: SwiperSettings;
  display?: string;
  withoutScale?: boolean;
  children?: ReactNode;
}

export const Slider: FC<ICarouselProps> = ({ children, className = '', ...props }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const navigationPrevRef = useRef<HTMLButtonElement>(null);
  const navigationNextRef = useRef<HTMLButtonElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  const carouselProps = { ...defaults, ...props.settings };

  // Initialize navigation after mount
  useEffect(() => {
    if (swiperRef.current && carouselProps.arrows !== false && swiperRef.current.navigation) {
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, [carouselProps.arrows]);

  // Convert react-slick settings to Swiper options
  const swiperOptions = useMemo(() => {
    const modules = [];
    if (carouselProps.arrows !== false) {
      modules.push(Navigation);
    }
    if (carouselProps.dots !== false) {
      modules.push(Pagination);
    }

    const options: SwiperOptions = {
      modules,
      speed: carouselProps.speed || 500,
      slidesPerView: carouselProps.slidesToShow === 'auto' ? 'auto' : (carouselProps.slidesToShow || 1),
      slidesPerGroup: carouselProps.slidesToScroll || 1,
      spaceBetween: 0,
    };

    // Add navigation if arrows are enabled
    if (carouselProps.arrows !== false) {
      options.navigation = {
        prevEl: navigationPrevRef.current,
        nextEl: navigationNextRef.current,
      };
    }

    // Add pagination if dots are enabled
    if (carouselProps.dots !== false) {
      options.pagination = {
        el: paginationRef.current,
        clickable: true,
        bulletClass: 'swiper-pagination-bullet',
        bulletActiveClass: 'swiper-pagination-bullet-active',
        renderBullet: (index: number, className: string) => {
          return `<div class="${className}"></div>`;
        },
      };
    }

    // Handle responsive breakpoints
    if (carouselProps.responsive && carouselProps.responsive.length > 0) {
      options.breakpoints = {};
      carouselProps.responsive.forEach(({ breakpoint, settings }) => {
        const key = breakpoint.toString();
        options.breakpoints![key] = {
          slidesPerView: settings.slidesToShow === 'auto' ? 'auto' : (settings.slidesToShow || options.slidesPerView),
          slidesPerGroup: settings.slidesToScroll || options.slidesPerGroup,
        };
      });
    }

    // Handle adaptiveHeight (autoHeight in Swiper)
    if (carouselProps.adaptiveHeight) {
      options.autoHeight = true;
    }

    // Merge any additional Swiper-specific options
    const { slidesToShow, slidesToScroll, dots, arrows, responsive, beforeChange, afterChange, adaptiveHeight, ref, ...rest } = carouselProps;
    return { ...options, ...rest };
  }, [carouselProps]);

  // Convert children to SwiperSlides
  const slides = useMemo(() => {
    if (!children) return [];
    const childrenArray = Array.isArray(children) ? children : [children];
    const isAutoWidth = carouselProps.slidesToShow === 'auto';
    return childrenArray.filter(Boolean).map((child, index) => (
      <SwiperSlide key={index} style={isAutoWidth ? { width: 'auto' } : undefined}>
        {child as ReactNode}
      </SwiperSlide>
    ));
  }, [children, carouselProps.slidesToShow]);

  // Handle callbacks
  const handleSlideChangeTransitionStart = (swiper: SwiperType) => {
    if (carouselProps.beforeChange) {
      carouselProps.beforeChange(swiper.previousIndex, swiper.activeIndex);
    }
  };

  const handleSlideChangeTransitionEnd = (swiper: SwiperType) => {
    if (carouselProps.afterChange) {
      carouselProps.afterChange(swiper.activeIndex);
    }
  };

  const wrapperClassName = useMemo(() => {
    const classes = ['relative', className];
    if (props.display) {
      classes.push(`[&_.swiper-wrapper]:${props.display === 'flex' ? 'flex' : props.display}`);
    }
    if (!props.withoutScale) {
      classes.push('[&_.swiper-slide]:scale-100');
    }
    return classes.join(' ');
  }, [className, props.display, props.withoutScale]);

  const isVertical = carouselProps.direction === 'vertical';
  const prevArrowClassName = isVertical
    ? 'absolute top-0 left-1/2 -translate-x-1/2 z-2 bg-none border-none p-0 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:hidden'
    : undefined;
  const nextArrowClassName = isVertical
    ? 'absolute bottom-0 left-1/2 -translate-x-1/2 z-2 bg-none border-none p-0 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:hidden'
    : undefined;
  const prevIconClassName = isVertical ? 'rotate-90' : undefined;
  const nextIconClassName = isVertical ? '-rotate-90' : undefined;

  return (
    <div className={wrapperClassName}>
      {carouselProps.arrows !== false && (
        <>
          <PrevArrow
            ref={navigationPrevRef}
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={swiperRef.current?.isBeginning}
            className={prevArrowClassName}
            Icon={ChevronLeft as INavArrowProps['Icon']}
            iconClassName={prevIconClassName}
          />
          <NextArrow
            ref={navigationNextRef}
            onClick={() => swiperRef.current?.slideNext()}
            disabled={swiperRef.current?.isEnd}
            className={nextArrowClassName}
            Icon={ChevronRight as INavArrowProps['Icon']}
            iconClassName={nextIconClassName}
          />
        </>
      )}
      <Swiper
        {...swiperOptions}
        className='h-full'
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          // Handle ref if provided
          if (carouselProps.ref && typeof carouselProps.ref === 'function') {
            carouselProps.ref(swiper);
          } else if (carouselProps.ref && 'current' in carouselProps.ref) {
            (carouselProps.ref as React.MutableRefObject<SwiperType | null>).current = swiper;
          }
        }}
        onSlideChangeTransitionStart={handleSlideChangeTransitionStart}
        onSlideChangeTransitionEnd={handleSlideChangeTransitionEnd}
        onSlideChange={(swiper) => {
          // Update button disabled states
          if (carouselProps.arrows !== false) {
            const prevButton = navigationPrevRef.current;
            const nextButton = navigationNextRef.current;
            if (prevButton) {
              prevButton.disabled = swiper.isBeginning;
            }
            if (nextButton) {
              nextButton.disabled = swiper.isEnd;
            }
          }
        }}
      >
        {slides}
      </Swiper>
      {carouselProps.dots !== false && <div ref={paginationRef} className="swiper-pagination" />}
    </div>
  );
};
