import {useEffect, useRef} from 'react';
import slugify from 'slugify';

export interface GiggleMonsterItemProps {
  image: string;
  alt: string;
  name: string;
  variant?: 'blue' | 'pink';
  secretEdition?: boolean;
  secretEditionLabel?: string;
}

const NAME_TAG_CLASS = {
  blue: 'bg-[#B8DDF0] py-12 px-16 rounded-lg font-bold',
  pink: 'bg-[#F2DBE1] py-12 px-16 rounded-lg font-bold',
};

export function GiggleMonsterItem({
  image,
  alt,
  name,
  variant = 'pink',
  secretEdition = false,
  secretEditionLabel = 'Secret Edition',
}: GiggleMonsterItemProps) {
  const atroposId = slugify(name, {lower: true, strict: true});
  const elRef = useRef<HTMLDivElement>(null);
  const atroposRef = useRef<{destroy: () => void} | null>(null);

  useEffect(() => {
    let cancelled = false;
    const el = elRef.current;
    if (!el || typeof window === 'undefined') return;
    void Promise.all([import('atropos'), import('atropos/css')]).then(
      ([{default: Atropos}]) => {
        if (cancelled || !elRef.current) return;
        atroposRef.current = Atropos({
          el,
          activeOffset: 60,
          shadowScale: 2.05,
          duration: 400,
          shadow: true,
          rotateTouch: false,
        });
      },
    );
    return () => {
      cancelled = true;
      atroposRef.current?.destroy();
      atroposRef.current = null;
    };
  }, []);

  return (
    <div
      ref={elRef}
      className={`atropos giggle-monster-item ${atroposId}`}
      data-atropos-id={atroposId}
    >
      <div className="atropos-scale">
        <div className="atropos-rotate">
          <div className="atropos-inner text-center flex flex-col items-center gap-8">
            <div className="atropos-shadow !bg-white/10" aria-hidden />
            <div className="px-8 pt-24 pb-24 bg-white/10 rounded-lg backdrop-opacity-[0.15] backdrop-blur-lg">
              {secretEdition && (
                <span
                  data-atropos-offset="3"
                  className="max-w-[300px] bg-black py-12 px-16 mb-12 rounded-[4px] font-semibold text-white inline-block"
                >
                  {secretEditionLabel}
                </span>
              )}
              <img
                data-atropos-offset="5"
                src={image}
                alt={alt}
                width="100%"
                height={350}
                className="h-[300px] mb-12 mt-12 object-contain"
              />
              <span
                data-atropos-offset="2"
                className={NAME_TAG_CLASS[variant]}
              >
                {name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
