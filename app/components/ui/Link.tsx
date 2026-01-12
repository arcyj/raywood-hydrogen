import { buttonClasses } from '../themes/ButtonTheme';
import type { ILinkButtonCoreProps } from '../themes/ButtonTheme';
import type { FC } from 'react';

type ILinkTarget = '_self' | '_blank' | '_parent' | '_top';

interface IAsapLinkProps extends ILinkButtonCoreProps {
  href: string;
  active?: boolean;
  target?: ILinkTarget;
}

export const Link: FC<IAsapLinkProps> = ({
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

  return (
    <a href={href} className={classes} target={target} data-qa-link={testName} tabIndex={disabled ? -1 : 0}>
      {IconBefore && <IconBefore size={24} className="tw-mr-2" />}
      {children}
      {IconAfter && <IconAfter size={24} className="tw-pl-2" />}
    </a>
  );
};
