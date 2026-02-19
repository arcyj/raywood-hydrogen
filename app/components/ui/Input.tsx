import { useRef, forwardRef, useState, useCallback } from 'react';
import { inputFieldClasses } from '../themes/FormControlTheme';

import { twClasses } from '~/helpers/twMerge';
import { FormControl } from './FormControl';
import type { IFormControlProps } from './FormControl';
import type { ChangeEvent, ForwardedRef, MutableRefObject } from 'react';

export const Input = forwardRef<
  HTMLInputElement,
  IFormControlProps<string> & { autoFocus?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; enterKeyHint?: React.HTMLAttributes<HTMLInputElement>['enterKeyHint']; required?: boolean }
>(
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
      autoFocus,
      inputMode,
      enterKeyHint,
      required,
    },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null) as MutableRefObject<HTMLInputElement | null>;
    const [isFocused, setIsFocused] = useState(false);
    const resolvedIcon = Icon as React.FC<any> | undefined;

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref],
    );

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
        <FormControl.Icon hasValue={!!value} disabled={disabled} Icon={resolvedIcon} />
        <FormControl.Label hasValue={!!value} placeholder={placeholder} error={error} disabled={disabled}>
          <input
            name={name}
            aria-label={type}
            type={type}
            ref={setRefs}
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
            autoFocus={autoFocus}
            inputMode={inputMode}
            enterKeyHint={enterKeyHint}
            required={required}
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
