import type { IIconProps } from './icon.types';
import type { FC } from 'react';

export const Remove: FC<IIconProps> = ({ size = 20, className = '', ...rest }) => (
  <svg
    {...rest}
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15.5 9.08325C16.0063 9.08325 16.4167 9.49366 16.4167 9.99992C16.4167 10.5062 16.0063 10.9166 15.5 10.9166H4.50001C3.99375 10.9166 3.58334 10.5062 3.58334 9.99992C3.58334 9.49366 3.99375 9.08325 4.50001 9.08325H15.5Z" />
  </svg>
);
