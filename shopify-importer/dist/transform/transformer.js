/**
 * Merges mapped columns and scraped fields into a final Shopify row.
 * Scraped fields take precedence over mapped fields for the same key
 * only when the scraped value is non-empty.
 * All string values are trimmed.
 */
export function transformRow(mapped, scraped = {}) {
    const merged = {};
    for (const [key, value] of Object.entries(mapped)) {
        merged[key] = sanitize(value);
    }
    for (const [key, value] of Object.entries(scraped)) {
        const cleaned = sanitize(value);
        if (cleaned !== '') {
            merged[key] = cleaned;
        }
    }
    return merged;
}
/**
 * Derives the ordered list of Shopify CSV headers from a mapping config.
 * Includes all mapped Shopify fields. Excludes the internal urlColumn.
 */
export function deriveHeaders(columns, scrapeFields = {}) {
    const mapped = Object.keys(columns);
    const scraped = Object.keys(scrapeFields);
    const seen = new Set();
    const headers = [];
    for (const h of [...mapped, ...scraped]) {
        if (!seen.has(h)) {
            seen.add(h);
            headers.push(h);
        }
    }
    return headers;
}
function sanitize(value) {
    if (value === undefined || value === null)
        return '';
    return value.trim();
}
//# sourceMappingURL=transformer.js.map