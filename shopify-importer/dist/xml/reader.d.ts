import type { SupplierRow, XmlReaderConfig, XmlFieldRule } from '../types/index.js';
/**
 * Creates an async iterable that yields one SupplierRow per XML item element.
 * The source can be a local file path or an HTTP/HTTPS URL.
 */
export declare function createXmlReader(source: string, config: XmlReaderConfig): AsyncIterable<SupplierRow>;
export type { XmlFieldRule };
//# sourceMappingURL=reader.d.ts.map