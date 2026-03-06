export interface Article {
  id: number;
  slug: string;
  title: string;
  description?: string;
  cover?: string;
  body?: string; // Markdown content
  created_at: string;
  updated_at: string;
}
