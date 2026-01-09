import type { FC } from 'react';

interface IProductDetailItemProps {
  value: string;
  label: string;
}

export const ProductDetailItem: FC<IProductDetailItemProps> = ({value, label}) => {

  if(!value) {
    return null;
  }

  return (
    <p className='text-medium-semi text-text-dark rounded mb-4 flex'>
      <span className='text-gray pr-4'>{ label }: </span>{value }
    </p>
  )
}
