import * as React from 'react';
import { twClasses, twc } from '../../helpers/twMerge';
import type { IIconProps } from '../icons/icon.types';
import type { FC, ReactNode, RefAttributes, SVGProps, ForwardRefExoticComponent } from 'react';

export type IButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'tertiaryOnDark'
  | 'link'
  | 'action'
  | 'menuLink';

export type IButtonSize = 'extra-small' | 'small' | 'medium' | 'large';
export interface RadixIconProps extends React.SVGAttributes<SVGElement> {
    children?: never;
    color?: string;
}
type SVGAttributes = Partial<SVGProps<SVGSVGElement>>;
type ElementAttributes = RefAttributes<SVGSVGElement> & SVGAttributes;
interface LucideProps extends ElementAttributes {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
}

export interface ILinkButtonCoreProps {
  variant?: IButtonVariant;
  size?: IButtonSize;
  isActivated?: boolean;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  testName?: string;
  IconBefore?: FC<IIconProps> | React.ForwardRefExoticComponent<RadixIconProps & React.RefAttributes<SVGSVGElement>> | ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  IconAfter?: FC<IIconProps> | React.ForwardRefExoticComponent<RadixIconProps & React.RefAttributes<SVGSVGElement>> | ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
}

const ButtonTheme = {
  base: {
    button: twc`inline-flex text-nowrap items-center justify-center rounded-4xl text-center no-underline font-semibold transition-all duration-100 ease-in-out`,
    link: twc`inline-flex items-center justify-between`,
    linkText: twc`text-text-layout-powerful`,
    linkTextActive: twc`border-text-layout-accent text-text-layout-accent`,
  },
  variants: {
    primary: twc`border-2 text-white duration-300 ease-out`,
    secondary: twc`border-0 bg-lightGrey`,
    tertiary: twc`border border-solid border-[#d7dae0] bg-transparent-full text-text-buttons-tertiary`,
    tertiaryOnDark: twc`border border-solid border-buttons-tertiary-dark bg-transparent-full text-text-buttons-tertiary-dark`,
    action: twc`border-0 bg-[#35204d] text-white text-text-layout-primary rounded-xl`,
    link: twc`text-label-m border-0 border-b border-solid border-layout-powerful bg-transparent-full p-0 no-underline font-semibold`,
    menuLink: twc`text-link flex items-center px-8 rounded-lg py-8 active:bg-accentGrey active:inset-shadow-sm`,
  },
  active: {
    primary: twc`border-[#943BF2] bg-linear-to-b from-primary via-primary to-[#943BF2] via-[#8f5cf5] bg-[length:100%_180%] bg-[position:50%_0%] `,
    secondary: twc`bg-lightGrey`,
    tertiary: twc`bg-transparent-full `,
    tertiaryOnDark: twc`bg-transparent-full`,
    action: twc`bg-[#35204d]`,
    link: twc`tbg-transparent-full`,
    menuLink: twc``,
  },
  hover: {
    primary: twc`hover:bg-[position:50%_40%] transition-[background-position] `,
    secondary: twc`hover:bg-accentGrey`,
    tertiary: twc`hover:border-black hover:bg-black hover:text-white`,
    tertiaryOnDark: twc`hover:bg-transparent-low-dark hover:text-text-buttons-tertiary-focus-dark`,
    link: twc`hover:border-text-link-focus hover:text-text-link-focus`,
    menuLink: twc`hover:bg-lightGrey`,
    action: twc``,
  },
  mousePress: {
    primary: twc`active:bg-[position:0%_80%] active:inset-shadow-sm`,
    secondary: twc`active:bg-accentGrey active:inset-shadow-sm`,
    tertiary: twc`active:border-text-buttons-tertiary-focus active:bg-foreground-lowest active:ring-1 active:ring-text-buttons-tertiary-focus`,
    tertiaryOnDark: twc`active:border-2 active:bg-transparent-medium-dark`,
    link: twc`active:border-text-link-action active:text-text-link-action`,
    menuLink: twc`active:bg-accentGrey active:inset-shadow-sm`,
    action: twc``,
  },
  keyPress: {
    primary: twc`!bg-surface-high-primary-action`,
    secondary: twc`!bg-surface-high-secondary-action`,
    tertiary: twc`!border-text-buttons-tertiary-focus !bg-foreground-lowest !ring-1 !ring-text-buttons-tertiary-focus`,
    tertiaryOnDark: twc`!border-2 !bg-transparent-medium-dark`,
    redActionDefault: twc`!text-text-buttons-primary active:border-solid`,
    redActionActivated: twc`!bg-surface-high-primary-action !text-text-buttons-primary active:border-solid`,
    link: twc`border-text-link-action text-text-link-action`,
    menuLink: twc`text-text-link-action`,
    action: twc``,
  },
  focus: {
    primary: twc`outline-none focus-visible:glow-focus`,
    secondary: twc`focus-visible:glow-focus`,
    tertiary: twc`outline-none focus-visible:glow-focus focus-visible:border-text-buttons-tertiary-focus focus-visible:bg-surface-low-brand-focus focus-visible:text-text-buttons-tertiary-focus`,
    tertiaryOnDark: twc`outline-none focus-visible:glow-focus focus-visible:bg-transparent-medium-dark`,
    link: twc`focus:outline-none focus-visible:border-text-link-focus focus-visible:text-text-link-focus focus-visible:shadow-[0_0px_0px_2px_rgba(49,145,245,0.5)]`,
    menuLink: twc`focus:outline-none focus-visible:text-text-link-focus focus-visible:shadow-[0_0px_0px_2px_rgba(49,145,245,0.5)]`,
    action: twc``,
  },
  disable: {
    primary: twc`bg-gray border-gray`,
    secondary: twc`bg-lightGray`,
    tertiary: twc`border-lightGray text-lightGray`,
    tertiaryOnDark: twc`border-lightGray text-lightGray`,
    link: twc``,
    menuLink: twc``,
    action: twc`bg-lightGray pointer-events-none cursor-not-allowed`,
  },
  cursor: {
    initial: twc`cursor-pointer`,
    disabled: twc`cursor-not-allowed`,
  },
  sizes: {
    'extra-small': twc`text-extra-small h-32 px-12`,
    small: twc`text-label-m h-40 px-16`,
    medium: twc`text-label-m h-48 px-16`,
    large: twc`text-label-l h-56 px-16`,
  },
};

