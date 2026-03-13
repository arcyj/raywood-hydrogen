import { Add, Remove } from '~/components/icons';
import { twClasses } from '~/helpers/twMerge';
import type { FC, JSX } from 'react';
import { IconButton } from './IconButton';

const CounterStyle = {
  initial: 'flex items-center justify-between',
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
  label = <></>,
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

  const buttonClasses = 'rounded-lg p-8 hover:bg-surface-low-secondary-active disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className={classes}>
      {label}
      <div className="flex items-center justify-between">
        <IconButton size="small" variant='filled' Icon={Remove} className={buttonClasses} onClick={handleDecrement} disabled={isMinCountReached}/>
        <span className="text-small px-12">{count}</span>
        <IconButton size="small" variant='filled' Icon={Add} className={buttonClasses} onClick={handleIncrement} disabled={isMaxCountReached}/>
      </div>
    </div>
  );
};
