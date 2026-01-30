import type { IIconProps } from './icon.types';
import type { FC } from 'react';

export const Home: FC<IIconProps> = ({ size = 20, className = '', ...rest }) => (
  <svg
    {...rest}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    >
    <path d="M19.25 16.4695V9.30439C19.25 8.19434 18.7553 7.14304 17.9026 6.4409L13.3193 2.66682C11.9696 1.5554 10.0304 1.5554 8.6807 2.66682L4.09737 6.4409C3.24467 7.14304 2.75 8.19434 2.75 9.30439V16.4695C2.75 18.5114 4.39162 20.1666 6.41667 20.1666H15.5833C17.6084 20.1666 19.25 18.5114 19.25 16.4695Z" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9.16699 16.5H12.8337" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
