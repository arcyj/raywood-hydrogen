import type { IIconProps } from './icon.types';
import type { FC } from 'react';

export const ChevronRight: FC<IIconProps> = ({ size = 20, className = '', ...rest }) => (
  <svg
    {...rest}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
  <path fillRule="evenodd" clipRule="evenodd" d="M8.34923 4.24076C7.9299 4.60018 7.88134 5.23148 8.24076 5.65081L13.6829 12L8.24076 18.3492C7.88134 18.7686 7.9299 19.3999 8.34923 19.7593C8.76855 20.1187 9.39985 20.0701 9.75927 19.6508L15.7593 12.6508C16.0803 12.2763 16.0803 11.7237 15.7593 11.3492L9.75927 4.34923C9.39985 3.9299 8.76855 3.88134 8.34923 4.24076Z" />
  </svg>
);
