import {useEffect, useState, type ComponentType} from 'react';

export interface GiggleMonsterItemWrapperProps {
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

function toId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Static card used for SSR and until client component loads. No atropos. */
function GiggleMonsterItemStatic(props: GiggleMonsterItemWrapperProps) {
  const {
    image,
    alt,
    name,
    variant = 'pink',
    secretEdition = false,
    secretEditionLabel = 'Secret Edition',
  } = props;
  const id = toId(name);
  return (
    <div className={`atropos giggle-monster-item ${id}`} data-atropos-id={id}>
      <div className="atropos-scale">
        <div className="atropos-rotate">
          <div className="atropos-inner text-center flex flex-col items-center gap-8">
            <div className="atropos-shadow" aria-hidden />
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
              <span data-atropos-offset="2" className={NAME_TAG_CLASS[variant]}>
                {name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Client-only wrapper: renders static card on server, then loads GiggleMonsterItem
 * (with atropos) only in the browser so SSR never touches the atropos package.
 */
export function GiggleMonsterItemWrapper(props: GiggleMonsterItemWrapperProps) {
  const [ClientItem, setClientItem] = useState<ComponentType<GiggleMonsterItemWrapperProps> | null>(null);

  useEffect(() => {
    void import('./GiggleMonsterItem').then((m) => {
      const Comp = m.GiggleMonsterItem;
      if (typeof Comp === 'function') setClientItem(() => Comp);
    });
  }, []);

  const safeProps =
    props && typeof props === 'object' && !Array.isArray(props)
      ? props
      : {image: '', alt: '', name: ''};

  if (!ClientItem) return <GiggleMonsterItemStatic {...safeProps} />;
  return <ClientItem {...safeProps} />;
}
