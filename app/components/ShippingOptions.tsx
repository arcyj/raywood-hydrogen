import type { FC } from 'react';
import { Image } from '@shopify/hydrogen';

export const ShippingOptions: FC = () => {
  return (
    <>
      <div className='max-w-[750px]'>
        <div className=''>
          <p className='text-medium-semi mb-12'>Baltic region (Estonia, Latvia, Lithuania)</p>
          <div className='flex items-center justify-between gap-16 mb-16 mt-8 w-full'>
            <span className='flex items-center'>
              <span className='mr-12'>
                <Image
                  src='/images/icon-unisend.png'
                  alt='Unisend Icon'
                  sizes='25px'
                  className='w-[25px] h-[25px]'
                />
              </span>
              <span className='mr-12'>
                <Image
                  src='/images/icon-omniva.svg'
                  alt='Omniva Icon'
                  sizes='25px'
                  className='w-[25px] h-[25px]'
                />
              </span>
            </span>
            <span className='text-regular-semi'>delivery 2-3 business days</span>
          </div>
        </div>
        <div className='mt-24'>
          <p className='text-medium-semi mb-12'>Rest of Europe and international</p>
          <div className='flex items-center justify-between gap-16 mb-16 mt-8 w-full'>
            <span className='flex items-center'>
              <span className='svg-wrapper w-[40px] h-full mr-12'>
                <Image
                  src='/images/icon-fedex.svg'
                  alt='Fedex Icon'
                  sizes='25px'
                  className='w-[40px]'
                />
              </span>
              <p className='text-regular-semi'>
                Courier delivery
              </p>
            </span>
            <span className='text-regular-semi'>delivery 2-7 business days</span>
          </div>
        </div>
        <p className='text-medium-semi mt-24'>Shipping costs calculated at checkout</p>
      </div>
    </>
  );
}
