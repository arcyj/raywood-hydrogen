import type { FC } from 'react';

interface IProductDetailItemProps {
  value: string;
  label?: string;
  /** Optional icon (e.g. from metaobject reference) shown before the value */
  icon?: { url: string; altText?: string | null };
}

export const ProductDetailItem: FC<IProductDetailItemProps> = ({
  value,
  label,
  icon,
}) => {
  if (!value && !icon) {
    return null;
  }

  return (
    <p className="text-regular-semi text-text-dark rounded mb-4 flex items-center gap-2 bg-lightGrey py-4 px-8">
      {label ? <span className="text-small text-gray pr-4">{label}:</span> : null }
      {icon?.url && (
        <img
          src={icon.url}
          alt={icon.altText ?? ''}
          className="size-5 object-contain mr-4"
          width={20}
          height={20}
        />
      )}
      {value}
    </p>
  );
};
