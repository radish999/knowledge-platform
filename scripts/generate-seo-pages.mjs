import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const template = await readFile(path.join(projectRoot, 'index.html'), 'utf8');
const config = JSON.parse(await readFile(path.join(projectRoot, 'config/seo-pages.json'), 'utf8'));
const siteUrl = 'https://www.goodbai.baby';

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

for (const page of config.pages) {
  const canonical = `${siteUrl}${page.path}`;
  const schema = page.kind === 'tool'
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: page.h1Line2 ? `${page.h1Line1}${page.h1Line2}` : page.h1Line1,
        url: canonical,
        description: page.description,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: page.h1Line1,
        url: canonical,
        description: page.description,
        inLanguage: 'zh-CN',
      };

  let html = template
    .replace(/<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]+"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]+"\s*\/>/, `<meta property="og:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]+"\s*\/>/, `<meta property="og:description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]+"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]+"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]+"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`)
    .replace(/<script id="route-structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/, `<script id="route-structured-data" type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .replace(/\s*\/\* homepage-seo-style:start \*\/[\s\S]*?\/\* homepage-seo-style:end \*\//, '')
    .replace(/\s*<!-- homepage-seo:start -->[\s\S]*?<!-- homepage-seo:end -->/, '')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace('<p class="boot-eyebrow">ImageFit 图片上传合规助手</p>', `<p class="boot-eyebrow">${escapeHtml(page.eyebrow)}</p>`)
    .replace('<h1>免费在线图片压缩<br />与尺寸调整</h1>', `<h1>${escapeHtml(page.h1Line1)}${page.h1Line2 ? `<br />${escapeHtml(page.h1Line2)}` : ''}</h1>`)
    .replace('<p class="boot-subtitle">指定文件大小、尺寸和格式，一键生成可以上传的图片。</p>', `<p class="boot-subtitle">${escapeHtml(page.subtitle)}</p>`);

  if (page.kind === 'knowledge') {
    html = html
      .replace('图片工具准备中', '知识内容准备中')
      .replace('正在加载本地处理组件', '正在加载知识首页');
  }

  await writeFile(path.join(projectRoot, `${page.slug}.html`), html, 'utf8');
}

const sitemapEntries = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  ...config.pages.map((page) => ({
    path: page.path,
    priority: page.kind === 'tool' ? '0.9' : '0.8',
    changefreq: page.kind === 'tool' ? 'monthly' : 'weekly',
  })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map((entry) => `  <url>
    <loc>${siteUrl}${entry.path}</loc>
    <lastmod>2026-09-01</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
await writeFile(path.join(projectRoot, 'public/sitemap.xml'), sitemap, 'utf8');

console.log(`Generated ${config.pages.length} static SEO pages and ${sitemapEntries.length} sitemap URLs.`);
