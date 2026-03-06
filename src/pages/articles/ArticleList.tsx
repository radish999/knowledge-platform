import { Link } from 'react-router-dom';
import { articles } from '../../data/articles';
import { useState, useMemo } from 'react';

export default function ArticleList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  // Define categories and keywords
  const categoryRules: Record<string, string[]> = {
    '前端开发': ['React', 'Vue', 'Angular', 'Webpack', 'Vite', 'CSS', 'HTML', 'JavaScript', 'TypeScript', 'JS', 'TS', 'DOM', 'BFC', 'Flex', 'Grid'],
    '后端技术': ['Node', 'PHP', 'Java', 'Python', 'Go', 'SQL', 'Database', 'Redis', 'Nginx', 'Docker', 'CentOS', 'Linux', 'SSH'],
    '计算机基础': ['HTTP', 'HTTPS', 'TCP', 'UDP', 'DNS', '网络', '算法', '数据结构', '操作系统', '进程', '线程'],
    '工程化': ['Git', 'npm', 'yarn', 'pnpm', 'CI/CD', 'Jest', 'Test', 'Eslint', 'Prettier', 'Husky', 'Commitlint'],
    '安全': ['XSS', 'CSRF', '安全', '攻击', '防御', '加密', '解密'],
    '其他': [] // Fallback
  };

  // Auto-categorize articles
  const categorizedArticles = useMemo(() => {
    return articles.map(article => {
      let category = '其他';
      for (const [cat, keywords] of Object.entries(categoryRules)) {
        if (cat === '其他') continue;
        if (keywords.some(k => article.title.toLowerCase().includes(k.toLowerCase()))) {
          category = cat;
          break;
        }
      }
      return { ...article, category };
    });
  }, []);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { '全部': articles.length };
    Object.keys(categoryRules).forEach(cat => counts[cat] = 0);
    
    categorizedArticles.forEach(article => {
      counts[article.category] = (counts[article.category] || 0) + 1;
    });
    
    // Remove empty categories except '其他'
    return counts;
  }, [categorizedArticles]);

  // Filter articles based on search term and category
  const filteredArticles = useMemo(() => {
    return categorizedArticles.filter((article) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        article.title.toLowerCase().includes(searchLower) ||
        (article.description && article.description.toLowerCase().includes(searchLower))
      );
      
      const matchesCategory = selectedCategory === '全部' || article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, categorizedArticles]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 space-y-8">
        {/* Search Input (Moved to sidebar for mobile consistency) */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">搜索</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索文章..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow pl-10"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">分类目录</h3>
          <nav className="space-y-1">
            <button
              onClick={() => setSelectedCategory('全部')}
              className={`w-full flex justify-between items-center px-3 py-2 text-sm rounded-md transition-colors ${
                selectedCategory === '全部'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>全部文章</span>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
                {categoryCounts['全部']}
              </span>
            </button>
            {Object.keys(categoryRules).map(category => (
              categoryCounts[category] > 0 && (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full flex justify-between items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{category}</span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
                    {categoryCounts[category]}
                  </span>
                </button>
              )
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {selectedCategory === '全部' ? '全部文章' : selectedCategory}
          </h1>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            共 {filteredArticles.length} 篇
          </span>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                to={`/articles/${article.slug}`}
                className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full"
              >
                <div className="h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0 relative">
                  {article.cover ? (
                    <img
                      src={article.cover}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  )}
                  {/* Category Badge on Card */}
                  <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                    {article.category}
                  </span>
                </div>
                <div className="p-5 flex flex-col grow">
                  <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm grow">
                    {article.description || article.body?.slice(0, 80).replace(/[#*`]/g, '') || '暂无描述...'}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {new Date(article.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <p className="text-xl text-gray-500 dark:text-gray-400">没有找到匹配的文章</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('全部');}}
              className="mt-4 text-blue-600 hover:underline"
            >
              清除筛选条件
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
