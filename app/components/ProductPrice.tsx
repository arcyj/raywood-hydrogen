import {Money} from '@shopify/hydrogen';
import { twClasses } from '~/helpers/twMerge';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

type Size = 'small' | 'large';

export function ProductPrice({
  price,
  compareAtPrice,
  size = 'large',
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  size?: Size;
}) {

  const initial = 'font-semibold';

  const textClasses = twClasses([initial], {
    'text-[14px] desktop:text-[18px]': size === 'small',
    'text-[24px] desktop:text-[26px]': size === 'large',
  }, );

  return (
    <div className="product-price">
      {compareAtPrice ? (
        <div className="product-price-on-sale">
          {price ? <Money data={price} /> : null}
          <s>
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
