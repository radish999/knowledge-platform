import { Link } from 'react-router-dom';
import imgQr from './wechat-qr.jpg';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            关于知识平台
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            专注于技术分享与知识沉淀，构建优质的阅读体验。
          </p>
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-2xl overflow-hidden mb-12">
          <div className="px-6 py-8 sm:p-10">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-8">
              联系我
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                      {/* Email Icon */}
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">radishmengpig@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                      {/* Telegram Icon */}
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Telegram</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@bminghui</p>
                  </div>
                </div>
              </div>

              {/* WeChat QR Code */}
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">微信联系</p>
                <div className="relative w-48 h-48 bg-white p-2 rounded-lg shadow-sm">
                  {/* Placeholder for QR Code */}
                  <img 
                    src={imgQr} 
                    alt="WeChat QR Code" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=WeChat+QR';
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">扫一扫添加好友</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Section */}
        {/* <div className="bg-white dark:bg-gray-800 shadow rounded-2xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-6">
              技术栈
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {['Vite', 'React 19', 'React Router', 'Tailwind CSS', 'Jotai'].map((tech) => (
                <div key={tech} className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        <div className="mt-10 text-center">
          <Link to="/" className="text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
