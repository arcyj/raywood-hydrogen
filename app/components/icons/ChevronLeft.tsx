import type { IIconProps } from './icon.types';
import type { FC } from 'react';

export const ChevronLeft: FC<IIconProps> = ({ size = 20, className = '', ...rest }) => (
  <svg
    {...rest}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M13.042 16.4661C13.3914 16.1666 13.4319 15.6405 13.1324 15.2911L8.59722 10.0001L13.1324 4.70906C13.4319 4.35962 13.3914 3.83354 13.042 3.53402C12.6925 3.2345 12.1665 3.27497 11.8669 3.62441L6.86695 9.45774C6.59945 9.76982 6.59945 10.2303 6.86695 10.5424L11.8669 16.3757C12.1665 16.7252 12.6925 16.7656 13.042 16.4661Z"/>
  </svg>
);
