import { Command } from 'commander';
import { resolve, dirname } from 'node:path';
import { loadMappingConfig } from '../mapping/loader.js';
import { createCsvReader } from '../csv/reader.js';
import { createXmlReader } from '../xml/reader.js';
import { loadMergeTable } from '../merge/loader.js';
import { normalizeKey, toHex } from '../utils/normalize.js';
import { logger } from '../utils/logger.js';

export function registerDiagnoseCommand(program: Command): void {
  program
    .command('diagnose')
    .description('Inspect merge key values from both files to debug mismatches')
    .requiredOption('-i, --input <path>', 'Primary input file (CSV or XML)')
    .requiredOption('-m, --mapping <path>', 'Mapping config JSON file')
    .option('-d, --delimiter <char>', 'CSV delimiter for primary file', ',')
    .option('-n, --rows <number>', 'Number of primary rows to inspect', '20')
    .action(async (opts: {
      input: string;
      mapping: string;
      delimiter: string;
      rows: string;
    }) => {
      const inputPath = opts.input.startsWith('http') ? opts.input : resolve(opts.input);
      const mappingPath = resolve(opts.mapping);
      const maxRows = parseInt(opts.rows, 10);

      const config = await loadMappingConfig(mappingPath);

      if (!config.merge) {
        console.error('No "merge" block found in mapping config.');
        process.exit(1);
      }

      const mergeConfig = config.merge;
      const baseDir = dirname(mappingPath);

      console.log('\n=== Merge Table (secondary file) — first 10 keys ===');
      const table = await loadMergeTable(mergeConfig, baseDir);
      let count = 0;
      for (const [key, row] of table) {
        const rawVal = row[mergeConfig.joinOn.secondary] ?? '';
        console.log(`  raw: ${JSON.stringify(rawVal).padEnd(20)}  normalized: ${JSON.stringify(key).padEnd(20)}  hex: ${toHex(rawVal)}`);
        if (++count >= 10) break;
      }
      console.log(`  ... ${table.size} rows total`);

      console.log(`\n=== Primary File — first ${maxRows} rows (join field: "${mergeConfig.joinOn.primary}") ===`);

      const isXml = /\.xml$/i.test(inputPath) || inputPath.startsWith('http');
      const source: AsyncIterable<Record<string, string>> = isXml && config.xmlReader
        ? createXmlReader(inputPath, config.xmlReader)
        : createCsvReader(inputPath, { delimiter: opts.delimiter });

      let rowIndex = 0;
      for await (const row of source) {
        if (rowIndex >= maxRows) break;
        rowIndex++;

        const rawVal = row[mergeConfig.joinOn.primary] ?? '';
        const normalized = normalizeKey(rawVal);
        const hit = table.has(normalized);

        console.log(
          `  [${String(rowIndex).padStart(3)}] raw: ${JSON.stringify(rawVal).padEnd(20)}` +
          `  normalized: ${JSON.stringify(normalized).padEnd(20)}` +
          `  hex: ${toHex(rawVal).padEnd(60)}` +
          `  match: ${hit ? '✓' : '✗'}`,
        );
      }

      console.log('\nIf hex values differ between matching fields, that is the root cause.');
      console.log('Common culprits: BOM (feff), non-breaking space (00a0), zero-width space (200b).\n');
    });
}
