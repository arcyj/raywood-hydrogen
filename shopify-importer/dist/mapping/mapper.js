/**
 * Renames supplier row keys to Shopify field names according to the columns map.
 * Keys not present in the columns map are dropped.
 * The scrape urlColumn is preserved as-is when a scrape config is present.
 */
export function mapRow(supplierRow, config) {
    const result = {};
    for (const [shopifyField, supplierColumn] of Object.entries(config.columns)) {
        const value = supplierRow[supplierColumn];
        if (value !== undefined) {
            result[shopifyField] = value;
        }
    }
    if (config.scrape) {
        const urlColumn = config.scrape.urlColumn;
        const urlValue = supplierRow[urlColumn];
        if (urlValue !== undefined) {
            result[urlColumn] = urlValue;
        }
    }
    return result;
}
//# sourceMappingURL=mapper.js.map