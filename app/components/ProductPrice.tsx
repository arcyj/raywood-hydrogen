import {Money} from '@shopify/hydrogen';
import { twClasses } from '~/helpers/twMerge';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

type Size = 'small' | 'large';

export function ProductPrice({
  price,
  compareAtPrice,
  size = 'large',
  className,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  size?: Size;
  className?: string;
}) {

  const initial = 'font-semibold';

  const textClasses = twClasses([initial], {
    'text-[16px] desktop:text-[18px]': size === 'small',
    'text-[24px] desktop:text-[34px] desktop:leading-[34px]': size === 'large',
  }, );

  return (
    <div className={`product-price ${className}`}>
      {compareAtPrice ? (
        <div className='flex items-end'>
          {price ? <span className={`${textClasses} text-danger mr-8`}><Money data={price} /></span> : null}
          <s className='text-[18px] font-semibold'>
            <Money data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <span className={textClasses}>
          <Money data={price} />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
