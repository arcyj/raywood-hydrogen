import {Money} from '@shopify/hydrogen';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import { ShoppingCart } from 'lucide-react';
import { twClasses } from '~/helpers/twMerge';
import { useTranslation } from '~/lib/i18nContext';

export function ProductForm({
  selectedVariant,
  quantity = 1,
  className,
  showPrice = false,
}: {
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  quantity: number;
  className?: string;
  showPrice?: boolean;
}) {
  const {open} = useAside();
  const { t } = useTranslation();
  return (
    <div className={`product-form ${className ? ` ${className}` : ''}`}>

      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          open('cart');
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? (
          <span className={ twClasses("", {"flex justify-between w-full px-12": showPrice}, '')}>
            <span className="flex items-center"><ShoppingCart size={18} className="mr-8"/> <span className="h-[22px] text-end">{t('product.add_to_cart')}</span></span>
            {showPrice && selectedVariant?.price && (
              <span className="pl-12">
                <Money withoutTrailingZeros data={selectedVariant.price} />
              </span>
            )}
          </span>
        ) : (
          t('product.sold_out')
        )}
      </AddToCartButton>
    </div>
  );
}
