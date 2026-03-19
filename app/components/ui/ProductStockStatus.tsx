import type { FC } from 'react';

type StockStatus = 'in-stock' | 'low-stock' | 'sold-out' | 'preorder';

interface ProductStockStatusProps {
  preorder?: boolean;
  /** Whether the variant is available for sale (from Storefront API) */
  availableForSale: boolean;
  /** Optional quantity – when provided, drives green (>10), yellow (1–10), red (0). When omitted, only in-stock vs sold-out is shown. */
  quantity?: number | null;
  /** Optional class name for the wrapper */
  className?: string;
}

function getStatus(availableForSale: boolean, quantity: number | null | undefined, preorder: boolean): StockStatus {
  if(preorder){
    return 'preorder';
  }
  if (quantity !== undefined && quantity !== null) {
    if (quantity === 0) return 'sold-out';
    if (quantity <= 10) return 'low-stock';
    return 'in-stock';
  }
  return availableForSale ? 'in-stock' : 'sold-out';
}

function getStatusConfig(status: StockStatus, quantity: number | null | undefined, preorder: boolean) {
  switch (status) {
    case 'in-stock':
      return {
        label: quantity != null && quantity > 0 ? `${quantity} in stock` : 'In stock',
        circleClass: 'bg-green-500',
      };
    case 'low-stock':
      return {
        label: quantity != null ? `Only ${quantity} left` : 'Low stock',
        circleClass: 'bg-yellow-500',
      };
    case 'preorder':
      return {
        label: 'pre order',
        circleClass: 'bg-yellow-500',
      };
    case 'sold-out':
      return {
        label: 'Sold out',
        circleClass: 'bg-red-500',
      };
  }
}

export const ProductStockStatus: FC<ProductStockStatusProps> = ({
  availableForSale,
  quantity,
  className = '',
  preorder = false,
}) => {
  const status = getStatus(availableForSale, quantity, preorder);
  const { label, circleClass } = getStatusConfig(status, quantity, preorder);

  return (
    <div className={`flex justify-end w-full items-center gap-8 ${className}`} role="status" aria-label={label}>
      <span
        className={`inline-block h-8 w-8 shrink-0 rounded-full ${circleClass}`}
        aria-hidden
      />
      <span className="text-medium-semi text-gray">{label}</span>
    </div>
  );
};
