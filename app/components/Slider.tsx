import { Children, useRef, useMemo, useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from './icons';
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import Autoplay from 'embla-carousel-autoplay'
import type { MutableRefObject } from 'react';
import type { FC, ReactNode } from 'react';

import { IconButton } from './ui/IconButton';

interface INavArrowProps {
  onClick?(): void;
  disabled?: boolean;
  className?: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClassName?: string;
}

function NextArrow({ onClick, disabled, className, Icon, iconClassName }: INavArrowProps) {
  const IconWithClass = iconClassName
    ? (p: { size?: number; className?: string }) => <Icon {...p} className={[p.className, iconClassName].filter(Boolean).join(' ')} />
    : Icon;
  return (
    <IconButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className ?? 'absolute top-1/2 right-12 -translate-y-1/2 z-2 bg-white border-none p-0 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:hidden'}
      aria-label="Next slide"
      Icon={IconWithClass as Parameters<typeof IconButton>[0]['Icon']}
      variant="round"
    />
  );
}

function PrevArrow({ onClick, disabled, className, Icon, iconClassName }: INavArrowProps) {
  const IconWithClass = iconClassName
    ? (p: { size?: number; className?: string }) => <Icon {...p} className={[p.className, iconClassName].filter(Boolean).join(' ')} />
    : Icon;
  return (
    <IconButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant="round"
      className={className ?? 'absolute top-1/2 left-12 -translate-y-1/2 z-2 bg-white border-none p-0 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:hidden'}
      aria-label="Previous slide"
      Icon={IconWithClass as Parameters<typeof IconButton>[0]['Icon']}
    />
  );
}

interface EmblaSettings {
  options?: EmblaOptionsType;
  plugins?: EmblaPluginType[];
  slidesToShow?: number | 'auto';
  slidesToScroll?: number;
  dots?: boolean;
  arrows?: boolean;
  speed?: number;
  spaceBetween?: number;
  direction?: 'horizontal' | 'vertical';
  loop?: boolean;
  autoplay?: boolean;
  beforeChange?: (currentSlide: number, nextSlide: number) => void;
  afterChange?: (currentSlide: number) => void;
  adaptiveHeight?: boolean;
  ref?: React.Ref<EmblaCarouselType>;
}

const defaults: Partial<EmblaSettings> = {
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
  dots: true,
  speed: 25,
  spaceBetween: 0,
  direction: 'horizontal',
  loop: false,
  autoplay: false,
};

export interface ICarouselProps {
  className?: string;
  settings?: EmblaSettings;
  display?: string;
  withoutScale?: boolean;
  fadeUnderArrows?: boolean;
  children?: ReactNode;
}

