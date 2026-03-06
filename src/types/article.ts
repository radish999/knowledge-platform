export interface Article {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  body?: string | null; // Markdown content
  created_at: string;
  updated_at: string;
}
