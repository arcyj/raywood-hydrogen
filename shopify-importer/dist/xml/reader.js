import { readFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { logger } from '../utils/logger.js';
const HTTP_TIMEOUT_MS = 30_000;
/**
 * Fetches raw XML content from a file path or HTTP/HTTPS URL.
 */
async function fetchXmlContent(source) {
    if (source.startsWith('http://') || source.startsWith('https://')) {
        logger.info(`Fetching XML from URL: ${source}`);
        const response = await axios.get(source, {
            responseType: 'text',
            timeout: HTTP_TIMEOUT_MS,
            headers: { Accept: 'application/xml, text/xml, */*' },
        });
        return response.data;
    }
    logger.info(`Reading XML from file: ${source}`);
    return readFile(source, 'utf-8');
}
/**
 * Recursively searches the parsed XML tree for all elements matching elementName
 * and returns them as a flat array.
 */
function findElements(obj, elementName) {
    if (obj === null || obj === undefined)
        return [];
    if (Array.isArray(obj)) {
        return obj.flatMap((item) => findElements(item, elementName));
    }
    if (typeof obj !== 'object')
        return [];
    const record = obj;
    if (Object.prototype.hasOwnProperty.call(record, elementName)) {
        const val = record[elementName];
        return Array.isArray(val) ? val : [val];
    }
    return Object.values(record).flatMap((val) => findElements(val, elementName));
}
/**
 * Traverses a dot-notation path within a parsed XML object and returns the value.
 * At each step, if the current value is an array, it continues into the first element
 * unless the path is exhausted (in which case it returns the array itself for join support).
 */
function resolvePath(obj, path) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length; i++) {
        if (current === null || current === undefined)
            return '';
        if (Array.isArray(current)) {
            // Descend into each array element and collect results
            const results = current
                .map((item) => resolvePath(item, parts.slice(i).join('.')))
                .filter((v) => v !== '' && v !== undefined && v !== null);
            return results.length === 1 ? results[0] : results;
        }
        if (typeof current !== 'object')
            return '';
        current = current[parts[i]];
    }
    return current;
}
/**
 * Converts a resolved XML value (scalar, array, or object) to a string.
 */
function valueToString(val, join) {
    if (val === null || val === undefined)
        return '';
    if (Array.isArray(val)) {
        const strings = val.map((v) => valueToString(v)).filter(Boolean);
        return strings.join(join ?? '|');
    }
    if (typeof val === 'object') {
        // fast-xml-parser stores text content as '#text' when mixed with attributes
        const rec = val;
        if ('#text' in rec)
            return String(rec['#text']).trim();
        return '';
    }
    return String(val).trim();
}
/**
 * Converts a single parsed XML item element into a flat SupplierRow
 * using the xmlReader field mapping config.
 */
function itemToRow(item, config) {
    const row = {};
    for (const [fieldName, rule] of Object.entries(config.fields)) {
        const path = typeof rule === 'string' ? rule : rule.path;
        const join = typeof rule === 'string' ? undefined : rule.join;
        const raw = resolvePath(item, path);
        row[fieldName] = valueToString(raw, join);
    }
    return row;
}
/**
 * Creates an async iterable that yields one SupplierRow per XML item element.
 * The source can be a local file path or an HTTP/HTTPS URL.
 */
export async function* createXmlReader(source, config) {
    const xmlContent = await fetchXmlContent(source);
    const parser = new XMLParser({
        ignoreAttributes: true,
        // Ensure repeated sibling elements are always parsed as arrays
        isArray: (_tagName, _jpath, _isLeafNode, isAttribute) => !isAttribute,
        trimValues: true,
        parseTagValue: false,
    });
    const parsed = parser.parse(xmlContent);
    const items = findElements(parsed, config.itemElement);
    logger.info(`Found ${items.length} <${config.itemElement}> elements in XML`);
    for (const item of items) {
        yield itemToRow(item, config);
    }
}
//# sourceMappingURL=reader.js.map