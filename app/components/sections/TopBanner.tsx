import type {FC} from 'react';
import {Link} from 'react-router';
import {useLocalizedPath} from '~/hooks/useLocalePath';

interface ITopBannerProps {
  title: string;
  text: string;
  url: string;
  images?: string[];
  className?: string;
}

export const TopBanner: FC<ITopBannerProps> = ({
  title,
  text,
  url,
  images = [],
  className = '',
}) => {
  const withLocale = useLocalizedPath();
  const [img1, img2, img3] = images;

  return (
    <div
      className={`bg-[#4a7c55] rounded-2xl overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-24 min-h-[280px] desktop:min-h-[450px]">
        {/* Text content */}
        <div className="flex-1 min-w-0 pl-48">
          <h2 className=" text-white text-h1 mb-16">
            {title}
          </h2>
          <p className="text-white/80 text-regular mb-28 max-w-[400px]">
            {text}
          </p>
          <Link
            to={withLocale(url)}
            prefetch="intent"
            className="inline-flex items-center justify-center bg-white text-black font-semibold text-regular px-28 py-12 rounded-sm hover:bg-gray-100 transition-colors"
          >
            shop now
          </Link>
        </div>

        {/* Images — progressively revealed by breakpoint */}
        {images.length > 0 && (
          <div className="hidden tablet:flex items-end gap-0 flex-shrink-0 self-stretch">
            {img1 && (
              <div className="rounded-xl overflow-hidden h-full w-[240px] desktop:w-[300px]">
                <img
                  src={img1}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            )}
            {img2 && (
              <div className="rounded-xl overflow-hidden h-full w-[240px] desktop:w-[300px] hidden desktop:block grayscale">
                <img
                  src={img2}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            )}
            {/* {img3 && (
              <div className="rounded-xl overflow-hidden h-full w-[160px] desktop:w-[300px] hidden largeDesktop:block grayscale">
                <img
                  src={img3}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
};
