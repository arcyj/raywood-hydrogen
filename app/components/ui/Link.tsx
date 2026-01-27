import {NavLink} from 'react-router';
import { buttonClasses } from '../themes/ButtonTheme';
import type { ILinkButtonCoreProps } from '../themes/ButtonTheme';
import type { MouseEvent, KeyboardEvent, FC } from 'react';

type ILinkTarget = '_self' | '_blank' | '_parent' | '_top';
type IPrefetch = "intent" | "render" | "none" | "viewport";

interface IButtonLinkProps extends ILinkButtonCoreProps {
  href: string;
  active?: boolean;
  prefetch?: IPrefetch;
  target?: ILinkTarget;
  onClick?: (e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
}

export const ButtonLink: FC<IButtonLinkProps> = ({
  href,
  className = '',
  target = '_self',
  disabled = false,
  variant = 'link',
  active = false,
  size = 'large',
  IconBefore,
  IconAfter,
  testName = '',
  prefetch = 'intent',
  onClick,
  children,
}) => {

  const classes = buttonClasses({
    variant,
    size,
    active,
    disabled,
    loading: false,
    className,
  });

   const handleClicked = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    onClick && onClick(event);
  };

  return (
    <NavLink to={href} end className={classes} prefetch={prefetch} target={target} data-qa-link={testName} tabIndex={disabled ? -1 : 0}  onClick={handleClicked}>
      {IconBefore && <IconBefore size={24} className="mr-2" />}
      {children}
      {IconAfter && <IconAfter size={24} className="ml-8" />}
    </NavLink>
  );
};
