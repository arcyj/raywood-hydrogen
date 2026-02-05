import { twClasses, twc } from '~/helpers/twMerge';
import type { IInputMethod } from '../ui/FormControl';

export const FormControlTheme = {
  containerStyle: twc`group relative cursor-text transition-all duration-100 ease-linear`,
  input: twc`flex items-stretch justify-center rounded bg-background text-black`,
  inputFocused: twc`focus-within:bg-surface-low-brand-focus`,
  inputFilledHover: twc`hover:tablet:bg-surface-low-brand-focus`,
  inputHovered: twc`hover:tablet:bg-surface-low-brand-active`,
  inputElement: {
    base: twc`peer text-regular-semi text-truncate relative w-full rounded border-0 bg-transparent-full p-0 pt-20 text-[16px] text-black caret-surface-high-brand-active outline-none transition-all duration-200 ease-out focus-within:max-h-48`,
    active: twc`!max-h-48 text-small`,
  },
  border: {
    base: twc`rounded bg-lightGrey border-2 border-lightGrey transition-all duration-100 ease-linear`,
    initial: twc`border-layout-high focus-within:border-lightGrey focus-within:ring-1 focus-within:ring-lightGrey hover:tablet:border-layout-accent`,
    keyboardFocus: twc`border-layout-high focus-within:glow-focus`,
    active: twc`border-layout-focus ring-1 ring-text-layout-focus`,
    error: twc`border-layout-danger`,
    disabled: twc`border-layout-medium`,
  },
  label: {
    base: twc`text-truncate pointer-events-none absolute order-first w-full select-none transition-all duration-200 ease-out peer-focus:text-label-s peer-focus:h-[16px] peer-focus:-translate-y-[10px]`,
    notActive: twc`text-regular-semi text-black`,
    active: twc`text-small h-[16px] -translate-y-[10px]`,
    color: {
      common: twc`text-black`,
      error: twc`text-text-layout-danger`,
      disabled: twc`text-text-layout-high`,
    },
  },
  systemMessageStyle: twc`pl-4 pt-4`,
  dropdownText: twc`text-body-regular`,
  activeIcon: twc`fill-text-layout-focus`,
  defaultIcon: twc`fill-text-layout-high peer-focus:fill-text-layout-focus`,
  icon: twc`transition-all duration-100 ease-linear group-focus-within:fill-text-layout-focus group-hover:tablet:fill-text-layout-accent`,
  errorStyle: {
    container: twc`border-layout-danger`,
    hint: twc`text-text-layout-danger`,
    icon: twc`fill-text-layout-danger`,
  },
  disabledStyle: {
    container: twc`pointer-events-none cursor-not-allowed bg-foreground-lowest`,
    input: twc`text-text-layout-strong`,
    hint: twc`text-text-layout-strong`,
    icon: twc`fill-text-layout-high group-hover:fill-text-layout-high`,
  },
  hintStyle: twc`text-footnote-regular m-0 pl-12`,
  noPlaceholderStyle: twc`!pt-0`,
};

interface IInputFieldClassesParams {
  focused?: boolean;
  disabled: boolean;
  value: boolean;
  placeholder?: string;
}

export const inputFieldClasses = ({ focused, disabled, value, placeholder }: IInputFieldClassesParams) =>
  twClasses(FormControlTheme.inputElement['base'], {
    [FormControlTheme.inputElement['active']]: value || !!focused,
    [FormControlTheme.disabledStyle['input']]: disabled,
    [FormControlTheme.noPlaceholderStyle]: !placeholder,
  });

export const inputLabelClasses = ({
  active,
  error,
  disabled = false,
}: {
  active: boolean;
  error: boolean;
  disabled?: boolean;
}) =>
  twClasses([FormControlTheme.label['base']], {
    [FormControlTheme.label['notActive']]: !active,
    [FormControlTheme.label['active']]: active,
    [FormControlTheme.label.color.common]: (!error && !disabled) || (disabled && !active),
    [FormControlTheme.label.color.error]: error && !disabled,
    [FormControlTheme.label.color.disabled]: disabled && active,
  });

export const inputBorderClasses = ({
  error,
  disabled,
  active,
  inputMethod,
}: {
  error: boolean;
  disabled: boolean;
  active: boolean;
  inputMethod: IInputMethod;
}) =>
  twClasses([FormControlTheme.border['base']], {
    [FormControlTheme.border['initial']]: !error && !disabled && !active && inputMethod === 'mouse',
    [FormControlTheme.border['keyboardFocus']]:
      (!error && !disabled && !active && inputMethod === 'keyboard') ||
      (error && !disabled && inputMethod === 'keyboard'),
    [FormControlTheme.border['active']]: active,
    [FormControlTheme.border['error']]: error && !disabled && inputMethod === 'mouse',
    [FormControlTheme.border['disabled']]: disabled,
  });

export const inputIconClasses = ({ active, disabled }: { active: boolean; disabled: boolean }) =>
  twClasses([FormControlTheme.icon], {
    [FormControlTheme.activeIcon]: active,
    [FormControlTheme.defaultIcon]: !active,
    [FormControlTheme.disabledStyle['icon']]: disabled,
  });

export const inputErrorIconClasses = ({ disabled }: { disabled: boolean }) =>
  twClasses([FormControlTheme.errorStyle.icon], {
    [FormControlTheme.disabledStyle['icon']]: disabled,
  });
