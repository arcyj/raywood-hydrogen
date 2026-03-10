import {Await} from 'react-router';
import {Suspense} from 'react';
import { ButtonLink } from '~/components/ui/Link';
import { Slider } from '~/components/Slider';
import {ProductItem} from '~/components/ProductItem';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { ArrowRight } from 'lucide-react';
import type {
  LatestAddedProductsQuery,
} from 'storefrontapi.generated';

export function CollectionSlider({
  title,
  collectionPath,
  products,
  className,
}: {
  title: string;
  collectionPath: string;
  products: Promise<LatestAddedProductsQuery | null>;
  className?: string;
}) {
  const { isDesktop } = useBreakpoints();
  return (
    <div className={className}>
      <div className="mb-8 flex items-center pb-12 ">
        <h2 className="text-large-semi mr-12">{title}</h2>
        <ButtonLink
          href={collectionPath}
          className="transition-colors"
          prefetch="intent"
          IconAfter={ArrowRight}
          variant="secondary"
          size="small"
        >
          View all
        </ButtonLink>
      </div>
      <Suspense fallback={<div className="h-[320px] bg-lightGrey rounded animate-pulse" />}>
        <Await resolve={products}>
          {(response) => {
            const collection = response?.collection;
            const productNodes = collection?.products?.nodes ?? [];
            if (!collection || productNodes.length === 0) return null;

            return (
              <Slider
                fadeUnderArrows
                settings={{
                  slidesToShow: 'auto',
                  spaceBetween: 8,
                  dots: false,
                  arrows: isDesktop ? true : false,
                  options: {
                    dragFree: true
                  }
                }}
              >
                {productNodes.map((product) => (
                  <ProductItem key={product.id} product={product} className="w-[170px] tablet:w-[257px]"/>
                ))}
              </Slider>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
