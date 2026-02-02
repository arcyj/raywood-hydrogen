import type {FC, ReactNode} from 'react';
import {twClasses} from '~/helpers/twMerge';
import {ToggleGroup as RadixToggleGroup} from 'radix-ui';
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
} from '@radix-ui/react-icons';

interface IToggleGorupProps {
  value?: string;
  defaultValue?: string;
  onValueChange: (value: string) => void;
  ariaLabel?: string;
  children: ReactNode;
}

interface IToggleGorupItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const ToggleGroup: FC<IToggleGorupProps> & {
  Item: FC<IToggleGorupItemProps>;
} = ({
  value,
  defaultValue,
  onValueChange,
  ariaLabel,
  children,
}) => {
  return(
    <RadixToggleGroup.Root
      className="inline-flex space-x-px rounded bg-lightGrey border-3 border-lightGrey"
      type="single"
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      aria-label={ariaLabel}
    >
      {children}
    </RadixToggleGroup.Root>
  )
};

const ToggleGroupItem: FC<IToggleGorupItemProps> = ({value, children, className}) => {
  const classes = twClasses(
    [
      'flex size-[35px] active:bg-accentGrey cursor-pointer hover:inset-shadow-sm hover:bg-inset-shadow-gray items-center justify-center first:rounded-l last:rounded-r hover:bg-violet3 focus:z-10 focus:outline-none data-[state=on]:bg-white data-[state=on]:shadow-inset',
    ],
    {},
    className,
  );

  return (
    <RadixToggleGroup.Item className={classes} value={value}>
      {children}
    </RadixToggleGroup.Item>
  );
};

ToggleGroup.Item = ToggleGroupItem
