import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {useNavigate, Link} from 'react-router';
import {useLocalizedPath} from '~/hooks/useLocalePath';
import { twClasses } from '~/helpers/twMerge';
import {type MappedProductOptions} from '@shopify/hydrogen';

export function ProductOptions({
  productOptions,
}: {
  productOptions: MappedProductOptions[];
}) {
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();

  const optionClasses = (selected: boolean, available: boolean) => twClasses(["product-options-item rounded-lg text-medium-semi border-2 active:inset-shadow-sm"], {
    'border-[#733B73] bg-lowPrimary': selected,
    'border-lightGrey bg-lightGrey': !selected,
    'opacity-100 cursor-pointer hover:bg-lowPrimary': available,
    'opacity-30': !available,
  }, );

  return (
    <div>
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options" key={option.name}>
            <h5 className='text-regular-semi my-8'>{option.name}</h5>
            <div className="product-options-grid">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                if (isDifferentProduct) {
                  // SEO
                  // When the variant is a combined listing child product
                  // that leads to a different url, we need to render it
                  // as an anchor tag
                  return (
                    <Link
                      className="product-options-item text-medium-semi"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={withLocale(`/products/${handle}?${variantUriQuery}`)}
                      style={{
                        border: selected
                          ? '1px solid black'
                          : '1px solid transparent',
                        opacity: available ? 1 : 0.3,
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  // SEO
                  // When the variant is an update to the search param,
                  // render it as a button with javascript navigating to
                  // the variant so that SEO bots do not index these as
                  // duplicated links
                  return (
                    <button
                      type="button"
                      className={optionClasses(selected, available)}
                      key={option.name + name}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          void navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
            <br />
          </div>
        );
      })}
    </div>
  );
}
function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}
