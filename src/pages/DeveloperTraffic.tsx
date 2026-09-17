import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

const dashboardUrl =
  'https://vercel.com/radishs-projects-f85d7e47/knowledge-platform/analytics';

export default function DeveloperTraffic() {
  return (
    <div className="min-h-[70vh] bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Seo
        title="访问统计 | GoodBai"
        description="在 Vercel Web Analytics 后台查看 GoodBai 的访问量、热门页面与访问来源。"
        path="/pv"
      />
      <section className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800 sm:p-10">
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          Vercel Web Analytics
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
          网站访问统计
        </h1>
        <p className="mt-5 leading-8 text-gray-600 dark:text-gray-300">
          在 Vercel
          后台查看访客数、页面浏览量、热门页面、来源网站与设备分布。打开后需登录有权访问本项目的
          Vercel 账号。
        </p>
        <a
          href={dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
        >
          打开 Vercel 统计后台 ↗
        </a>
        <p className="mt-6 text-sm leading-7 text-gray-500 dark:text-gray-400">
          统计仅记录正式网站的页面访问，不采集工具输入、文件名或文件内容。新增数据可能需要几分钟才会出现在后台。
        </p>
        <div className="mt-8 border-t border-gray-200 pt-5 dark:border-gray-700">
          <Link
            to="/tools"
            className="text-sm font-medium text-blue-600 dark:text-blue-400"
          >
            返回工具箱 →
          </Link>
        </div>
      </section>
    </div>
  );
}
