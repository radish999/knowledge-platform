import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. 我们收集的信息',
    body: [
      '我们可能会收集为提供与改进服务所必需的有限信息，包括设备信息、应用版本、运行日志、崩溃日志，以及你通过反馈或联系方式主动提交的内容。',
      '当你使用文章浏览、搜索、主题切换等功能时，服务可能会处理你的搜索关键词、页面访问与交互状态，用于提供核心功能与优化体验。',
    ],
  },
  {
    title: '2. 信息如何使用',
    body: [
      '我们使用上述信息以提供内容浏览与搜索功能、提升稳定性与性能、诊断错误，并响应你的支持请求。',
      '我们不会出售你的个人信息。',
    ],
  },
  {
    title: '3. 第三方服务',
    body: [
      '为实现统计分析与基础功能，本服务可能会使用第三方服务（例如 Vercel Analytics）。这些服务对数据的处理受其各自隐私政策约束。',
      '相关服务：Vercel Analytics，https://vercel.com/analytics',
    ],
  },
  {
    title: '4. 权限说明',
    body: [
      '本服务可能需要网络权限以加载页面与在线资源。',
      '权限仅在实现相应功能所必需的范围内使用。',
    ],
  },
  {
    title: '5. 共享与披露',
    body: [
      '除非为实现核心功能所必需、法律法规要求或你已明确同意，否则我们不会公开披露或转移你的个人信息。',
    ],
  },
  {
    title: '6. 数据安全',
    body: [
      '我们采取合理的技术与组织措施保护数据免遭未经授权的访问、篡改、披露或丢失。但任何互联网系统都无法保证绝对安全。',
    ],
  },
  {
    title: '7. 你的权利',
    body: [
      '在适用法律允许的范围内，你可以请求访问、更正或删除我们处理的与你相关的信息，并可就隐私相关问题与我们联系。',
    ],
  },
  {
    title: '8. 联系我们',
    body: [
      '运营方：知识平台',
      '网站：https://www.goodbai.baby/',
      '联系邮箱：radishmengpig@gmail.com',
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-800 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
          法律
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">
          隐私政策
        </h1>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          最后更新：2026年4月2日
        </p>
        <p className="mt-6 text-base leading-8 text-gray-700 dark:text-gray-300">
          本隐私政策说明当你访问并使用
          {' '}
          <a
            href="https://www.goodbai.baby/"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
            target="_blank"
            rel="noreferrer"
          >
            goodbai.baby
          </a>
          {' '}
          提供的服务时，我们如何收集、使用、存储与保护信息。
        </p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-gray-700 dark:text-gray-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-8 dark:border-gray-700">
          <Link
            to="/terms"
            className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            阅读服务条款
          </Link>
          <Link
            to="/"
            className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
