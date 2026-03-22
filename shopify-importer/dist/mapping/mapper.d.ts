import type { MappingConfig, SupplierRow, ShopifyRow } from '../types/index.js';
/**
 * Renames supplier row keys to Shopify field names according to the columns map.
 * Keys not present in the columns map are dropped.
 * The scrape urlColumn is preserved as-is when a scrape config is present.
 */
export declare function mapRow(supplierRow: SupplierRow, config: MappingConfig): Partial<ShopifyRow>;
//# sourceMappingURL=mapper.d.ts.map