import type { IIconProps } from './icon.types';
import type { FC } from 'react';

export const Warning: FC<IIconProps> = ({ size = 20, className = '', ...rest }) => (
  <svg
    {...rest}
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10ZM9.14095 6.07496C9.14095 5.60009 9.52591 5.21513 10.0008 5.21513C10.4756 5.21513 10.8606 5.60009 10.8606 6.07496V10.1219C10.8606 10.5968 10.4756 10.9817 10.0008 10.9817C9.52591 10.9817 9.14095 10.5968 9.14095 10.1219V6.07496ZM10 14.6063C10.5537 14.6063 11.0026 14.1574 11.0026 13.6037C11.0026 13.05 10.5537 12.6011 10 12.6011C9.44628 12.6011 8.9974 13.05 8.9974 13.6037C8.9974 14.1574 9.44628 14.6063 10 14.6063Z"
    />
  </svg>
);
