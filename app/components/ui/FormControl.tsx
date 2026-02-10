import { useEffect, useState } from 'react';
import { twClasses } from '~/helpers/twMerge';
import { Error, Warning } from '../icons';
import {
  FormControlTheme,
  inputBorderClasses,
  inputErrorIconClasses,
  inputIconClasses,
  inputLabelClasses,
} from '../themes/FormControlTheme';
import type { IIconProps } from '../icons/icon.types';
import type { ChangeEvent, FC, PropsWithChildren, ReactNode, JSX, HTMLInputTypeAttribute } from 'react';

type IFormControlSize = 'large' | 'medium';
export type IInputMethod = 'mouse' | 'keyboard';

interface IFormControlProps extends PropsWithChildren {
  hint?: string;
  error?: boolean | string;
  disabled?: boolean;
  className?: string;
  active?: boolean;
  size?: IFormControlSize;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClickCapture?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export interface RadixIconProps extends React.SVGAttributes<SVGElement> {
    children?: never;
    color?: string;
}

interface IFormcontrolCoreProps {
  hasValue?: boolean;
  className?: string;
  type?: HTMLInputTypeAttribute;
  Icon?: FC<IIconProps> | React.ForwardRefExoticComponent<RadixIconProps & React.RefAttributes<SVGSVGElement>>;
  disabled?: boolean;
  tooltip?: JSX.Element | string;
  tooltipContentClassName?: string;
  size?: IFormControlSize;
  placeholder?: string;
  error?: string | boolean;
}

export interface IFormControlProps<T> extends IFormcontrolCoreProps {
  hint?: string;
  value?: T;
  name?: string;
  list?: string;
  handleChange?: (value: T, e?: ChangeEvent) => void;
}

interface IFormControlContentProps {
  inputRef?: React.RefObject<HTMLInputElement>;
  children?: ReactNode;
  className?: string;
}

interface IFormControlLabelProps {
  error?: string | boolean;
  placeholder?: string;
  hasValue?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  onClick?: () => void;
}

interface IFormControlIconProps {
  disabled: boolean;
  hasValue?: boolean;
  Icon?: FC<IIconProps> | React.ForwardRefExoticComponent<RadixIconProps & React.RefAttributes<SVGSVGElement>>;
}

interface IFormControlActionsProps extends PropsWithChildren {
  hasValue: boolean;
  disabled: boolean;
  tooltip?: JSX.Element | string;
  tooltipContentClassName?: string;
  error?: string | boolean;
  clearHandler?: () => void;
}

interface IChildElements {
  Icon: FC<IFormControlIconProps>;
  Actions: FC<IFormControlActionsProps>;
  Label: FC<IFormControlLabelProps>;
  Content: FC<IFormControlContentProps>;
}

const FormControlIcon: FC<IFormControlIconProps> = ({ hasValue = false, disabled, Icon }) => {
  const iconClasses = inputIconClasses({ active: hasValue, disabled });

  if (!Icon) return null;

  return (
    <div className="flex shrink items-center justify-center pr-8">
      <Icon className={iconClasses} />
    </div>
  );
};

const FormControlActions: FC<IFormControlActionsProps> = ({
  tooltipContentClassName = '',
  hasValue,
  disabled,
  error,
  tooltip,
  clearHandler,
}) => {
  const errorIconClasses = inputErrorIconClasses({
    disabled,
  });

  return (
    <div className="flex shrink">
      <div className="flex items-center justify-end">
        {hasValue && !disabled && clearHandler ? (
          <button
            type="button"
            onClick={() => clearHandler && clearHandler()}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            className="group/close invisible cursor-pointer items-center justify-center rounded-full border-0 bg-transparent-full p-0 focus-visible:glow-focus group-focus-within:visible group-focus-within:flex"
          >
            <Error className="fill-gray" size={20} />
          </button>
        ) : null}
        {error ? <Warning size={20} className={errorIconClasses} /> : null}
      </div>
    </div>
  );
};

const FormControlLabel: FC<IFormControlLabelProps> = ({
  error,
  placeholder,
  hasValue = false,
  children,
  className,
  inputRef,
  disabled = false,
  onClick,
}) => {
  const formControlLabelContainerClasses = twClasses(
    ['relative top-0 flex h-full w-full min-w-0 grow flex-col justify-center'],
    {},
    className,
  );

  const labelClasses = inputLabelClasses({
    active: hasValue,
    error: !!error,
    disabled: !!disabled,
  });

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (inputRef && inputRef?.current) {
      inputRef?.current.focus();
    }
  };

  return (
    <div onClick={handleClick} className={formControlLabelContainerClasses}>
      {children}
      {placeholder ? <label className={labelClasses}>{placeholder}</label> : null}
    </div>
  );
};

const FormControlContent: FC<IFormControlContentProps> = ({ children, className = '', inputRef }) => {
  const { inputHovered } = FormControlTheme;

  const formControlLabelContainerClasses = twClasses(
    ['flex h-full w-full items-center', inputHovered],
    {},
    className,
  );

  const handleClick = () => {
    if (inputRef && inputRef?.current) {
      inputRef?.current.focus();
    }
  };

  return (
    <div onClick={handleClick} className={formControlLabelContainerClasses}>
      {children}
    </div>
  );
};

export const FormControl: FC<IFormControlProps> & IChildElements = ({
  hint,
  error,
  disabled,
  className,
  children,
  onClick,
  onClickCapture,
  size = 'medium',
  active = false,
}) => {
  const [inputMethod, setInputMethod] = useState<IInputMethod>('mouse');
  const { systemMessageStyle, input, containerStyle, inputHovered, inputFocused, disabledStyle } = FormControlTheme;

  // Listen for mousedown and keydown events
  useEffect(() => {
    const handleMousedown = () => setInputMethod('mouse');
    const handleKeydown = () => setInputMethod('keyboard');

    window.addEventListener('mousedown', handleMousedown);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('mousedown', handleMousedown);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const borderClasses = inputBorderClasses({ error: !!error, disabled: !!disabled, active, inputMethod });

  const containerClasses = twClasses(
    [input, inputFocused, inputHovered, containerStyle, borderClasses, 'FormControl'],
    {
      ['h-56']: size === 'large',
      ['h-48']: size !== 'large',
      [disabledStyle['container']]: !!disabled,
      ['bg-surface-low-brand-focus']: active,
    },
    className,
  );

  return (
    <>
      <div className={containerClasses} onClick={onClick} onClickCapture={onClickCapture}>
        <div className="flex w-full items-center">{children}</div>
      </div>
      {error && typeof error === 'string' ? (
        {error}
      ) : null}
      {!error && hint ? {hint} : null}
    </>
  );
};

FormControl.Icon = FormControlIcon;
FormControl.Actions = FormControlActions;
FormControl.Label = FormControlLabel;
FormControl.Content = FormControlContent;
