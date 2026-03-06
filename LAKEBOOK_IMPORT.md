# Yuque .lakebook Import Guide

This project supports importing articles directly from Yuque's `.lakebook` export format.

## Prerequisites

You need a `.lakebook` file exported from Yuque.

## How to Import

1.  Place your `.lakebook` file in the project directory (or anywhere accessible).
2.  Run the import script with the path to your file:

```bash
node scripts/import-lakebook.js path/to/your/knowledge-base.lakebook
```

## What it does

1.  Unzips the `.lakebook` file to a temporary directory.
2.  Scans for `book.json` or `meta.json` to identify the knowledge base structure.
3.  Iterates through the `docs` folder.
4.  Converts HTML content to Markdown (using `turndown`) if raw Markdown is not available.
5.  Updates `src/data/articles.ts` with the imported content.

## Note on Images

Currently, the script does **not** automatically download and host images found in the articles. Images will still point to Yuque's servers. 
-   **Pro**: Saves local storage space.
-   **Con**: Images might break if Yuque changes its hosting or if they are behind a private auth wall.

If you need local image hosting, you would need to extend the script to:
1.  Parse image URLs in the content.
2.  Download them to `public/images`.
3.  Replace the URLs in the Markdown content.
