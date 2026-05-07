import type { FC } from 'react';
import { useTranslation } from '~/lib/i18nContext';

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

export const ProductStockStatus: FC<ProductStockStatusProps> = ({
  availableForSale,
  quantity,
  className = '',
  preorder = false,
}) => {
  const { t } = useTranslation();
  const status = getStatus(availableForSale, quantity, preorder);

  const config = (() => {
    switch (status) {
      case 'in-stock':
        return {
          label: quantity != null && quantity > 0
            ? t('product.stock_count', { count: quantity })
            : t('product.in_stock'),
          circleClass: 'bg-green-500',
        };
      case 'low-stock':
        return {
          label: quantity != null
            ? t('product.low_stock', { count: quantity })
            : t('product.in_stock'),
          circleClass: 'bg-yellow-500',
        };
      case 'preorder':
        return {
          label: t('product.preorder'),
          circleClass: 'bg-yellow-500',
        };
      case 'sold-out':
        return {
          label: t('product.sold_out'),
          circleClass: 'bg-red-500',
        };
    }
  })();

  return (
    <div className={`flex justify-end w-full items-center gap-8 ${className}`} role="status" aria-label={config.label}>
      <span
        className={`inline-block h-8 w-8 shrink-0 rounded-full ${config.circleClass}`}
        aria-hidden
      />
      <span className="text-medium-semi text-gray">{config.label}</span>
    </div>
  );
};
