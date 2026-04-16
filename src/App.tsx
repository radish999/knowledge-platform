import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAtom } from 'jotai';
import { darkModeAtom } from './store';
import faviconUrl from '../favicon.png';
import Home from './pages/Home';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ArticleList from './pages/articles/ArticleList';
import ArticleDetail from './pages/articles/ArticleDetail';
import DeveloperTraffic from './pages/DeveloperTraffic';

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
                <img src={faviconUrl} alt="知识平台" className="h-7 w-7 shrink-0" />
                <span className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">知识平台</span>
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
                      首页
                    </Link>
                  </li>
                  <li>
                    <Link to="/articles" className={navLinkClassName}>
                      文章
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
                      首页
                    </Link>
                  </li>
                  <li>
                    <Link to="/articles" className={mobileLinkClassName} onClick={closeMobileMenu}>
                      文章
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
        <main className="container mx-auto pb-8 pt-4 sm:py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<ArticleList />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/pv" element={<DeveloperTraffic />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
