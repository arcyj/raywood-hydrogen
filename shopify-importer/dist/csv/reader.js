import { createReadStream } from 'node:fs';
import { parse } from 'csv-parse';
import { CsvParseError } from '../utils/errors.js';
/**
 * Creates an async iterable that streams rows from a CSV file one at a time.
 * Each row is yielded as a Record<string, string> keyed by header names.
 * Throws CsvParseError on unrecoverable parse failures.
 */
export async function* createCsvReader(filePath, options = {}) {
    const { delimiter = ',', bom = true } = options;
    const fileStream = createReadStream(filePath, { encoding: 'utf-8' });
    const parser = fileStream.pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom,
        delimiter,
        cast: false,
    }));
    try {
        for await (const record of parser) {
            yield record;
        }
    }
    catch (err) {
        throw new CsvParseError(`Failed to parse CSV file: ${filePath}`, undefined, err);
    }
}
//# sourceMappingURL=reader.js.map