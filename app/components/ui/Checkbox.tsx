import { useCallback, useId } from 'react';
import { twClasses, twc } from '~/helpers/twMerge';
import { SelectionTheme } from '../themes/SelectionTheme';
import type { FC, KeyboardEvent, PropsWithChildren } from 'react';

type ICheckboxLabelSize = 'small' | 'medium' | 'large';
interface IAsapCheckboxProps extends PropsWithChildren {
  className?: string;
  disabled?: boolean;
  onChange?: (newValue: boolean) => void;
  error?: boolean;
  checked?: boolean;
  wrapperClassName?: string;
  ariaLabel?: string;
  size?: ICheckboxLabelSize;
}

interface ICheckmarkIconProps {
  className?: string;
}

const CheckmarkIcon = ({ className }: ICheckmarkIconProps) => (
  <svg
    width="11"
    height="9"
    viewBox="0 0 11 9"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M10.8195 1.59933L9.8566 0.686694C9.72815 0.567044 9.55525 0.5 9.37515 0.5C9.19505 0.5 9.02215 0.567044 8.8937 0.686694L4.21506 5.114L2.12663 3.12344C2.06387 3.06239 1.98859 3.01416 1.90542 2.98173C1.82225 2.94929 1.73296 2.93333 1.64304 2.93482C1.55312 2.93333 1.46383 2.94929 1.38066 2.98173C1.2975 3.01416 1.22221 3.06239 1.15945 3.12344L0.196548 4.03608C0.0705629 4.15795 0 4.32178 0 4.4924C0 4.66302 0.0705629 4.82684 0.196548 4.94871L2.76215 7.40067L3.72505 8.31331L4.2065 8.5L4.68795 8.31331L5.65086 7.40067L10.8035 2.51704C10.9294 2.39517 11 2.23134 11 2.06072C11 1.8901 10.9294 1.72627 10.8035 1.6044L10.8195 1.59933Z" />
  </svg>
);

export const Checkbox: FC<IAsapCheckboxProps> = ({
  className,
  disabled = false,
  onChange,
  error = false,
  checked = false,
  wrapperClassName,
  size = 'large',
  children,
  ariaLabel = 'checkbox',
}) => {
  const {
    selectionStyle: { base, backgroundColor, borderColor },
    iconStyle: { fill },
    wrapperStyle,
    labelStyle,
  } = SelectionTheme;

  const handleChange = useCallback(() => {
    if (!disabled) {
      onChange?.(!checked);
    }
  }, [onChange, disabled, checked]);

  // For accessibility, so it is possible to select checkbox with space
  const handleKeyDownClick = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      const { key } = event;

      if (key === ' ') {
        event.preventDefault(); // Prevent default behavior of spacebar (scrolling the page)
        onChange?.(!checked);
      }

      if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        let target;
        if (key === 'ArrowDown') {
          target = event.currentTarget.parentElement?.nextElementSibling?.firstChild;
        } else {
          target = event.currentTarget.parentElement?.previousElementSibling?.firstChild;
        }
        if (target instanceof HTMLElement) {
          target.focus();
        }
      }
    },
    [onChange, disabled, checked],
  );

  const checkboxClasses = twClasses(
    [base, twc`peer/selection box-border h-[20px] w-[20px] rounded`],
    {
      [backgroundColor.initial]: !disabled,
      [backgroundColor.disabled]: disabled,

      [borderColor.initial]: !disabled && !error && !checked,
      [borderColor.checked]: checked && !disabled && !error,
      [borderColor.error]: error && !disabled,
      [borderColor.disabled]: disabled,
    },
    className,
  );

  const wrapperClasses = twClasses(
    [disabled ? wrapperStyle.cursor.disabled : wrapperStyle.cursor.initial, wrapperStyle.initial],
    {
      [wrapperStyle.base]: !disabled && !error && !checked,
      [wrapperStyle.selected]: !disabled && !error && checked,
    },
    wrapperClassName,
  );

  const labelClasses = twClasses(
    [disabled ? labelStyle.disabled : labelStyle.initial, labelStyle.sizes[size].initial],
    {
      [labelStyle.sizes[size].checked]: !disabled && checked,
    },
  );

  const iconClasses = twClasses(disabled ? [fill.disabled] : [fill.initial]);
  const id = useId();

  return (
    <div className={`${wrapperClasses} checkbox`} onClick={handleChange}>
      <div
        aria-labelledby="checkbox"
        className={checkboxClasses}
        onKeyDown={handleKeyDownClick}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        aria-label={ariaLabel}
      >
        {checked ? <CheckmarkIcon className={iconClasses} /> : null}
      </div>

      {children && (
        <label className={labelClasses} htmlFor={id}>
          {children}
        </label>
      )}
    </div>
  );
};
