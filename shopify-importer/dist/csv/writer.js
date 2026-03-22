import { createWriteStream } from 'node:fs';
import { stringify } from 'csv-stringify';
/**
 * Creates a streaming CSV writer. Headers are written once on the first write.
 * Backpressure is respected: write() resolves only when the underlying stream
 * is ready to accept more data.
 */
export function createCsvWriter(filePath, headers) {
    const fileStream = createWriteStream(filePath, { encoding: 'utf-8' });
    const stringifier = stringify({
        header: true,
        columns: headers,
    });
    stringifier.pipe(fileStream);
    function write(row) {
        return new Promise((resolve, reject) => {
            const orderedRow = headers.map((h) => row[h] ?? '');
            const canContinue = stringifier.write(orderedRow, (err) => {
                if (err)
                    reject(err);
            });
            if (canContinue) {
                resolve();
            }
            else {
                stringifier.once('drain', resolve);
            }
        });
    }
    function end() {
        return new Promise((resolve, reject) => {
            stringifier.end((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                fileStream.end((writeErr) => {
                    if (writeErr)
                        reject(writeErr);
                    else
                        resolve();
                });
            });
        });
    }
    return { write, end };
}
//# sourceMappingURL=writer.js.map