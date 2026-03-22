export declare class MappingError extends Error {
    readonly field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
export declare class ScrapeError extends Error {
    readonly url?: string | undefined;
    readonly cause?: unknown | undefined;
    constructor(message: string, url?: string | undefined, cause?: unknown | undefined);
}
export declare class CsvParseError extends Error {
    readonly rowIndex?: number | undefined;
    readonly cause?: unknown | undefined;
    constructor(message: string, rowIndex?: number | undefined, cause?: unknown | undefined);
}
export declare class ConfigValidationError extends Error {
    readonly issues?: string[] | undefined;
    constructor(message: string, issues?: string[] | undefined);
}
//# sourceMappingURL=errors.d.ts.map