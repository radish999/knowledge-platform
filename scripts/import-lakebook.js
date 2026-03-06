import AdmZip from 'adm-zip';
import TurndownService from 'turndown';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as tar from 'tar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Turndown service
const turndownService = new TurndownService();

// Get the .lakebook file path from command line arguments
const lakebookPath = process.argv[2];

if (!lakebookPath) {
  console.error('Please provide the path to the .lakebook file.');
  console.error('Usage: node scripts/import-lakebook.js <path-to-lakebook-file>');
  process.exit(1);
}

if (!fs.existsSync(lakebookPath)) {
  console.error(`File not found: ${lakebookPath}`);
  process.exit(1);
}

// Create temp directory for extraction
const tempDir = path.join(__dirname, '../temp_lakebook_extract');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

async function processLakebook() {
  try {
    console.log(`Extracting ${lakebookPath}...`);
    
    // Check file type to determine extraction method
    try {
      // Try unzip first (standard zip format)
      const zip = new AdmZip(lakebookPath);
      zip.extractAllTo(tempDir, true);
    } catch (zipError) {
      // If zip fails, try tar (some lakebook exports are tarballs)
      console.log('Not a standard zip file, trying tar extraction...');
      try {
        await tar.x({
          file: lakebookPath,
          C: tempDir
        });
      } catch (tarError) {
        throw new Error(`Failed to extract file. Not a valid Zip or Tar archive. Details: ${zipError.message} | ${tarError.message}`);
      }
    }

    console.log('Extraction complete. Processing files...');

    // Find the root directory of the extracted content
    // Based on the tar output, it seems to create a subdirectory with a hash-like name
    const extractedFiles = fs.readdirSync(tempDir);
    let rootDir = tempDir;
    
    // If there's only one directory and it looks like a hash ID, enter it
    if (extractedFiles.length === 1 && fs.statSync(path.join(tempDir, extractedFiles[0])).isDirectory()) {
      rootDir = path.join(tempDir, extractedFiles[0]);
      console.log(`Found root directory: ${extractedFiles[0]}`);
    }

    // Check for book.json or meta.json inside rootDir
    let bookMeta = {};
    if (fs.existsSync(path.join(rootDir, 'book.json'))) {
      bookMeta = JSON.parse(fs.readFileSync(path.join(rootDir, 'book.json'), 'utf8'));
    } else if (fs.existsSync(path.join(rootDir, '$meta.json'))) {
      bookMeta = JSON.parse(fs.readFileSync(path.join(rootDir, '$meta.json'), 'utf8'));
    } else if (fs.existsSync(path.join(rootDir, 'meta.json'))) {
      bookMeta = JSON.parse(fs.readFileSync(path.join(rootDir, 'meta.json'), 'utf8'));
    } else {
      console.warn('Warning: No book.json, meta.json or $meta.json found. Proceeding with limited metadata.');
    }

    const articles = [];
    
    // In this specific tar structure, docs seem to be in the rootDir directly, not in a 'docs' subfolder
    // We scan rootDir for .json files that are NOT meta files
    const files = fs.readdirSync(rootDir);
    
    for (const file of files) {
      if (file.endsWith('.json') && file !== 'book.json' && file !== 'meta.json' && file !== '$meta.json') {
        const filePath = path.join(rootDir, file);
        try {
          const docData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Check if it's a valid document
          // Note: The field names might vary slightly in different export versions
          // Some lakebook exports use 'doc' object wrapper or different fields
          
          // 1. Standard format
          if (docData.title && (docData.body || docData.body_html || docData.content)) {
             processDoc(docData, articles, file);
          } 
          // 2. Wrapped format (sometimes wrapped in 'doc' property)
          else if (docData.doc && docData.doc.title) {
             processDoc(docData.doc, articles, file);
          }
          // 3. Fallback for files that look like docs but might have missing body fields
          else if (docData.title && docData.type === 'Doc') {
             // Even if body is missing, we import it as a placeholder
             processDoc(docData, articles, file);
          }
        } catch (e) {
          console.warn(`Skipping file ${file}: Invalid JSON or read error.`);
        }
      }
    }

    if (articles.length > 0) {
      // Save to src/data/articles.ts
      const outputPath = path.join(__dirname, '../src/data/articles.ts');
      
      const fileContent = `import type { Article } from '../types/article';

export const articles: Article[] = ${JSON.stringify(articles, null, 2)};
`;

      fs.writeFileSync(outputPath, fileContent);
      console.log(`Successfully imported ${articles.length} articles to ${outputPath}`);
    } else {
      console.log('No articles found to import.');
    }

  } catch (error) {
    console.error('Error processing .lakebook file:', error);
  } finally {
    // Cleanup temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('Cleaned up temporary files.');
    }
  }
}

function processDoc(docData, articles, filename) {
    console.log(`Processing: ${docData.title}`);
    
    let content = '';
    
    // Helper function to check if string looks like HTML
    const isHtml = (str) => {
        if (typeof str !== 'string') return false;
        const trimmed = str.trim();
        return trimmed.startsWith('<') || trimmed.startsWith('<!doctype');
    };

    // 1. Try body_draft or body first
    if (docData.body_draft || docData.body) {
       const rawBody = docData.body || docData.body_draft;
       // If it looks like HTML, convert it
       if (isHtml(rawBody)) {
           content = turndownService.turndown(rawBody);
       } else {
           content = rawBody;
       }
    } 
    // 2. Fallback to body_html or content
    else if (docData.body_html || docData.content) {
       content = turndownService.turndown(docData.body_html || docData.content);
    }

    // 3. Handle specific 'lake' format edge cases
    if (docData.format === 'lake' && !content && docData.body) {
        if (isHtml(docData.body)) {
             content = turndownService.turndown(docData.body);
        } else {
             content = "> (Content is in Lake format and cannot be fully rendered yet)";
        }
    }

    articles.push({
      id: docData.id || Math.floor(Math.random() * 100000), 
      slug: docData.slug || path.basename(filename, '.json'),
      title: docData.title,
      description: docData.description || '',
      cover: docData.cover,
      body: content,
      created_at: docData.created_at || new Date().toISOString(),
      updated_at: docData.updated_at || new Date().toISOString(),
    });
}

processLakebook();
