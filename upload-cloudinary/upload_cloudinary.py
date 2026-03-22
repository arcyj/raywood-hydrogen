#!/usr/bin/env python3
"""
upload_cloudinary.py
--------------------
Reads an XML product feed, downloads every image referenced in <IMAGE_URL>
tags, and uploads each one to Cloudinary.  Prints a summary when done.

Usage:
    python upload_cloudinary.py input.xml [--folder FOLDER]

Environment variables required (or in a .env file):
    CLOUDINARY_CLOUD_NAME
    CLOUDINARY_API_KEY
    CLOUDINARY_API_SECRET
"""

import argparse
import hashlib
import os
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

import cloudinary
import cloudinary.uploader
import requests
from dotenv import load_dotenv
from tqdm import tqdm

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

load_dotenv()

DOWNLOAD_TIMEOUT = 30       # seconds to wait for each image download
UPLOAD_RETRIES   = 2        # how many extra attempts on a failed upload
CHUNK_SIZE       = 8_192    # bytes per chunk when streaming downloads

# Mimic a real browser so servers don't reject the request with 403.
DOWNLOAD_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/",
}

TAG_IMAGE_URL    = "IMAGE_URL"


# ---------------------------------------------------------------------------
# Cloudinary setup
# ---------------------------------------------------------------------------

def configure_cloudinary() -> None:
    """Read credentials from environment variables and configure the SDK."""
    cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME")
    api_key    = os.environ.get("CLOUDINARY_API_KEY")
    api_secret = os.environ.get("CLOUDINARY_API_SECRET")

    missing = [
        name for name, val in [
            ("CLOUDINARY_CLOUD_NAME", cloud_name),
            ("CLOUDINARY_API_KEY",    api_key),
            ("CLOUDINARY_API_SECRET", api_secret),
        ]
        if not val
    ]
    if missing:
        print(
            f"[ERROR] Missing environment variable(s): {', '.join(missing)}\n"
            "        Set them directly or add them to a .env file.",
            file=sys.stderr,
        )
        sys.exit(1)

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


# ---------------------------------------------------------------------------
# XML helpers
# ---------------------------------------------------------------------------

def load_xml(path: str) -> ET.ElementTree:
    """Parse an XML file and return its ElementTree."""
    try:
        tree = ET.parse(path)
    except ET.ParseError as exc:
        print(f"[ERROR] Could not parse XML file '{path}': {exc}", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print(f"[ERROR] XML file not found: '{path}'", file=sys.stderr)
        sys.exit(1)
    return tree


def collect_image_urls(tree: ET.ElementTree) -> list[str]:
    """Return every non-empty URL found in <IMAGE_URL> elements."""
    return [
        node.text.strip()
        for node in tree.getroot().findall(f".//{TAG_IMAGE_URL}")
        if node.text and node.text.strip()
    ]


# ---------------------------------------------------------------------------
# Image download
# ---------------------------------------------------------------------------

def url_to_filename(url: str) -> str:
    """
    Derive a safe local filename from a URL.
    Falls back to an MD5 hash of the URL if the path segment is empty.
    """
    parsed = urlparse(url)
    name = Path(parsed.path).name
    if not name:
        name = hashlib.md5(url.encode()).hexdigest() + ".jpg"
    # strip query strings that might have leaked into the filename
    name = name.split("?")[0]
    return name


def download_image(url: str, dest_dir: str) -> Optional[str]:
    """
    Download an image from *url* into *dest_dir*.

    Returns the local file path on success, or None on failure.
    """
    filename  = url_to_filename(url)
    dest_path = os.path.join(dest_dir, filename)

    try:
        response = requests.get(
            url,
            stream=True,
            timeout=DOWNLOAD_TIMEOUT,
            headers=DOWNLOAD_HEADERS,
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as exc:
        print(f"\n  [WARN] Download failed for {url!r}: {exc}", file=sys.stderr)
        return None

    with open(dest_path, "wb") as fh:
        for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
            fh.write(chunk)

    return dest_path


# ---------------------------------------------------------------------------
# Cloudinary upload
# ---------------------------------------------------------------------------

def upload_image(
    local_path: str,
    folder: Optional[str] = None,
) -> Optional[str]:
    """
    Upload a local image file to Cloudinary.

    Returns the secure HTTPS URL of the uploaded asset on success,
    or None if every attempt fails.
    """
    upload_kwargs: dict = {"overwrite": False, "resource_type": "image"}
    if folder:
        upload_kwargs["folder"] = folder

    # Derive a deterministic public_id from the filename so re-runs are
    # idempotent and don't create duplicate assets in Cloudinary.
    stem = Path(local_path).stem
    upload_kwargs["public_id"] = stem

    for attempt in range(1 + UPLOAD_RETRIES):
        try:
            result = cloudinary.uploader.upload(local_path, **upload_kwargs)
            return result["secure_url"]
        except Exception as exc:  # cloudinary can raise various exception types
            if attempt < UPLOAD_RETRIES:
                continue
            print(
                f"\n  [WARN] Upload failed for {local_path!r} "
                f"after {1 + UPLOAD_RETRIES} attempt(s): {exc}",
                file=sys.stderr,
            )
            return None


# ---------------------------------------------------------------------------
# Core pipeline
# ---------------------------------------------------------------------------

def process_feed(
    input_path: str,
    folder:     Optional[str] = None,
) -> None:
    """
    Full pipeline:
      1. Parse the XML.
      2. Collect <IMAGE_URL> values.
      3. Download + upload each image.
      4. Print a summary.
    """
    print(f"Loading XML: {input_path}")
    tree = load_xml(input_path)
    urls = collect_image_urls(tree)

    if not urls:
        print("[INFO] No <IMAGE_URL> elements found in the XML. Nothing to do.")
        return

    print(f"Found {len(urls)} <IMAGE_URL> tag(s).")

    succeeded = 0
    failed    = 0

    with tempfile.TemporaryDirectory() as tmp_dir:
        for url in tqdm(urls, desc="Uploading images", unit="img"):
            # --- Download ---
            local_path = download_image(url, tmp_dir)
            if local_path is None:
                failed += 1
                continue

            # --- Upload ---
            cloudinary_url = upload_image(local_path, folder=folder)
            if cloudinary_url is None:
                failed += 1
                continue

            tqdm.write(f"  OK  {cloudinary_url}")
            succeeded += 1

    print(f"\nDone. Succeeded: {succeeded}  |  Failed / skipped: {failed}")


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Download images from an XML product feed and upload them to Cloudinary."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Environment variables needed (or set in .env):\n"
            "  CLOUDINARY_CLOUD_NAME\n"
            "  CLOUDINARY_API_KEY\n"
            "  CLOUDINARY_API_SECRET\n"
        ),
    )
    parser.add_argument("input", help="Path to the source XML file.")
    parser.add_argument(
        "--folder",
        default=None,
        metavar="FOLDER",
        help="Optional Cloudinary folder to upload images into.",
    )
    return parser


def main() -> None:
    configure_cloudinary()
    args = build_arg_parser().parse_args()
    process_feed(input_path=args.input, folder=args.folder)


if __name__ == "__main__":
    main()
