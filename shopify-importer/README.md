# shopify-importer

A production-quality CLI tool that converts supplier CSV product files into Shopify-compatible CSV files, with optional scraping of product pages.

## Features

- Streaming CSV processing (handles 10k+ rows with low memory)
- Flexible JSON mapping config to rename supplier columns to Shopify fields
- Optional product page scraping via CSS selectors (axios + cheerio)
- Concurrency-limited scraping queue (configurable)
- Filter rows by any supplier column (e.g. vendor, category)
- Configurable CSV delimiter (comma, semicolon, tab, etc.)
- Strong per-row error handling — failures are logged and skipped, never crash the process
- Retry logic for flaky HTTP requests

## Installation

```bash
npm install
npm run build
```

## Quick Start

### Full import — all products with scraping

```bash
node dist/cli/index.js \
  --input import-stock-cqe.csv \
  --output shopify-output.csv \
  --mapping mapping.json \
  --delimiter ";" \
  --concurrency 5
```

### Import one vendor only

```bash
node dist/cli/index.js \
  --input import-stock-cqe.csv \
  --output shopify-3dsimo.csv \
  --mapping mapping.json \
  --delimiter ";" \
  --filter "Manufacturer=3Dsimo"
```

### Import one category only

```bash
node dist/cli/index.js \
  --input import-stock-cqe.csv \
  --output shopify-3d-pens.csv \
  --mapping mapping.json \
  --delimiter ";" \
  --filter "Category=3D pen accessories"
```

### Combine vendor + category filters

```bash
node dist/cli/index.js \
  --input import-stock-cqe.csv \
  --output shopify-filtered.csv \
  --mapping mapping.json \
  --delimiter ";" \
  --filter "Manufacturer=3Dsimo" \
  --filter "Category=3D pen accessories"
```

### Dry run without scraping (fast, mapping only)

Remove the `scrape` block from `mapping.json`, then run:

```bash
node dist/cli/index.js \
  --input import-stock-cqe.csv \
  --output shopify-output.csv \
  --mapping mapping.json \
  --delimiter ";"
```

### Debug mode (verbose logging)

```bash
node dist/cli/index.js \
  --input import-stock-cqe.csv \
  --output shopify-output.csv \
  --mapping mapping.json \
  --delimiter ";" \
  --verbose
```

---

## CLI Reference

```
shopify-importer [options]
```

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--input <path>` | `-i` | Supplier input CSV file | required |
| `--output <path>` | `-o` | Shopify output CSV file | required |
| `--mapping <path>` | `-m` | JSON mapping config file | required |
| `--delimiter <char>` | `-d` | CSV field delimiter | `,` |
| `--concurrency <n>` | `-c` | Max concurrent scrape requests | `5` |
| `--filter <col=val>` | `-f` | Filter rows by supplier column (repeatable) | — |
| `--verbose` | `-v` | Enable debug logging | `false` |

---

## Mapping Config

### Your `mapping.json`

```json
{
  "columns": {
    "Handle": "Artical number",
    "Title": "Name",
    "Vendor": "Manufacturer",
    "Type": "Category",
    "Variant Barcode": "Barcode",
    "Variant Price": "RRP (€)",
    "Variant Weight": "Weight (kg)",
    "Google Shopping / MPN": "Artical number"
  },
  "scrape": {
    "urlColumn": "url",
    "fields": {
      "Body (HTML)": { "selector": ".desc" },
      "Image Src": { "selector": ".pop_gallery img", "attribute": "src" }
    }
  }
}
```

### Schema reference

```jsonc
{
  // Required: "Shopify field name": "Supplier column name"
  "columns": {
    "<shopify_field>": "<supplier_column>"
  },

  // Optional: scrape additional fields from the product URL
  "scrape": {
    "urlColumn": "<supplier_column_containing_url>",
    "fields": {
      "<shopify_field>": {
        "selector": "<css_selector>",
        "attribute": "<html_attribute>"   // omit to get inner HTML
      }
    }
  }
}
```

### Selector behaviour

| Config | Value extracted |
|--------|----------------|
| `{ "selector": ".desc" }` | Inner HTML of the first matched element |
| `{ "selector": "img", "attribute": "src" }` | `src` attribute of the first `<img>` |
| `{ "selector": "meta[name='description']", "attribute": "content" }` | Meta description text |

---

## Your Supplier CSV columns

| Supplier column | Maps to Shopify field |
|---|---|
| `Artical number` | `Handle`, `Google Shopping / MPN` |
| `Name` | `Title` |
| `Manufacturer` | `Vendor` |
| `Category` | `Type` |
| `Barcode` | `Variant Barcode` |
| `RRP (€)` | `Variant Price` |
| `Weight (kg)` | `Variant Weight` |
| `url` | used for scraping only (not written to output) |
| `Availability`, `Your price (€)`, `Ordered`, `Dimensions (mm)`, `Quantity per pack` | not mapped (ignored) |

---

## Error Handling

- **Per-row isolation** — a bad row is logged and skipped; the pipeline never stops
- **Scrape failures** — HTTP errors are logged with the URL; the row is still written with whatever fields were available from the CSV
- **Missing selectors** — logged as warnings, the field is left empty in the output
- **Invalid mapping config** — logged and process exits with code `1`
- **Partial failures** — process exits `0` with a summary; only exits `1` if every single row failed

---

## Project Structure

```
src/
├── cli/index.ts          — Commander CLI entry point
├── csv/
│   ├── reader.ts         — Streaming CSV reader (AsyncIterable)
│   └── writer.ts         — Streaming CSV writer (backpressure-aware)
├── mapping/
│   ├── loader.ts         — Load and validate mapping.json with zod
│   └── mapper.ts         — Rename supplier columns to Shopify fields
├── scraping/
│   ├── scraper.ts        — Fetch URL and extract fields with cheerio
│   └── queue.ts          — p-limit concurrency wrapper
├── transform/
│   └── transformer.ts    — Merge mapped + scraped fields, derive headers
├── pipeline/
│   └── runner.ts         — End-to-end orchestration with error handling
├── utils/
│   ├── logger.ts         — Structured levelled logger
│   ├── errors.ts         — Typed error classes
│   └── retry.ts          — withRetry() helper
└── types/index.ts        — All shared TypeScript interfaces
```

## Development

```bash
# Run without building (tsx)
npx tsx src/cli/index.ts -i import-stock-cqe.csv -o out.csv -m mapping.json -d ";"

# Type-check only
npm run typecheck

# Build to dist/
npm run build
```
