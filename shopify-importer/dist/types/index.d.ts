export type SupplierRow = Record<string, string>;
export type ShopifyRow = Record<string, string>;
export type InputFormat = 'csv' | 'xml' | 'auto';
export interface FieldScrapeRule {
    selector: string;
    attribute?: string;
}
export interface ScrapeConfig {
    urlColumn: string;
    fields: Record<string, FieldScrapeRule>;
}
export interface XmlFieldRule {
    /** Dot-notation path within the item element, e.g. "IMAGES.IMAGE_URL" */
    path: string;
    /** When the path resolves to an array, join all values with this separator instead of taking only the first */
    join?: string;
}
export interface XmlReaderConfig {
    /** Name of the XML element that represents one product, e.g. "item" */
    itemElement: string;
    /**
     * Maps flat supplier field names to XML paths inside each item element.
     * Values can be a simple element name ("NAME") or a dot-path ("IMAGES.IMAGE_URL").
     */
    fields: Record<string, string | XmlFieldRule>;
}
export interface MergeConfig {
    /** Path to the secondary file (CSV or XML). Relative paths resolved from cwd. */
    file: string;
    /** Force input format. Auto-detected from file extension if omitted. */
    format?: InputFormat;
    /** Delimiter for CSV secondary files. Defaults to ','. */
    delimiter?: string;
    /** xmlReader config when the secondary file is XML */
    xmlReader?: XmlReaderConfig;
    /** How to match rows between the two files */
    joinOn: {
        /** Field name in the primary SupplierRow to match on */
        primary: string;
        /** Column name in the secondary file to match against */
        secondary: string;
    };
    /**
     * Fields to copy from the secondary row into the primary SupplierRow.
     * Key   = name to assign in the primary row (then referenced by `columns`).
     * Value = column name in the secondary file to read the value from.
     */
    fields: Record<string, string>;
}
export interface MappingConfig {
    columns: Record<string, string>;
    scrape?: ScrapeConfig;
    xmlReader?: XmlReaderConfig;
    merge?: MergeConfig;
}
export interface RowFilter {
    column: string;
    value: string;
}
export interface PipelineOptions {
    inputPath: string;
    outputPath: string;
    mappingPath: string;
    concurrency: number;
    delimiter: string;
    inputFormat: InputFormat;
    verbose: boolean;
    filters: RowFilter[];
}
export interface PipelineResult {
    processed: number;
    failed: number;
    skipped: number;
    mergeMatched: number;
    mergeMissed: number;
}
export interface ScrapeResult {
    fields: Partial<ShopifyRow>;
    errors: string[];
}
//# sourceMappingURL=index.d.ts.map