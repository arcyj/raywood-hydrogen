import { twClasses, twc } from '~/helpers/twMerge';
import type { IInputMethod } from '../ui/FormControl';

export const FormControlTheme = {
  containerStyle: twc`group relative cursor-text transition-all duration-100 ease-linear`,
  input: twc`flex items-stretch justify-center rounded bg-white text-black px-8`,
  inputFocused: twc`focus-within:bg-lowPrimary`,
  inputFilledHover: twc`hover:tablet:bg-lightGrey`,
  inputHovered: twc`hover:tablet:bg-lowPrimary`,
  inputElement: {
    base: twc`peer text-regular-semi text-truncate relative w-full rounded border-0 bg-transparent-full p-0 pt-20 text-black caret-surface-high-brand-active outline-none transition-all duration-200 ease-out focus-within:max-h-48`,
    active: twc`!max-h-48 text-small`,
  },
  border: {
    base: twc`rounded bg-lightGrey border-2 border-accentGrey transition-all duration-100 ease-linear`,
    initial: twc`border-accentGrey focus-within:border-primary focus-within:ring-1 focus-within:ring-lightGrey hover:tablet:border-layout-accent`,
    keyboardFocus: twc`focus-within:border-primary`,
    active: twc`border-primary ring-1 ring-text-layout-focus`,
    error: twc`border-layout-danger`,
    disabled: twc`border-layout-medium`,
  },
  label: {
    base: twc`text-truncate pointer-events-none absolute order-first w-full select-none transition-all duration-200 ease-out peer-focus:text-[13px] peer-focus:leading-[20px] peer-focus:font-bold peer-focus:h-[16px] peer-focus:-translate-y-[10px]`,
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
  activeIcon: twc`fill-primary`,
  defaultIcon: twc`fill-text-layout-high peer-focus:fill-primary`,
  icon: twc`transition-all duration-100 ease-linear group-focus-within:fill-primary group-hover:tablet:fill-primary`,
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
