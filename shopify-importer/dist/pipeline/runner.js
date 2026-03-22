import { dirname, resolve } from 'node:path';
import { loadMappingConfig } from '../mapping/loader.js';
import { mapRow } from '../mapping/mapper.js';
import { createCsvReader } from '../csv/reader.js';
import { createXmlReader } from '../xml/reader.js';
import { createCsvWriter } from '../csv/writer.js';
import { createScrapeQueue } from '../scraping/queue.js';
import { transformRow, deriveHeaders } from '../transform/transformer.js';
import { loadMergeTable } from '../merge/loader.js';
import { mergeRow } from '../merge/merger.js';
import { logger } from '../utils/logger.js';
function rowMatchesFilters(row, filters) {
    return filters.every(({ column, value }) => {
        const cellValue = row[column] ?? '';
        return cellValue.trim().toLowerCase() === value.trim().toLowerCase();
    });
}
function resolveInputFormat(inputPath, explicit) {
    if (explicit === 'csv' || explicit === 'xml')
        return explicit;
    if (/\.xml$/i.test(inputPath))
        return 'xml';
    if (inputPath.startsWith('http://') || inputPath.startsWith('https://'))
        return 'xml';
    return 'csv';
}
export async function runPipeline(options) {
    const { inputPath, outputPath, mappingPath, concurrency, delimiter, inputFormat, verbose, filters } = options;
    if (verbose) {
        const { setLogLevel } = await import('../utils/logger.js');
        setLogLevel('debug');
    }
    logger.info(`Loading mapping config from: ${mappingPath}`);
    const config = await loadMappingConfig(mappingPath);
    const format = resolveInputFormat(inputPath, inputFormat);
    logger.info(`Input format: ${format}`);
    if (format === 'xml' && !config.xmlReader) {
        throw new Error(`Input format is XML but mapping config is missing an "xmlReader" block. ` +
            `Add an "xmlReader" section to your mapping JSON.`);
    }
    const headers = deriveHeaders(config.columns, config.scrape?.fields ?? {});
    logger.info(`Output headers: ${headers.join(', ')}`);
    if (filters.length > 0) {
        const filterDesc = filters.map((f) => `"${f.column}" = "${f.value}"`).join(' AND ');
        logger.info(`Active filters: ${filterDesc}`);
    }
    const mergeTable = config.merge
        ? await loadMergeTable(config.merge, dirname(resolve(mappingPath)))
        : null;
    if (mergeTable) {
        logger.info(`Merge enabled: joining on primary["${config.merge.joinOn.primary}"] = secondary["${config.merge.joinOn.secondary}"]`);
        logger.info(`Merging fields: ${Object.keys(config.merge.fields).join(', ')}`);
    }
    const queue = config.scrape ? createScrapeQueue(concurrency) : null;
    const writer = createCsvWriter(outputPath, headers);
    const result = { processed: 0, failed: 0, skipped: 0, mergeMatched: 0, mergeMissed: 0 };
    const inFlight = [];
    async function processRow(row, rowIndex) {
        try {
            let enriched = row;
            if (mergeTable && config.merge) {
                const mergeResult = mergeRow(row, mergeTable, config.merge);
                enriched = mergeResult.row;
                if (mergeResult.matched) {
                    result.mergeMatched++;
                }
                else {
                    result.mergeMissed++;
                }
            }
            const mapped = mapRow(enriched, config);
            let scraped = {};
            if (queue && config.scrape) {
                const urlColumn = config.scrape.urlColumn;
                const url = mapped[urlColumn] ?? row[urlColumn] ?? '';
                if (!url) {
                    logger.warn(`Row ${rowIndex}: missing URL in column "${urlColumn}", skipping scrape`);
                    result.skipped++;
                }
                else {
                    logger.debug(`Row ${rowIndex}: scraping ${url}`);
                    try {
                        const scrapeResult = await queue.enqueue(url, config.scrape);
                        scraped = scrapeResult.fields;
                        if (scrapeResult.errors.length > 0) {
                            for (const e of scrapeResult.errors) {
                                logger.warn(`Row ${rowIndex}: ${e}`);
                            }
                        }
                    }
                    catch (err) {
                        logger.error(`Row ${rowIndex}: scrape failed for ${url}`, err);
                        result.failed++;
                    }
                    delete mapped[urlColumn];
                }
            }
            const shopifyRow = transformRow(mapped, scraped);
            await writer.write(shopifyRow);
            result.processed++;
            if (result.processed % 100 === 0) {
                logger.info(`Progress: ${result.processed} rows written...`);
            }
        }
        catch (err) {
            logger.error(`Row ${rowIndex}: processing failed`, err);
            result.failed++;
        }
    }
    logger.info(`Starting pipeline: ${inputPath} → ${outputPath}`);
    const rowSource = format === 'xml'
        ? createXmlReader(inputPath, config.xmlReader)
        : createCsvReader(inputPath, { delimiter });
    let rowIndex = 0;
    for await (const row of rowSource) {
        rowIndex++;
        if (filters.length > 0 && !rowMatchesFilters(row, filters)) {
            result.skipped++;
            continue;
        }
        const promise = processRow(row, rowIndex).then(() => {
            const idx = inFlight.indexOf(promise);
            if (idx !== -1)
                inFlight.splice(idx, 1);
        });
        inFlight.push(promise);
        if (inFlight.length >= concurrency * 4) {
            await Promise.race(inFlight);
        }
    }
    await Promise.all(inFlight);
    await writer.end();
    return result;
}
//# sourceMappingURL=runner.js.map