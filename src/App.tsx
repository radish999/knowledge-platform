import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import { useAtom } from 'jotai';
import { darkModeAtom } from './store';
import ImageFitHome from './features/image-fit/ImageFitHome';
import { TOOL_SEO_PAGES } from './features/image-fit/seo-pages';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const ArticleList = lazy(() => import('./pages/articles/ArticleList'));
const ArticleDetail = lazy(() => import('./pages/articles/ArticleDetail'));
const DeveloperTraffic = lazy(() => import('./pages/DeveloperTraffic'));

function App() {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinkClassName =
    'whitespace-nowrap text-sm font-medium text-gray-700 transition-colors hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400 sm:text-base';
  const mobileLinkClassName =
    'block rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-500 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400';

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <BrowserRouter>
      <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
        <header className="sticky top-0 z-50 bg-white px-4 py-3 shadow transition-colors duration-200 dark:bg-gray-800">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between gap-3">
              <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                <img src="/favicon.svg" alt="ImageFit" className="h-8 w-8 shrink-0 rounded-lg" />
                <span className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">ImageFit</span>
                <span className="hidden rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 sm:inline">GOODBAI</span>
              </Link>

              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  {darkMode ? '亮色' : '暗色'}
                </button>
                <button
                  onClick={() => setMobileMenuOpen((value) => !value)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
                    )}
                  </svg>
                </button>
              </div>

              <nav className="hidden sm:block">
                <ul className="flex items-center gap-4">
                  <li>
                    <Link to="/" className={navLinkClassName}>
                      图片助手
                    </Link>
                  </li>
                  <li>
                    <Link to="/knowledge" className={navLinkClassName}>
                      知识首页
                    </Link>
                  </li>
                  <li>
                    <Link to="/articles" className={navLinkClassName}>
                      知识文章
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className={navLinkClassName}>
                      关于
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className="whitespace-nowrap rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      {darkMode ? '🌞 亮色' : '🌙 暗色'}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {mobileMenuOpen ? (
              <nav className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700 sm:hidden">
                <ul className="space-y-2">
                  <li>
                    <Link to="/" className={mobileLinkClassName} onClick={closeMobileMenu}>
                      图片助手
                    </Link>
                  </li>
                  <li>
                    <Link to="/knowledge" className={mobileLinkClassName} onClick={closeMobileMenu}>
                      知识首页
                    </Link>
                  </li>
                  <li>
                    <Link to="/articles" className={mobileLinkClassName} onClick={closeMobileMenu}>
                      知识文章
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className={mobileLinkClassName} onClick={closeMobileMenu}>
                      关于
                    </Link>
                  </li>
                </ul>
              </nav>
            ) : null}
          </div>
        </header>
        <main>
          <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">正在加载…</div>}>
            <Routes>
              <Route path="/" element={<ImageFitHome />} />
              {TOOL_SEO_PAGES.map((page) => (
                <Route key={page.path} path={page.path} element={<ImageFitHome page={page} />} />
              ))}
              <Route path="/knowledge" element={<Home />} />
              <Route path="/articles" element={<ArticleList />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/pv" element={<DeveloperTraffic />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
