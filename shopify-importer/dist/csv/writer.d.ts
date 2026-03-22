import type { ShopifyRow } from '../types/index.js';
export interface CsvWriter {
    write(row: ShopifyRow): Promise<void>;
    end(): Promise<void>;
}
/**
 * Creates a streaming CSV writer. Headers are written once on the first write.
 * Backpressure is respected: write() resolves only when the underlying stream
 * is ready to accept more data.
 */
export declare function createCsvWriter(filePath: string, headers: string[]): CsvWriter;
//# sourceMappingURL=writer.d.ts.map