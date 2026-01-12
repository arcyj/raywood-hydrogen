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
  onClick?: (e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
}

const navMenuItemStyle = {
  base: {
    initial: twc`relative rounded-md p-8 bg-white flex flex-col items-center justify-center`,
  },
  label: {
    initial: twc`text-sm text-text-layout-primary mt-2 font-semibold`,
  },
};

export const NavMenuItem: FC<IButtonProps> = ({
  Icon,
  label,
  type = 'button',
  onClick,
  className,
}) => {
  const { base } = navMenuItemStyle;

  const classes = useMemo(
    () => twClasses([base['initial']], {}, className),
    [base, className],
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
