import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { darkModeAtom } from './store';
import Home from './pages/Home';
import About from './pages/About';
import ArticleList from './pages/articles/ArticleList';
import ArticleDetail from './pages/articles/ArticleDetail';

function App() {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);

  return (
    <BrowserRouter>
      <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
        <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center transition-colors duration-200 sticky top-0 z-50">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">知识平台</h1>
          <nav>
            <ul className="flex space-x-4 items-center">
              <li><Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 font-medium">首页</Link></li>
              <li><Link to="/articles" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 font-medium">文章</Link></li>
              <li><Link to="/about" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 font-medium">关于</Link></li>
              <li>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  {darkMode ? '🌞 亮色' : '🌙 暗色'}
                </button>
              </li>
            </ul>
          </nav>
        </header>
        <main className="container mx-auto py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<ArticleList />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
