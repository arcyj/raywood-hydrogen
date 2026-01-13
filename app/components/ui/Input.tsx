import { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { inputFieldClasses } from '../themes/FormControlTheme';

import { twClasses } from '~/helpers/twMerge';
import { FormControl } from './FormControl';
import type { IFormControlProps } from './FormControl';
import type { ChangeEvent, ForwardedRef } from 'react';

interface IInputRef {
  focus: () => void;
}

export const Input = forwardRef<IInputRef, IFormControlProps<string>>(
  (
    {
      value,
      size = 'medium',
      error = '',
      tooltip = '',
      disabled = false,
      className = '',
      Icon,
      placeholder,
      hint = '',
      handleChange,
      type = 'text',
      list,
      name,
    },
    ref: ForwardedRef<IInputRef>,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const inputClasses = inputFieldClasses({ focused: isFocused, disabled, value: !!value, placeholder });

    const containerClasses = twClasses(['tw-px-16'], {}, className);

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      inputRef.current?.focus();
    };

    const changeHandler = (ev: ChangeEvent<HTMLInputElement>) => {
      if (handleChange) {
        handleChange(ev.target.value, ev);
      }
    };

    const clearHandler = () => {
      handleChange && handleChange('');
    };

    return (
      <FormControl
        hint={hint}
        error={error}
        className={containerClasses}
        disabled={disabled}
        onClick={handleContainerClick}
        size={size}
      >
        <FormControl.Icon hasValue={!!value} disabled={disabled} Icon={Icon} />
        <FormControl.Label hasValue={!!value} placeholder={placeholder} error={error} disabled={disabled}>
          <input
            name={name}
            aria-label={type}
            type={type}
            ref={inputRef}
            disabled={disabled}
            value={value}
            className={inputClasses}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={changeHandler}
            aria-invalid={!!error}
            aria-errormessage={typeof error === 'string' ? error : undefined}
            autoComplete={type}
            list={list}
          />
        </FormControl.Label>
        <FormControl.Actions
          hasValue={!!value}
          disabled={disabled}
          error={error}
          tooltip={tooltip}
          clearHandler={clearHandler}
        />
      </FormControl>
    );
  },
);

Input.displayName = 'Input';
