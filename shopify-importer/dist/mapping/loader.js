import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { ConfigValidationError } from '../utils/errors.js';
const FieldScrapeRuleSchema = z.object({
    selector: z.string().min(1),
    attribute: z.string().optional(),
});
const ScrapeConfigSchema = z.object({
    urlColumn: z.string().min(1),
    fields: z.record(z.string(), FieldScrapeRuleSchema),
});
const XmlFieldRuleSchema = z.union([
    z.string(),
    z.object({
        path: z.string().min(1),
        join: z.string().optional(),
    }),
]);
const XmlReaderConfigSchema = z.object({
    itemElement: z.string().min(1),
    fields: z.record(z.string(), XmlFieldRuleSchema),
});
const MergeConfigSchema = z.object({
    file: z.string().min(1),
    format: z.enum(['csv', 'xml', 'auto']).optional(),
    delimiter: z.string().optional(),
    xmlReader: XmlReaderConfigSchema.optional(),
    joinOn: z.object({
        primary: z.string().min(1),
        secondary: z.string().min(1),
    }),
    fields: z.record(z.string(), z.string()),
});
const MappingConfigSchema = z.object({
    columns: z.record(z.string(), z.string()),
    scrape: ScrapeConfigSchema.optional(),
    xmlReader: XmlReaderConfigSchema.optional(),
    merge: MergeConfigSchema.optional(),
});
export async function loadMappingConfig(filePath) {
    let raw;
    try {
        raw = await readFile(filePath, 'utf-8');
    }
    catch (err) {
        throw new ConfigValidationError(`Failed to read mapping file: ${filePath}`, [err instanceof Error ? err.message : String(err)]);
    }
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch (err) {
        throw new ConfigValidationError(`Mapping file is not valid JSON: ${filePath}`, [err instanceof Error ? err.message : String(err)]);
    }
    const result = MappingConfigSchema.safeParse(parsed);
    if (!result.success) {
        const issues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
        throw new ConfigValidationError(`Mapping config validation failed`, issues);
    }
    return result.data;
}
//# sourceMappingURL=loader.js.map