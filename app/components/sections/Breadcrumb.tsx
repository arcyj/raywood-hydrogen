import { Link } from 'react-router';
import type { FC } from 'react';
import { Home, ChevronRight } from '~/components/icons';
import { twClasses } from '~/helpers/twMerge';

export interface BreadcrumbItem {
  title: string;
  handle?: string;
}

export interface BreadcrumbProps {
  /** Collection segment (linked when product is present, else current page) */
  collection?: BreadcrumbItem | null;
  /** Parent collection from metafield category.parent, if exists */
  parentCollection?: BreadcrumbItem | null;
  /** When set, last segment is product title and collection becomes a link */
  product?: { title: string } | null;
  className?: string;
}

const SEPARATOR = (
  <ChevronRight className='fill-secondary-text mx-4'/>
);

export const Breadcrumb: FC<BreadcrumbProps> = ({
  collection,
  parentCollection,
  product,
  className
}) => {
  const hasProduct = Boolean(product?.title);
  const items: Array<{ title: string; href?: string }> = [
    { title: 'Home', href: '/' },
    ...(parentCollection?.handle
      ? [{ title: parentCollection.title, href: `/collections/${parentCollection.handle}` }]
      : []),
    ...(collection?.title
      ? [
          {
            title: collection.title,
            href: hasProduct && collection.handle ? `/collections/${collection.handle}` : undefined,
          },
        ]
      : []),
    ...(hasProduct ? [{ title: product!.title }] : []),
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className={twClasses([`flex items-center overflow-x-auto py-8 min-h-[44px] touch-manipulation [-webkit-overflow-scrolling:touch]`], {}, className)}
    >
      <ol className="flex items-center gap-0 text-black flex-nowrap min-w-0">
        {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center flex-shrink-0 min-w-0 max-w-full text-medium-semi"
            >
              {index > 0 && SEPARATOR}
              {item.href ? (
                <Link
                  to={item.href}
                  className="text-secondary-text hover:text-primary transition-colors truncate inline-block max-w-[120px] sm:max-w-[200px] md:max-w-none py-1 -my-1 px-0.5 -mx-0.5 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accentGrey"
                >
                  {index === 0 ? (
                    <span className="sr-only">Home</span>
                  ) : null}
                  {index === 0 ? (
                    <Home size={20} className="flex-shrink-0" aria-hidden />
                  ) : (
                    <span className="truncate block">{item.title}</span>
                  )}
                </Link>
              ) : (
                <span
                  className="text-foreground font-medium truncate block max-w-[140px] sm:max-w-[220px] md:max-w-none py-1"
                  aria-current="page"
                >
                  {item.title}
                </span>
              )}
            </li>
        ))}
      </ol>
    </nav>
  );
};
