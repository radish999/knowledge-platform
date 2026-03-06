import { Link } from 'react-router-dom';

export default function About() {

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">关于知识平台</h1>
      <p className="mb-4">
        本平台构建于现代 Web 技术之上：
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li>Vite</li>
        <li>React 19</li>
        <li>React Router</li>
        <li>Tailwind CSS</li>
        <li>Jotai</li>
      </ul>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">平台介绍</h2>
        <p>
            这是一个专注于技术分享与知识沉淀的平台，旨在为访客提供优质的阅读体验。
        </p>
      </div>

      <Link to="/" className="text-blue-500 hover:underline">
        返回首页
      </Link>
    </div>
  );
}