export const Slider: FC<ICarouselProps> = ({ children, className = '', ...props }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const previousIndexRef = useRef(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const settings = useMemo(
    () => ({ ...defaults, ...props.settings }),
    [props.settings],
  );
  const isVertical = settings.direction === 'vertical';

  const emblaOptions = useMemo<EmblaOptionsType>(
    () => {
      const baseOptions: EmblaOptionsType = {
        align: 'start',
        axis: isVertical ? 'y' : 'x',
        containScroll: 'trimSnaps',
        dragFree: settings.slidesToShow === 'auto',
        loop: settings.loop ?? false,
        slidesToScroll: settings.slidesToScroll ?? 1,
        duration: settings.speed ?? 25,
      };

      return {
        ...baseOptions,
        ...settings.options,
      };
    },
    [
      settings.options,
      isVertical,
      settings.slidesToShow,
      settings.loop,
      settings.slidesToScroll,
      settings.speed,
    ],
  );

  const emblaPlugins = useMemo<EmblaPluginType[]>(
    () => [...(settings.plugins ?? []), WheelGesturesPlugin(), Autoplay({ active: settings.autoplay, delay: 3000 })],
    [settings.plugins],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, emblaPlugins);

  const setApiRef = useCallback(
    (api: EmblaCarouselType | null) => {
      if (!settings.ref) return;
      if (typeof settings.ref === 'function') {
        settings.ref(api);
      } else if ('current' in settings.ref) {
        (settings.ref as MutableRefObject<EmblaCarouselType | null>).current = api;
      }
    },
    [settings.ref],
  );

  const updateControls = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
    setScrollSnaps(api.scrollSnapList());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => {
      const currentIndex = emblaApi.selectedScrollSnap();
      const previousIndex = previousIndexRef.current;
      if (currentIndex !== previousIndex && settings.beforeChange) {
        settings.beforeChange(previousIndex, currentIndex);
      }
      settings.afterChange?.(currentIndex);
      previousIndexRef.current = currentIndex;
      updateControls(emblaApi);
    };

    previousIndexRef.current = emblaApi.selectedScrollSnap();
    updateControls(emblaApi);
    settings.afterChange?.(previousIndexRef.current);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    setApiRef(emblaApi);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
      setApiRef(null);
    };
  }, [
    emblaApi,
    settings.beforeChange,
    settings.afterChange,
    updateControls,
    setApiRef,
  ]);

  useEffect(() => {
    if (!emblaApi || !settings.adaptiveHeight || !viewportRef.current) {
      return;
    }

    const updateHeight = () => {
      const index = emblaApi.selectedScrollSnap();
      const activeSlide = emblaApi.slideNodes()[index] as HTMLElement | undefined;
      if (activeSlide) {
        viewportRef.current!.style.height = `${activeSlide.offsetHeight}px`;
      }
    };

    updateHeight();
    emblaApi.on('select', updateHeight);
    emblaApi.on('reInit', updateHeight);
    window.addEventListener('resize', updateHeight);

    return () => {
      emblaApi.off('select', updateHeight);
      emblaApi.off('reInit', updateHeight);
      window.removeEventListener('resize', updateHeight);
    };
  }, [emblaApi, settings.adaptiveHeight]);

  const { autoplayIsPlaying, toggleAutoplay, onAutoplayButtonClick } = useAutoplay(emblaApi)

  const wrapperClassName = useMemo(() => {
    const classes = ['embla', 'relative', className];
    if (props.display) {
      classes.push(`[&_.embla__container]:${props.display === 'flex' ? 'flex' : props.display}`);
    }
    if (!props.withoutScale) {
      classes.push('[&_.embla__slide]:scale-100');
    }
    return classes.join(' ');
  }, [className, props.display, props.withoutScale]);

  const prevArrowClassName = isVertical
    ? 'absolute top-0 left-1/2 -translate-x-1/2 z-2 bg-white border-none p-0 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:hidden'
    : undefined;
  const nextArrowClassName = isVertical
    ? 'absolute bottom-0 left-1/2 -translate-x-1/2 z-2 bg-white border-none p-0 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:hidden'
    : undefined;
  const prevIconClassName = isVertical ? 'rotate-90' : undefined;
  const nextIconClassName = isVertical ? 'rotate-90' : undefined;
  const isAutoWidth = settings.slidesToShow === 'auto';
  const slidesToShow = isAutoWidth ? 1 : Math.max(1, Number(settings.slidesToShow ?? 1));
  const gap = settings.spaceBetween ?? 0;
  const childNodes = Children.toArray(children).filter(Boolean);
  const slideBasis = isAutoWidth
    ? 'auto'
    : `calc((100% - ${(slidesToShow - 1) * gap}px) / ${slidesToShow})`;

  return (
    <div className={wrapperClassName}>
      {settings.arrows !== false && (
        <>
          {props.fadeUnderArrows && !isVertical && canScrollPrev && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-1 w-44 bg-gradient-to-r from-white to-transparent"
            />
          )}
          {props.fadeUnderArrows && !isVertical && canScrollNext && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-1 w-44 bg-gradient-to-l from-white to-transparent"
            />
          )}
          <PrevArrow
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className={prevArrowClassName}
            Icon={ChevronLeft as INavArrowProps['Icon']}
            iconClassName={prevIconClassName}
          />
          <NextArrow
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className={nextArrowClassName}
            Icon={ChevronRight as INavArrowProps['Icon']}
            iconClassName={nextIconClassName}
          />
        </>
      )}
      <div
        ref={(node) => {
          viewportRef.current = node;
          emblaRef(node);
        }}
        className="embla__viewport h-full"
      >
        <div
          className="embla__container h-full"
          style={{
            display: 'flex',
            flexDirection: isVertical ? 'column' : 'row',
            gap: `${gap}px`,
          }}
        >
          {childNodes.map((child, index) => (
            <div
              key={index}
              className="embla__slide"
              style={{
                flex: isAutoWidth ? '0 0 auto' : `0 0 ${slideBasis}`,
                width: isAutoWidth ? 'auto' : undefined,
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
      {settings.dots !== false && scrollSnaps.length > 1 && (
        <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className={`embla__dot ${index === selectedIndex ? 'embla__dot--selected' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type UseAutoplayType = {
  autoplayIsPlaying: boolean
  toggleAutoplay: () => void
  onAutoplayButtonClick: (callback: () => void) => void
}

const useAutoplay = (
  emblaApi: EmblaCarouselType | undefined
): UseAutoplayType => {
  const [autoplayIsPlaying, setAutoplayIsPlaying] = useState(false)

  const onAutoplayButtonClick = useCallback(
    (callback: () => void) => {
      const autoplay = emblaApi?.plugins()?.autoplay
      if (!autoplay) return

      autoplay.stop()
      callback()
    },
    [emblaApi]
  )

  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay) return

    const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play
    playOrStop()
  }, [emblaApi])

  useEffect(() => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay) return

    setAutoplayIsPlaying(autoplay.isPlaying())
    emblaApi
      .on('autoplay:play', () => setAutoplayIsPlaying(true))
      .on('autoplay:stop', () => setAutoplayIsPlaying(false))
      .on('reInit', () => setAutoplayIsPlaying(autoplay.isPlaying()))
  }, [emblaApi])

  return {
    autoplayIsPlaying,
    toggleAutoplay,
    onAutoplayButtonClick
  }
}
