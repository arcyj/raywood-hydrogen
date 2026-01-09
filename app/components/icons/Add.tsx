import type { IIconProps } from './icon.types';
import type { FC } from 'react';

export const Add: FC<IIconProps> = ({ size = 20, className = '', ...rest }) => (
  <svg
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path d="M9.08334 9.08325V4.49992C9.08334 3.99366 9.49375 3.58325 10 3.58325C10.5063 3.58325 10.9167 3.99366 10.9167 4.49992V9.08325H15.5C16.0063 9.08325 16.4167 9.49366 16.4167 9.99992C16.4167 10.5062 16.0063 10.9166 15.5 10.9166H10.9167V15.4999C10.9167 16.0062 10.5063 16.4166 10 16.4166C9.49375 16.4166 9.08334 16.0062 9.08334 15.4999V10.9166H4.50001C3.99375 10.9166 3.58334 10.5062 3.58334 9.99992C3.58334 9.49366 3.99375 9.08325 4.50001 9.08325H9.08334Z" />
  </svg>
);
