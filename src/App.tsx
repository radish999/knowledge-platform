import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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
  const navLinkClassName =
    'whitespace-nowrap text-sm font-medium text-gray-700 transition-colors hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400 sm:text-base';

  return (
    <BrowserRouter>
      <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
        <header className="sticky top-0 z-50 bg-white px-4 py-3 shadow transition-colors duration-200 dark:bg-gray-800">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="flex items-center gap-2 self-start">
              <img src={faviconUrl} alt="知识平台" className="h-7 w-7 shrink-0" />
              <span className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">知识平台</span>
            </Link>

            <nav className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <ul className="flex min-w-max items-center gap-3 pb-1 sm:gap-4 sm:pb-0">
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
        </header>
        <main className="container mx-auto py-8">
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
