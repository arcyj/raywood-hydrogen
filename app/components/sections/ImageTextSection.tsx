import type {FC} from 'react';

export interface ImageTextItem {
  image: string;
  alt?: string;
  title: string;
  text: string;
}

interface ImageTextSectionProps {
  items: ImageTextItem[];
  className?: string;
}

export const ImageTextSection: FC<ImageTextSectionProps> = ({items, className = ''}) => {
  if (!items?.length) return null;

  return (
    <section className={`tablet:bg-[#f0ede8] py-64 px-16 tablet:px-32 ${className}`}>
      <div className="max-w-[900px] mx-auto flex flex-col">
        {items.map((item, i) => {
          const isEven = i % 2 === 0;
          return (
            <div
              key={i}
              className={`grid grid-cols-1 tablet:grid-cols-2 gap-0`}
            >
              {isEven ? (
                <>
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.alt ?? item.title}
                      className="w-full object-cover block"
                      style={{maxHeight: '620px', objectPosition: 'center'}}
                    />
                  </div>
                  <div className="flex items-center px-32 tablet:px-48 py-32 tablet:py-0">
                    <div>
                      <h3 className="text-[18px] font-bold mb-12 leading-snug">{item.title}</h3>
                      <p className="text-[14px] leading-relaxed text-gray-700 whitespace-pre-line">{item.text}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center px-32 tablet:px-48 py-32 tablet:py-0 order-2 tablet:order-1">
                    <div>
                      <h3 className="text-[18px] font-bold mb-12 leading-snug">{item.title}</h3>
                      <p className="text-[14px] leading-relaxed text-gray-700 whitespace-pre-line">{item.text}</p>
                    </div>
                  </div>
                  <div className="relative order-1 tablet:order-2">
                    <img
                      src={item.image}
                      alt={item.alt ?? item.title}
                      className="w-full object-cover block"
                      style={{maxHeight: '620px', objectPosition: 'center'}}
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
