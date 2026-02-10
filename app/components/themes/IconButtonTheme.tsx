import { twc, twClasses } from '~/helpers/twMerge';
import type { RadixIconProps } from './ButtonTheme';
import type { IIconProps } from '../icons/icon.types';
import type { FC } from 'react';

type IIconButtonVariant = 'filled' | 'outlined' | 'ghost' | 'secondary';
type IIconLinkTheme = 'light' | 'dark';
export type IIconButtonSize = 'small' | 'medium' | 'large';

export interface IIconCoreProps {
  className?: string;
  variant?: IIconButtonVariant;
  size?: IIconButtonSize;
  disabled?: boolean;
  testName?: string;
  Icon: FC<IIconProps> | React.ForwardRefExoticComponent<RadixIconProps & React.RefAttributes<SVGSVGElement>>;
}

const IconButtonTheme = {
  initial: twc`flex items-center justify-center rounded-[4px] focus-visible:glow-focus focus:outline-none`,
  variants: {
    filled: twc`border-transparent-full bg-[#d7dae0] text-text-buttons-secondary`,
    secondary: twc`border-transparent-full`,
    outlined: twc`border border-solid border-gray`,
    ghost: twc`border-transparent-full bg-transparent-full text-text-buttons-tertiary`,
  },
  state: {
    secondary: {
      'DEFAULT': twc`bg-lightGrey`,
      active: twc`bg-[#FA5053] text-white`
    },
  },
  theme: {
    light: twc``,
    dark: twc`border-buttons-tertiary-dark text-text-buttons-tertiary-dark`,
  },
  hover: {
    filled: twc`hover:bg-accentGrey`,
    secondary: twc`hover:bg-accentGrey`,
    outlined: twc`hover:bg-accentGray hover:text-grey`,
    ghost: twc`hover:bg-surface-low-brand-focus hover:text-text-layout-accent`,
  },
  mousePress: {
    filled: twc`active:inset-shadow-sm`,
    outlined: twc`active:bg-lightGrey active:inset-shadow-sm`,
    secondary: twc`active:inset-shadow-sm`,
    ghost: twc`active:bg-foreground-lowest`,
  },
  keyPress: {
    filled: twc`!bg-surface-high-secondary-action`,
    secondary: twc`!inset-shadow-sm`,
    outlined: twc`!bg-foreground-lowest`,
    ghost: twc`!bg-foreground-lowest`,
  },
  disable: {
    filled: twc`bg-surface-high-secondary-disabled`,
    outlined: twc`border-layout-low text-text-layout-low`,
    ghost: twc`text-text-layout-low`,
  },
  cursor: {
    initial: twc`cursor-pointer`,
    disabled: twc`cursor-not-allowed`,
  },
  sizes: {
    small: twc`h-[32px] w-[32px]`,
    medium: twc`h-[48px] w-[48px]`,
    large: twc`text-label-l h-56 px-16`,
  },
};

export const iconButtonClasses = ({
  variant,
  theme = 'light',
  size,
  active = false,
  keyPressed = false,
  disabled = false,
  loading = false,
  className,
}: {
  variant: IIconButtonVariant;
  theme?: IIconLinkTheme;
  size: IIconButtonSize;
  active?: boolean;
  keyPressed?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className: string;
}) =>
  twClasses(
    [
      IconButtonTheme.initial,
      IconButtonTheme.variants[variant],
      IconButtonTheme.theme[theme],
      IconButtonTheme.sizes[size],
    ],
    {
      ...(IconButtonTheme.hover[variant as keyof typeof IconButtonTheme.hover] && {
        [IconButtonTheme.hover[variant as keyof typeof IconButtonTheme.hover]]: !disabled && !loading,
      }),
      ...(IconButtonTheme.mousePress[variant as keyof typeof IconButtonTheme.mousePress] && {
        [IconButtonTheme.mousePress[variant as keyof typeof IconButtonTheme.mousePress]]: !disabled && !loading,
      }),
      ...(IconButtonTheme.keyPress[variant as keyof typeof IconButtonTheme.keyPress] && {
        [IconButtonTheme.keyPress[variant as keyof typeof IconButtonTheme.keyPress]]: !disabled && !loading && keyPressed,
      }),
      [IconButtonTheme.cursor['initial']]: !disabled && !loading,
      [IconButtonTheme.cursor['disabled']]: disabled || loading,
      ...(IconButtonTheme.disable[variant as keyof typeof IconButtonTheme.disable] && {
        [IconButtonTheme.disable[variant as keyof typeof IconButtonTheme.disable]]: disabled || loading,
      }),
      ...(IconButtonTheme.state[variant as keyof typeof IconButtonTheme.state]?.active && {
        [IconButtonTheme.state[variant as keyof typeof IconButtonTheme.state].active]: active,
      }),
      ...(IconButtonTheme.state[variant as keyof typeof IconButtonTheme.state]?.['DEFAULT'] && {
        [IconButtonTheme.state[variant as keyof typeof IconButtonTheme.state]['DEFAULT']]: !active,
      }),
    },
    className,
  );
