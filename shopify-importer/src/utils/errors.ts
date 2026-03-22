export class MappingError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = 'MappingError';
  }
}

export class ScrapeError extends Error {
  constructor(
    message: string,
    public readonly url?: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ScrapeError';
  }
}

export class CsvParseError extends Error {
  constructor(
    message: string,
    public readonly rowIndex?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'CsvParseError';
  }
}

export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public readonly issues?: string[],
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}
