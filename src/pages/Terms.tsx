import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. 服务说明',
    body: [
      '知识平台通过 goodbai.baby 及相关应用体验提供内容浏览、搜索与阅读等功能。',
    ],
  },
  {
    title: '2. 合理使用',
    body: [
      '你同意不滥用本服务、不干扰其正常运行、不尝试未授权访问，并遵守适用法律法规。',
    ],
  },
  {
    title: '3. 第三方内容',
    body: [
      '部分内容、图片或外部链接可能来源于第三方。此类内容的可用性与授权由其提供方控制，我们不保证第三方内容的持续可用。',
    ],
  },
  {
    title: '4. 知识产权',
    body: [
      '网站界面、品牌资源与应用逻辑等归我们或相关权利人所有。第三方内容仍受其各自权利人与许可条款约束。',
    ],
  },
  {
    title: '5. 免责声明',
    body: [
      '本服务按“现状”与“可用性”提供。我们不保证服务不间断、信息完全准确或适用于所有特定用途。',
    ],
  },
  {
    title: '6. 责任限制',
    body: [
      '在法律允许的最大范围内，对于你使用本服务所产生的间接、附带或后果性损失，我们不承担责任。',
    ],
  },
  {
    title: '7. 条款变更',
    body: [
      '我们可能不时更新本条款。更新生效后继续使用本服务，即视为你接受修订后的条款。',
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

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-800 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
          法律
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">
          服务条款
        </h1>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          最后更新：2026年4月2日
        </p>
        <p className="mt-6 text-base leading-8 text-gray-700 dark:text-gray-300">
          本服务条款适用于你访问并使用
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
          提供的相关服务。
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
            to="/privacy"
            className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            阅读隐私政策
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
