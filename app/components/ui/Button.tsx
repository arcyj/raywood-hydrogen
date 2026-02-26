import { useState } from 'react';
import { Spinner } from '../icons/Spinner';
import { buttonClasses } from '../themes/ButtonTheme';
import type { ILinkButtonCoreProps } from '../themes/ButtonTheme';
import type { MouseEvent, KeyboardEvent, FC } from 'react';

interface IButtonProps extends ILinkButtonCoreProps {
  type?: 'button' | 'submit';
  loading?: boolean;
  onClick?: (e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
}

export const Button: FC<IButtonProps> = ({
  type = 'button',
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  className = '',
  IconBefore,
  IconAfter,
  testName = '',
  isActivated,
  onClick,
  children,
}) => {
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const isTertiaryOnDark = variant === 'tertiaryOnDark';

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    //additional condition is needed (!editorEnabled) because in edit mode it's impossible to add space
    if ((event.key === 'Enter' || event.key === ' ') && onClick) {
      setIsKeyPressed(true);
      onClick(event);
      event.preventDefault();
    }
  };

  const handleClicked = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    onClick && onClick(event);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setIsKeyPressed(false);
    }
  };

  const classes = buttonClasses({
    variant,
    isActivated,
    size,
    active: false,
    keyPressed: isKeyPressed,
    disabled,
    loading,
    className,
  });

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      data-qa-button={testName}
      onClick={handleClicked}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={disabled || loading ? -1 : 0}
    >
      <div
        className="flex items-center justify-center w-full"
        style={{visibility: loading ? 'hidden' : 'visible'}}
      >
        {IconBefore && !loading && (
          <span className="mr-4" >
            <IconBefore size={22}/>
          </span>
        )}
        {children}
        {IconAfter && !loading && <IconAfter size={24} className="ml-2" />}
      </div>
      {loading ? (
        <div style={{position: 'absolute'}}>
          <Spinner theme={isTertiaryOnDark ? 'dark' : 'light'} />
        </div>
      ) : null}
    </button>
  );
};
