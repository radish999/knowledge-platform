import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, unknown>;
}

const SITE_URL = 'https://www.goodbai.baby';

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function Seo({ title, description, path, type = 'website', structuredData }: SeoProps) {
  const canonical = `${SITE_URL}${path === '/' ? '/' : path}`;
  const structuredDataJson = structuredData ? JSON.stringify(structuredData) : '';

  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    setMeta('meta[property="og:type"]', 'property', 'og:type', type);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    const dynamicSchemaId = 'route-structured-data';
    document.getElementById(dynamicSchemaId)?.remove();
    if (structuredDataJson) {
      const script = document.createElement('script');
      script.id = dynamicSchemaId;
      script.type = 'application/ld+json';
      script.text = structuredDataJson;
      document.head.appendChild(script);
    }
  }, [canonical, description, structuredDataJson, title, type]);

  return null;
}
