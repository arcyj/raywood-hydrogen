import type { FC, ReactNode } from "react";
import type { IIconProps } from '../icons/icon.types';

interface IBenefitCardProps {
  label?: string | ReactNode;
  Icon?: FC<IIconProps>;
  className?: string;
}

export const BenefitCard: FC <IBenefitCardProps> = ({
  label,
  Icon,
  className
}) => {
  return (
    <div className={`bg-lightGrey rounded-lg flex flex-col items-center px-4 py-12 h-full justify-center ${className}`}>
      { Icon ? <Icon size={96} className="h-[64px]" /> : null }
      <span className="text-medium-semi text-center mt-12">{label}</span>
    </div>
  );
}
