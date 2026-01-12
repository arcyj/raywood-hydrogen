import { twc, twClasses } from '~/helpers/twMerge';
import type { RadixIconProps } from './ButtonTheme';
import type { IIconProps } from '../icons/icon.types';
import type { FC } from 'react';

type IIconButtonVariant = 'filled' | 'outlined' | 'ghost';
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
    outlined: twc`border border-solid border-layout-medium bg-transparent-full text-text-buttons-tertiary`,
    ghost: twc`border-transparent-full bg-transparent-full text-text-buttons-tertiary`,
  },
  theme: {
    light: twc``,
    dark: twc`border-buttons-tertiary-dark text-text-buttons-tertiary-dark`,
  },
  hover: {
    filled: twc`hover:bg-surface-high-secondary-focus`,
    outlined: twc`hover:border-layout-accent hover:bg-surface-low-brand-focus hover:text-text-layout-accent`,
    ghost: twc`hover:bg-surface-low-brand-focus hover:text-text-layout-accent`,
  },
  mousePress: {
    filled: twc`active:bg-surface-high-secondary-action`,
    outlined: twc`active:bg-foreground-lowest`,
    ghost: twc`active:bg-foreground-lowest`,
  },
  keyPress: {
    filled: twc`!bg-surface-high-secondary-action`,
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
    medium: twc`h-[40px] w-[40px]`,
    large: twc`h-[48px] w-[48px]`,
  },
};

export const iconButtonClasses = ({
  variant,
  theme = 'light',
  size,
  keyPressed = false,
  disabled = false,
  loading = false,
  className,
}: {
  variant: IIconButtonVariant;
  theme?: IIconLinkTheme;
  size: IIconButtonSize;
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
      [IconButtonTheme.hover[variant]]: !disabled && !loading,
      [IconButtonTheme.mousePress[variant]]: !disabled && !loading,
      [IconButtonTheme.keyPress[variant]]: !disabled && !loading && keyPressed,
      [IconButtonTheme.cursor['initial']]: !disabled && !loading,
      [IconButtonTheme.cursor['disabled']]: disabled || loading,
      [IconButtonTheme.disable[variant]]: disabled || loading,
    },
    className,
  );
