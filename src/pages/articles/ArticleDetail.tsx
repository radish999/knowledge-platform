import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { articles } from '../../data/articles';
import type { ComponentPropsWithoutRef } from 'react';
import { useState, useEffect } from 'react';

// TOC Item Component
const TocItem = ({ level, text, id, activeId }: { level: number; text: string; id: string; activeId: string }) => {
  return (
    <li
      className={`
        pl-${(level - 1) * 4} 
        mb-2 text-sm transition-colors duration-200
        ${activeId === id ? 'text-blue-600 font-medium border-l-2 border-blue-600 pl-2' : 'text-gray-600 dark:text-gray-400 hover:text-blue-500'}
      `}
    >
      <a href={`#${id}`} onClick={(e) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }}>
        {text}
      </a>
    </li>
  );
};

const getToc = (body: string) => {
  if (!body) return [];
  return body
    .split('\n')
    .filter((line) => line.startsWith('#'))
    .map((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (!match) return null;

      const level = match[1].length;
      const text = match[2];
      const id = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '');

      return { level, text, id };
    })
    .filter((item): item is { level: number; text: string; id: string } => item !== null);
};

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug);
  const [activeId, setActiveId] = useState<string>('');

  const articleBody = article?.body ?? '';
  const toc = getToc(articleBody);

  // Handle scroll spy
  useEffect(() => {
    const headings = getToc(articleBody);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -35% 0px' }
    );

    headings.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [articleBody]);

  if (!article) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">文章未找到</h1>
        <Link to="/articles" className="text-blue-500 hover:underline">
          返回列表
        </Link>
      </div>
    );
  }

  const toHeadingId = (value: unknown) => {
    return String(value ?? '')
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Custom renderer for headings to add IDs
  type HeadingProps = ComponentPropsWithoutRef<'h1'> & { node?: unknown };

  const components: Components = {
    h1: ({ children, ...props }: HeadingProps) => {
      const id = toHeadingId(children);
      return (
        <h1 {...props} id={id} className="scroll-mt-20">
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }: HeadingProps) => {
      const id = toHeadingId(children);
      return (
        <h2 {...props} id={id} className="scroll-mt-20">
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: HeadingProps) => {
      const id = toHeadingId(children);
      return (
        <h3 {...props} id={id} className="scroll-mt-20">
          {children}
        </h3>
      );
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
      {/* TOC Sidebar */}
      {toc.length > 0 && (
        <aside className="hidden lg:block w-64 shrink-0 order-last lg:order-first">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              目录大纲
            </h4>
            <ul className="space-y-1">
              {toc.map((item, index) => (
                <TocItem 
                  key={`${item.id}-${index}`} 
                  {...item} 
                  activeId={activeId} 
                />
              ))}
            </ul>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Link to="/articles" className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; 返回列表
        </Link>
        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <h1 className="mb-4">{article.title}</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            发布于 {new Date(article.created_at).toLocaleDateString()}
          </div>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {article.body || ''}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
