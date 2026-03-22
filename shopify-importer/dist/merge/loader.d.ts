import type { MergeConfig, SupplierRow } from '../types/index.js';
/**
 * Reads the secondary merge file in full and returns a Map keyed by the
 * join column value (trimmed, lowercased) for O(1) per-row lookups.
 */
export declare function loadMergeTable(config: MergeConfig, baseDir: string): Promise<Map<string, SupplierRow>>;
//# sourceMappingURL=loader.d.ts.map