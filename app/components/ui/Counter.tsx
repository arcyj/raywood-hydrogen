import { Add, Remove } from '~/components/icons';
import { twClasses } from '~/helpers/twMerge';
import type { FC, JSX } from 'react';

const CounterStyle = {
  initial: 'flex items-center justify-between w-full',
};

interface ICounterProps {
  count?: number;
  label?: JSX.Element;
  maxCount?: number;
  minCount?: number;
  className?: string;
  incrementDisabled?: boolean;
  decrementDisabled?: boolean;
  countChange?: (newCount: number) => void;
}

export const Counter: FC<ICounterProps> = ({
  count = 1,
  label = <>Label</>,
  maxCount = 50,
  minCount = 0,
  countChange,
  className,
  incrementDisabled,
  decrementDisabled,
}) => {
  const { initial } = CounterStyle;

  const handleIncrement = () => {
    if (count < maxCount) {
      const newCount = count + 1;
      countChange && countChange(newCount);
    }
  };

  const handleDecrement = () => {
    if (count > minCount) {
      countChange && countChange(count - 1);
    }
  };

  const classes = twClasses([initial], {}, className);

  const isMaxCountReached = incrementDisabled || count === maxCount;
  const isMinCountReached = decrementDisabled || count === minCount;

  const buttonClasses = 'rounded-lg p-8 bg-lightGrey hover:bg-surface-low-secondary-active disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className={classes}>
      {label}
      <div className="flex items-center justify-between">
        <button className={buttonClasses} onClick={handleDecrement} disabled={isMinCountReached}>
          <Remove size={24} />
        </button>
        <span className="text-small px-12">{count}</span>
        <button className={buttonClasses} onClick={handleIncrement} disabled={isMaxCountReached}>
          <Add size={24} />
        </button>
      </div>
    </div>
  );
};
