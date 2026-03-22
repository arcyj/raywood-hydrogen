#!/usr/bin/env node
import { Command } from 'commander';
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runPipeline } from '../pipeline/runner.js';
import { logger } from '../utils/logger.js';
import { registerDiagnoseCommand } from './diagnose.js';
import type { InputFormat, RowFilter } from '../types/index.js';

function parseFilter(raw: string, previous: RowFilter[]): RowFilter[] {
  const eqIndex = raw.indexOf('=');
  if (eqIndex === -1) {
    console.error(`Error: --filter must be in the format "Column=Value", got: ${raw}`);
    process.exit(1);
  }
  const column = raw.slice(0, eqIndex).trim();
  const value = raw.slice(eqIndex + 1).trim();
  if (!column) {
    console.error(`Error: --filter column name cannot be empty: ${raw}`);
    process.exit(1);
  }
  return [...previous, { column, value }];
}

function isUrl(input: string): boolean {
  return input.startsWith('http://') || input.startsWith('https://');
}

async function assertFileExists(filePath: string, label: string): Promise<void> {
  try {
    await access(filePath);
  } catch {
    console.error(`Error: ${label} file not found: ${filePath}`);
    process.exit(1);
  }
}

const program = new Command();

program
  .name('shopify-importer')
  .description('Convert supplier CSV or XML files (or URLs) into Shopify-compatible CSV')
  .version('1.0.0')
  .enablePositionalOptions();

program
  .option('-i, --input <path|url>', 'Supplier input: file path (.csv or .xml) or HTTP/HTTPS URL')
  .option('-o, --output <path>', 'Path for the Shopify output CSV file')
  .option('-m, --mapping <path>', 'Path to the JSON mapping config file')
  .option('-c, --concurrency <number>', 'Max concurrent scrape requests', '5')
  .option('-d, --delimiter <char>', 'CSV field delimiter character (CSV only)', ',')
  .option(
    '--input-format <csv|xml>',
    'Force input format. Auto-detected from file extension or URL if omitted.',
    'auto',
  )
  .option(
    '-f, --filter <column=value>',
    'Filter rows by supplier column value (repeatable, case-insensitive). Example: --filter "BRAND=Carrera"',
    parseFilter,
    [] as RowFilter[],
  )
  .option('-v, --verbose', 'Enable debug logging', false)
  .action(async (opts: {
    input?: string;
    output?: string;
    mapping?: string;
    concurrency: string;
    delimiter: string;
    inputFormat: string;
    filter: RowFilter[];
    verbose: boolean;
  }) => {
    if (!opts.input) { console.error('error: required option \'-i, --input <path|url>\' not specified'); process.exit(1); }
    if (!opts.output) { console.error('error: required option \'-o, --output <path>\' not specified'); process.exit(1); }
    if (!opts.mapping) { console.error('error: required option \'-m, --mapping <path>\' not specified'); process.exit(1); }

    const inputRaw = opts.input;
    const inputPath = isUrl(inputRaw) ? inputRaw : resolve(inputRaw);
    const outputPath = resolve(opts.output);
    const mappingPath = resolve(opts.mapping);
    const concurrency = parseInt(opts.concurrency, 10);
    const { delimiter, verbose } = opts;
    const filters = opts.filter;

    if (!['csv', 'xml', 'auto'].includes(opts.inputFormat)) {
      console.error(`Error: --input-format must be "csv", "xml", or "auto"`);
      process.exit(1);
    }
    const inputFormat = opts.inputFormat as InputFormat;

    if (isNaN(concurrency) || concurrency < 1) {
      console.error('Error: --concurrency must be a positive integer');
      process.exit(1);
    }

    if (!isUrl(inputRaw)) {
      await assertFileExists(inputPath, 'Input file');
    }
    await assertFileExists(mappingPath, 'Mapping config');

    logger.info(`shopify-importer starting`);
    logger.info(`  Input:        ${inputPath}`);
    logger.info(`  Output:       ${outputPath}`);
    logger.info(`  Mapping:      ${mappingPath}`);
    logger.info(`  Concurrency:  ${concurrency}`);
    logger.info(`  Input format: ${inputFormat}`);
    if (inputFormat === 'csv' || (inputFormat === 'auto' && !isUrl(inputRaw) && !/\.xml$/i.test(inputRaw))) {
      logger.info(`  Delimiter:    "${delimiter}"`);
    }
    if (filters.length > 0) {
      logger.info(`  Filters:      ${filters.map((f) => `${f.column}=${f.value}`).join(', ')}`);
    }

    const startTime = Date.now();

    try {
      const result = await runPipeline({
        inputPath,
        outputPath,
        mappingPath,
        concurrency,
        delimiter,
        inputFormat,
        verbose,
        filters,
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log('\n--- Summary ---');
      console.log(`  Processed : ${result.processed}`);
      console.log(`  Failed    : ${result.failed}`);
      console.log(`  Skipped   : ${result.skipped}`);
      if (result.mergeMatched > 0 || result.mergeMissed > 0) {
        console.log(`  Merge hit : ${result.mergeMatched}`);
        console.log(`  Merge miss: ${result.mergeMissed} (EAN not found in secondary file)`);
      }
      console.log(`  Time      : ${elapsed}s`);
      console.log(`  Output    : ${outputPath}`);

      if (result.processed === 0 && result.failed > 0) {
        process.exit(1);
      }
    } catch (err) {
      logger.error('Pipeline failed with fatal error', err);
      process.exit(1);
    }
  });

registerDiagnoseCommand(program);

program.parseAsync(process.argv).catch((err: unknown) => {
  logger.error('Unexpected CLI error', err);
  process.exit(1);
});
