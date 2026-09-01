import seoConfig from '../../../config/seo-pages.json';
import type { OutputFormat } from './types';

export interface ToolSeoPage {
  slug: string;
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  h1Line1: string;
  h1Line2: string;
  subtitle: string;
  presetId?: string;
  initialMaxSizeKB?: number;
  initialFormat?: OutputFormat;
}

export const TOOL_SEO_PAGES: readonly ToolSeoPage[] = seoConfig.pages
  .filter((page) => page.kind === 'tool')
  .map((page) => ({
    ...page,
    initialFormat: page.initialFormat as OutputFormat | undefined,
  }));
