import type { SupplierRow } from '../types/index.js';
export interface CsvReaderOptions {
    delimiter?: string;
    bom?: boolean;
}
/**
 * Creates an async iterable that streams rows from a CSV file one at a time.
 * Each row is yielded as a Record<string, string> keyed by header names.
 * Throws CsvParseError on unrecoverable parse failures.
 */
export declare function createCsvReader(filePath: string, options?: CsvReaderOptions): AsyncIterable<SupplierRow>;
//# sourceMappingURL=reader.d.ts.map