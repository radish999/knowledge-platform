import { Link } from 'react-router-dom';
import { articles } from '../data/articles';
import ArticleCover from '../components/ArticleCover';
import Seo from '../components/Seo';

export default function Home() {
  // Get recent 3 articles
  const recentArticles = articles.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Seo
        title="知识平台 - 技术文章与工程笔记 | GoodBai"
        description="GoodBai 知识平台收录前端开发、React、JavaScript、工程化与安全等技术文章和工程笔记。"
        path="/knowledge"
        structuredData={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'GoodBai 知识平台' }}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            探索更聪明的知识库
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            精选技术文章与工程笔记，
            <br />
            专注阅读体验，不打扰你的思路。
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/articles"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              开始阅读
            </Link>
            <Link
              to="/about"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>

      {/* Features/Highlights */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">专注阅读</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Markdown 渲染与清晰排版，让长文阅读更轻松。
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">加载迅速</h3>
              <p className="text-gray-600 dark:text-gray-300">
                基于 Vite 与 React，切换顺滑、响应更快。
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">持续更新</h3>
              <p className="text-gray-600 dark:text-gray-300">
                内容持续增长，让最新的想法更容易被找到。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Articles Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">最新文章</h2>
            <Link to="/articles" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              查看全部 <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.length > 0 ? (
              recentArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.slug}`}
                  className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <ArticleCover
                      title={article.title}
                      cover={article.cover}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
                      {article.description || article.body?.slice(0, 100).replace(/[#*`]/g, '') || '暂无摘要'}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                      <span>{new Date(article.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                暂无文章，导入内容后即可开始阅读。
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} 知识平台。保留所有权利。</p>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">隐私政策</Link>
              <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">服务条款</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