export const buttonClasses = ({
  variant: variantProp,
  isActivated = false,
  size,
  active,
  keyPressed = false,
  disabled,
  loading = false,
  className,
}: {
  variant: IButtonVariant;
  size: IButtonSize;
  active: boolean;
  keyPressed?: boolean;
  disabled: boolean;
  loading: boolean;
  className: string;
  isActivated?: boolean;
}) => {
  const variant =  variantProp;
  return twClasses(
    [ButtonTheme.variants[variant]],
    {
      [ButtonTheme.sizes[size]]: variant !== 'link' && variant !== 'menuLink',
      [ButtonTheme.base['button']]: variant !== 'link' && variant !== 'menuLink',
      [ButtonTheme.base['link']]: variant === 'link',
      [ButtonTheme.base['linkText']]: (variant === 'menuLink' || variant === 'link') && !active,
      [ButtonTheme.base['linkTextActive']]: (variant === 'menuLink' || variant === 'link') && active,
      [ButtonTheme.active[variant]]: !disabled && !loading,
      [ButtonTheme.hover[variant]]: !disabled && !loading,
      [ButtonTheme.mousePress[variant]]: !disabled && !loading && !keyPressed,
      [ButtonTheme.keyPress[variant]]: !disabled && !loading && keyPressed,
      [ButtonTheme.focus[variant]]: !disabled && !loading,
      [ButtonTheme.disable[variant]]: disabled || loading,
      [ButtonTheme.cursor['initial']]: !disabled && !loading,
      [ButtonTheme.cursor['disabled']]: disabled || loading,
    },
    className,
  );
};
