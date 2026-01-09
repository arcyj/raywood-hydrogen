import { twClasses, twc } from '../../helpers/twMerge';
import type { FC } from 'react';

type ISpinnerTheme = 'light' | 'dark';
type ISpinnerSize = 'small' | 'medium' | 'large';

interface ISpinnerProps {
  theme?: ISpinnerTheme;
  size?: ISpinnerSize;
  className?: string;
}

type ISpinerSizes = { [key in ISpinnerSize]: string };

const spinnerSize: ISpinerSizes = {
  small: '20',
  medium: '28',
  large: '32',
};

const spinnerStyle = {
  initial: twc`tw-m-0 tw-flex tw-p-0`,
};

export const Spinner: FC<ISpinnerProps> = ({ theme = 'light', size = 'small', className = '' }) => {
  const { initial } = spinnerStyle;

  const firstPathClass = theme === 'light' ? twc`text-transparent-low` : twc`text-transparent-low-dark`;
  const secondPathClass = theme === 'light' ? twc`text-text-layout-accent` : twc`text-text-layout-fixed-light`;

  const classes = twClasses([initial], {}, className);

  return (
    <span className={`${classes} tw-relative tw-animate-spin`}>
      <svg
        className={firstPathClass}
        width={spinnerSize[size]}
        height={spinnerSize[size]}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.75932 21.9105C1.98314 20.1717 1.55704 18.2971 1.50534 16.3936C1.45365 14.4902 1.77738 12.5952 2.45805 10.8168C3.13871 9.03845 4.16299 7.41158 5.47239 6.02907C6.78179 4.64657 8.35067 3.5355 10.0895 2.75932C11.8283 1.98314 13.7029 1.55704 15.6064 1.50534C17.5098 1.45365 19.4048 1.77738 21.1832 2.45805C22.9615 3.13871 24.5884 4.16299 25.9709 5.47239C27.3534 6.78179 28.4645 8.35067 29.2407 10.0895C30.0169 11.8283 30.443 13.7029 30.4947 15.6064C30.5463 17.5098 30.2226 19.4048 29.542 21.1832C28.8613 22.9615 27.837 24.5884 26.5276 25.9709C25.2182 27.3534 23.6493 28.4645 21.9105 29.2407C20.1717 30.0169 18.2971 30.443 16.3936 30.4947C14.4902 30.5463 12.5952 30.2226 10.8168 29.542C9.03845 28.8613 7.41158 27.837 6.02907 26.5276C4.64656 25.2182 3.5355 23.6493 2.75932 21.9105L2.75932 21.9105Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className={`${secondPathClass} tw-absolute`}
        width={spinnerSize[size]}
        height={spinnerSize[size]}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.8121 1.61367C21.2411 2.04559 24.4031 3.68812 26.7282 6.24524C29.0533 8.80235 30.3886 12.1059 30.4933 15.5604"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};
