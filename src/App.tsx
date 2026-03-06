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
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">知识平台</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><Link to="/" className="hover:text-blue-500">首页</Link></li>
              <li><Link to="/articles" className="hover:text-blue-500">文章</Link></li>
              <li><Link to="/about" className="hover:text-blue-500">关于</Link></li>
              {/* <li>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {darkMode ? '亮色模式' : '暗色模式'}
                </button>
              </li> */}
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
