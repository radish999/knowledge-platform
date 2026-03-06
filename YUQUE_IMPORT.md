# Yuque Import Guide

This project includes a script to import articles from Yuque (语雀) into your knowledge platform.

## Prerequisites

1.  **Yuque Token**: Get your Personal Access Token from [Yuque Settings -> Token](https://www.yuque.com/settings/tokens).
2.  **Repo Namespace**: This is the URL part of your knowledge base. For example, if your knowledge base URL is `https://www.yuque.com/your-name/your-kb`, the namespace is `your-name/your-kb`.

## Setup

1.  Create a `.env` file in the root directory (if it doesn't exist):

```bash
touch .env
```

2.  Add your Yuque credentials to `.env`:

```env
YUQUE_TOKEN=your_token_here
YUQUE_REPO_NAMESPACE=your_name/your_kb
```

## Running the Import

Run the following command to fetch articles and update `src/data/articles.ts`:

```bash
node scripts/import-yuque.js
```

## Note

-   The script fetches the document list and then details for each document to get the full Markdown content.
-   It overwrites `src/data/articles.ts`.
-   If you have many articles, it might take a while due to API rate limiting (added a small delay).
