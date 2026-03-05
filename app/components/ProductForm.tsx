import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  selectedVariant,
  quantity = 1,
  className
}: {
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  quantity: number;
  className?: string;
}) {
  const {open} = useAside();
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
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}
