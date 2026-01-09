import * as React from 'react';
import { twClasses, twc } from '../../helpers/twMerge';
import type { IIconProps } from '../icons/icon.types';
import type { FC, ReactNode } from 'react';

export type IButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'tertiaryOnDark'
  | 'link'
  | 'action'
  | 'menuLink';

type IButtonSize = 'extra-small' | 'small' | 'medium' | 'large';
interface RadixIconProps extends React.SVGAttributes<SVGElement> {
    children?: never;
    color?: string;
}

export interface ILinkButtonCoreProps {
  variant?: IButtonVariant;
  size?: IButtonSize;
  isActivated?: boolean;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  testName?: string;
  IconBefore?: FC<IIconProps> | React.ForwardRefExoticComponent<RadixIconProps & React.RefAttributes<SVGSVGElement>>;
  IconAfter?: FC<IIconProps>;
}

const ButtonTheme = {
  base: {
    button: twc`inline-flex items-center justify-center rounded text-center no-underline font-semibold`,
    link: twc`inline-flex`,
    linkText: twc`text-text-layout-powerful`,
    linkTextActive: twc`border-text-layout-accent text-text-layout-accent`,
  },
  variants: {
    primary: twc`border-2 border-[#943BF2] bg-[#943BF2] text-white`,
    secondary: twc`border-0 bg-surface-high-secondary-active text-text-buttons-secondary`,
    tertiary: twc`border border-solid border-buttons-tertiary bg-transparent-full text-text-buttons-tertiary`,
    tertiaryOnDark: twc`border border-solid border-buttons-tertiary-dark bg-transparent-full text-text-buttons-tertiary-dark`,
    action: twc`border-0 bg-[#1D1229]/69 text-white text-text-layout-primary rounded-xl`,
    link: twc`text-label-m border-0 border-b border-solid border-layout-powerful bg-transparent-full p-0 no-underline`,
    menuLink: twc`text-body-regular border-0 bg-transparent-full p-0 no-underline`,
  },
  hover: {
    primary: twc`hover:bg-[#AE6AF5] hover:border-[#AE6AF5]`,
    secondary: twc`hover:bg-surface-high-secondary-focus`,
    tertiary: twc`hover:border-layout-accent hover:bg-surface-low-brand-focus hover:text-text-buttons-tertiary-focus`,
    tertiaryOnDark: twc`hover:bg-transparent-low-dark hover:text-text-buttons-tertiary-focus-dark`,
    link: twc`hover:border-text-link-focus hover:text-text-link-focus`,
    menuLink: twc`hover:text-text-layout-accent`,
  },
  mousePress: {
    primary: twc`active:bg-surface-high-primary-action`,
    secondary: twc`active:bg-surface-high-secondary-action`,
    tertiary: twc`active:border-text-buttons-tertiary-focus active:bg-foreground-lowest active:ring-1 active:ring-text-buttons-tertiary-focus`,
    tertiaryOnDark: twc`active:border-2 active:bg-transparent-medium-dark`,
    link: twc`active:border-text-link-action active:text-text-link-action`,
    menuLink: twc`active:text-text-link-action`,
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
  },
  focus: {
    primary: twc`outline-none focus-visible:glow-focus`,
    secondary: twc`outline-none focus-visible:glow-focus`,
    tertiary: twc`outline-none focus-visible:glow-focus focus-visible:border-text-buttons-tertiary-focus focus-visible:bg-surface-low-brand-focus focus-visible:text-text-buttons-tertiary-focus`,
    tertiaryOnDark: twc`outline-none focus-visible:glow-focus focus-visible:bg-transparent-medium-dark`,
    link: twc`focus:outline-none focus-visible:border-text-link-focus focus-visible:text-text-link-focus focus-visible:shadow-[0_0px_0px_2px_rgba(49,145,245,0.5)]`,
    menuLink: twc`focus:outline-none focus-visible:text-text-link-focus focus-visible:shadow-[0_0px_0px_2px_rgba(49,145,245,0.5)]`,
  },
  disable: {
    primary: twc`bg-surface-high-primary-disabled`,
    secondary: twc`bg-surface-high-secondary-disabled`,
    tertiary: twc`border-layout-high text-text-layout-medium`,
    tertiaryOnDark: twc`border-layout-low text-text-layout-low`,
    link: twc``,
    menuLink: twc``,
  },
  cursor: {
    initial: twc`cursor-pointer`,
    disabled: twc`cursor-not-allowed`,
  },
  sizes: {
    'extra-small': twc`text-extra-small h-28 px-8`,
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
