import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YUQUE_TOKEN = process.env.YUQUE_TOKEN;
// Format: namespace/repo_slug (e.g., 'your_username/your_knowledge_base')
const YUQUE_REPO_NAMESPACE = process.env.YUQUE_REPO_NAMESPACE; 

const API_BASE = 'https://www.yuque.com/api/v2';

async function fetchDocs() {
  if (!YUQUE_TOKEN || !YUQUE_REPO_NAMESPACE) {
    console.error('Error: Please set YUQUE_TOKEN and YUQUE_REPO_NAMESPACE in .env file');
    process.exit(1);
  }

  try {
    console.log(`Fetching docs from ${YUQUE_REPO_NAMESPACE}...`);
    
    // 1. Get list of docs
    const listResponse = await axios.get(`${API_BASE}/repos/${YUQUE_REPO_NAMESPACE}/docs`, {
      headers: {
        'X-Auth-Token': YUQUE_TOKEN,
      },
    });

    const docsList = listResponse.data.data;
    console.log(`Found ${docsList.length} docs.`);

    const articles = [];

    // 2. Fetch details for each doc (to get markdown body)
    for (const docSummary of docsList) {
      console.log(`Fetching detail for: ${docSummary.title} (${docSummary.slug})`);
      
      const detailResponse = await axios.get(`${API_BASE}/repos/${YUQUE_REPO_NAMESPACE}/docs/${docSummary.slug}`, {
        headers: {
          'X-Auth-Token': YUQUE_TOKEN,
        },
      });

      const docDetail = detailResponse.data.data;
      
      articles.push({
        id: docDetail.id,
        slug: docDetail.slug,
        title: docDetail.title,
        description: docDetail.description || '',
        cover: docDetail.cover,
        body: docDetail.body, // Markdown content
        created_at: docDetail.created_at,
        updated_at: docDetail.updated_at,
      });

      // Optional: Sleep to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 3. Save to file
    // Need to format it as a valid TS file that exports the array
    const outputPath = path.join(__dirname, '../src/data/articles.ts');
    
    // Convert JSON to JS object string, but we need to import Article type if we want to be strict
    // For simplicity in this generated file, we'll just cast it or use 'as const' if needed, 
    // but here we just export the array.
    const fileContent = `import type { Article } from '../types/article';

export const articles: Article[] = ${JSON.stringify(articles, null, 2)};
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Successfully saved ${articles.length} articles to ${outputPath}`);

  } catch (error) {
    console.error('Error fetching from Yuque:', error.message);
    if (error.response) {
        console.error('Response data:', error.response.data);
    }
  }
}

fetchDocs();
