# upload-cloudinary

A small Python CLI tool that reads a product XML feed, downloads every image
referenced in `<IMAGE_URL>` tags, uploads them to **Cloudinary**, and writes a
new XML file with all image URLs replaced by the Cloudinary HTTPS URLs — ready
for a Shopify product import.

---

## Requirements

- Python 3.9+
- A [Cloudinary](https://cloudinary.com/) account (free tier works fine)

---

## Setup

### 1. Clone / download this project

```bash
cd upload-cloudinary
```

### 2. Create and activate a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Cloudinary credentials

Copy `.env.example` to `.env` and fill in your credentials (found in the
Cloudinary Console → Dashboard):

```bash
cp .env.example .env
```

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Alternatively, export the variables directly in your shell session.

---

## Usage

```
python upload_cloudinary.py <input.xml> <output.xml> [--folder FOLDER]
```

| Argument | Description |
|---|---|
| `input.xml` | Path to the source XML product feed |
| `output.xml` | Path where the updated XML will be saved |
| `--folder` | *(Optional)* Cloudinary folder to upload images into |

### Examples

Basic run:

```bash
python upload_cloudinary.py sample_feed.xml output_feed.xml
```

Upload into a specific Cloudinary folder:

```bash
python upload_cloudinary.py products.xml products_cloudinary.xml --folder shopify/products
```

---

## XML format expected

The tool looks for `<IMAGE_URL>` tags anywhere in the document:

```xml
<products>
    <item>
        <IMAGES>
            <IMAGE_URL>https://example.com/image1.jpg</IMAGE_URL>
            <IMAGE_URL>https://example.com/image2.jpg</IMAGE_URL>
        </IMAGES>
    </item>
</products>
```

After running, those tags will contain Cloudinary URLs:

```xml
<IMAGE_URL>https://res.cloudinary.com/your_cloud/image/upload/v.../image1.jpg</IMAGE_URL>
```

---

## Error handling

- **Failed downloads** — the original URL is left unchanged and the tool
  continues with the remaining images.
- **Failed uploads** — same behaviour; a warning is printed for each failure.
- **Missing credentials** — the tool exits immediately with a clear error
  message listing which variables are absent.
- **Idempotent uploads** — each image is given a `public_id` derived from its
  filename, so re-running the tool won't create duplicate assets in Cloudinary.

---

## Project structure

```
upload-cloudinary/
├── upload_cloudinary.py   # Main script
├── requirements.txt       # Python dependencies
├── .env.example           # Credential template
├── sample_feed.xml        # Sample XML feed for testing
└── README.md
```
