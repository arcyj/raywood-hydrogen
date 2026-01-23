import { useMemo } from 'react';
import { twc, twClasses } from '~/helpers/twMerge';
import type { IIconProps } from '../icons/icon.types';
import type { MouseEvent, KeyboardEvent, FC } from 'react';

interface IButtonProps {
  Icon: FC<IIconProps>;
  label?: string;
  type?: 'button' | 'submit';
  active?: boolean;
  className?: string;
  variant?: 'menu' | 'navBar'
  onClick?: (e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
}

const navMenuItemStyle = {
  base: {
    initial: twc`relative rounded-md p-8 flex flex-col items-center justify-center cursor-pointer`,
    inActive: twc`bg-white`,
    active: twc`bg-lightGrey inset-shadow-sm`,
  },
  label: {
    initial: twc`text-sm text-text-layout-primary mt-2 font-semibold`,
  },
  variants: {
    navBar: '',
    menu: "hover:bg-lightGrey rounded-lg py-8 active:bg-accentGrey active:inset-shadow-sm"
  }
};

export const NavMenuItem: FC<IButtonProps> = ({
  Icon,
  label,
  type = 'button',
  active = false,
  onClick,
  variant = 'navBar',
  className,
}) => {
  const { base, variants } = navMenuItemStyle;

  const classes = useMemo(
    () => twClasses([base['initial'], variants[variant]], {
      [base['active']]: active,
      [base['inActive']]: !active,
    }, className),
    [base, active, className],
  );
  const labelClasses = useMemo(
    () => twClasses([navMenuItemStyle.label['initial']], {}),
    [navMenuItemStyle.label],
  );

  return(
    <button className={classes} type={type} onClick={onClick}>
      {Icon && <Icon size={32} />}
      {label && <span className={labelClasses}>{label}</span>}
    </button>
  )
}
