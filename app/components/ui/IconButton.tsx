import { useState, forwardRef } from 'react';
import { Spinner } from '../icons/Spinner';
import { iconButtonClasses } from '../themes/IconButtonTheme';
import type { IIconCoreProps } from '../themes/IconButtonTheme';
import type { MouseEvent, KeyboardEvent } from 'react';

interface IIconButtonProps extends IIconCoreProps {
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  active?: boolean;
  onClick?(e?: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>): void;
}

export const IconButton = forwardRef<HTMLButtonElement, IIconButtonProps>(({
  className = '',
  variant = 'outlined',
  size = 'medium',
  disabled = false,
  loading = false,
  active = false,
  Icon,
  testName = '',
  type = 'button',
  onClick,
}, ref) => {
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
    active,
    className,
  });

  return (
    <button
      ref={ref}
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
});

IconButton.displayName = 'IconButton';
