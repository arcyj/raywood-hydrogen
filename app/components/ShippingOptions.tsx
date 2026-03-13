import type { FC } from 'react';
import { Image } from '@shopify/hydrogen';

export const ShippingOptions: FC = () => {
  return (
    <>
      <div className='max-w-[750px]'>
        <div className=''>
          <p className='text-regular-semi mb-4'>Shipping worldwide</p>
          <div className='flex items-center justify-between gap-16 mb-8 mt-8 w-full'>
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
              <span className='svg-wrapper w-[40px] h-full mr-12'>
                <Image
                  src='/images/icon-fedex.svg'
                  alt='Fedex Icon'
                  sizes='25px'
                  className='w-[40px]'
                />
              </span>
            </span>

          </div>
        </div>
        <p className='text-small mt-12'>Shipping costs calculated at checkout</p>
      </div>
    </>
  );
}
