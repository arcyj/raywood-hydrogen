import { useState } from 'react';
import { Spinner } from '../icons/Spinner';
import { iconButtonClasses } from '../themes/IconButtonTheme';
import type { IIconCoreProps } from '../themes/IconButtonTheme';
import type { FC, MouseEvent, KeyboardEvent } from 'react';

interface IIconButtonProps extends IIconCoreProps {
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?(e?: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>): void;
}

export const IconButton: FC<IIconButtonProps> = ({
  className = '',
  variant = 'outlined',
  size = 'medium',
  disabled = false,
  loading = false,
  Icon,
  testName = '',
  type = 'button',
  onClick,
}) => {
  const [isKeyPressed, setIsKeyPressed] = useState(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick) {
      setIsKeyPressed(true);
      onClick(event);
      event.preventDefault();
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setIsKeyPressed(false);
    }
  };

  const classes = iconButtonClasses({
    variant,
    size,
    keyPressed: isKeyPressed,
    disabled,
    loading,
    className,
  });

  return (
    <button
      className={classes}
      disabled={disabled}
      data-qa-button={testName}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      type={type}
    >
      {loading ? <Spinner size="small" /> : <Icon size={size === 'large' ? 24 : 20} />}
    </button>
  );
};
