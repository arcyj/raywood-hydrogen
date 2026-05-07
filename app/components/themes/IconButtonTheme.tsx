import { twc, twClasses } from '~/helpers/twMerge';
import type { RadixIconProps } from './ButtonTheme';
import type { IIconProps } from '../icons/icon.types';
import type { FC, ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react';

type SVGAttributes = Partial<SVGProps<SVGSVGElement>>;
type ElementAttributes = RefAttributes<SVGSVGElement> & SVGAttributes;
interface LucideProps extends ElementAttributes {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
}

type IIconButtonVariant = 'filled' | 'outlined' | 'ghost' | 'secondary' | 'round';
type IIconLinkTheme = 'light' | 'dark';
export type IIconButtonSize = 'small' | 'medium' | 'large';

export interface IIconCoreProps {
  className?: string;
  variant?: IIconButtonVariant;
  size?: IIconButtonSize;
  disabled?: boolean;
  testName?: string;
  Icon: FC<IIconProps> | React.ForwardRefExoticComponent<RadixIconProps & React.RefAttributes<SVGSVGElement>> | ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
}

const IconButtonTheme = {
  initial: twc`flex items-center justify-center focus-visible:glow-focus focus:outline-none`,
  variants: {
    filled: twc`border-transparent-full bg-[#d7dae0] text-small-semi rounded-xl`,
    secondary: twc`border-transparent-full rounded-xl bg-lightGrey text-small-semi`,
    outlined: twc`border border-solid border-accentGrey bg-white rounded-full shadow-sm `,
    ghost: twc`border-transparent-full bg-transparent-full text-small-semi yrounded-full `,
    round: twc`border-transparent-full bg-[#d7dae0] text-small-semi rounded-full shadow-xl`,
  },
  state: {
    secondary: {
      'DEFAULT': twc`bg-lightGrey`,
      active: twc`bg-[#FA5053] text-white`
    },
    outlined:{
      'DEFAULT': twc`bg-lightGrey`,
      active: twc`text-primary`
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
    round: twc`active:inset-shadow-sm active:shadow-sm active:bg-grey`,
    ghost: twc`active:bg-foreground-lowest`,
  },
  keyPress: {
    filled: twc`!bg-surface-high-secondary-action`,
    secondary: twc`!inset-shadow-sm`,
    round: twc`!inset-shadow-sm shadow-sm bg-grey`,
    outlined: twc`!bg-foreground-lowest`,
    ghost: twc`!bg-foreground-lowest`,
  },
  disable: {
    filled: twc`bg-[#f6f6f6]`,
    outlined: twc``,
    ghost: twc``,
  },
  cursor: {
    initial: twc`cursor-pointer`,
    disabled: twc`cursor-not-allowed`,
  },
  sizes: {
    small: twc`h-[40px] w-[40px]`,
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
