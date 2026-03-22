import { createWriteStream, type WriteStream } from 'node:fs';
import { stringify } from 'csv-stringify';
import type { Stringifier } from 'csv-stringify';
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
export function createCsvWriter(filePath: string, headers: string[]): CsvWriter {
  const fileStream: WriteStream = createWriteStream(filePath, { encoding: 'utf-8' });

  const stringifier: Stringifier = stringify({
    header: true,
    columns: headers,
  });

  stringifier.pipe(fileStream);

  function write(row: ShopifyRow): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const orderedRow = headers.map((h) => row[h] ?? '');
      const canContinue = stringifier.write(orderedRow, (err) => {
        if (err) reject(err);
      });

      if (canContinue) {
        resolve();
      } else {
        stringifier.once('drain', resolve);
      }
    });
  }

  function end(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      stringifier.end((err?: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        fileStream.end((writeErr?: Error | null) => {
          if (writeErr) reject(writeErr);
          else resolve();
        });
      });
    });
  }

  return { write, end };
}
