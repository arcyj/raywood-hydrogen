export class MappingError extends Error {
    field;
    constructor(message, field) {
        super(message);
        this.field = field;
        this.name = 'MappingError';
    }
}
export class ScrapeError extends Error {
    url;
    cause;
    constructor(message, url, cause) {
        super(message);
        this.url = url;
        this.cause = cause;
        this.name = 'ScrapeError';
    }
}
export class CsvParseError extends Error {
    rowIndex;
    cause;
    constructor(message, rowIndex, cause) {
        super(message);
        this.rowIndex = rowIndex;
        this.cause = cause;
        this.name = 'CsvParseError';
    }
}
export class ConfigValidationError extends Error {
    issues;
    constructor(message, issues) {
        super(message);
        this.issues = issues;
        this.name = 'ConfigValidationError';
    }
}
//# sourceMappingURL=errors.js.map