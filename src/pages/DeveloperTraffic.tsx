import { useEffect, useState } from 'react';

type DailyStat = {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
};

type TopPage = {
  path: string;
  views: number;
};

type NginxStats = {
  generatedAt: string;
  totalPageViews: number;
  totalUniqueVisitors: number;
  today: DailyStat;
  yesterday: DailyStat;
  last7Days: DailyStat[];
  topPages: TopPage[];
};

const defaultStats: NginxStats = {
  generatedAt: '',
  totalPageViews: 0,
  totalUniqueVisitors: 0,
  today: { date: '', pageViews: 0, uniqueVisitors: 0 },
  yesterday: { date: '', pageViews: 0, uniqueVisitors: 0 },
  last7Days: [],
  topPages: [],
};

function formatDateLabel(date: string) {
  if (!date) return '--';

  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return date;

  return value.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

export default function DeveloperTraffic() {
  const [stats, setStats] = useState<NginxStats>(defaultStats);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    fetch('/analytics/nginx-stats.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data: NginxStats) => {
        if (!active) return;
        setStats(data);
        setError('');
      })
      .catch(() => {
        if (!active) return;
        setError('统计文件暂时不可用，请稍后再试。');
      });

    return () => {
      active = false;
    };
  }, []);

  const peakUv = Math.max(1, ...stats.last7Days.map((item) => item.uniqueVisitors));

  return (
    <div className="px-4">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-800 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Developer Only</p>
            <h1 className="mt-3 text-3xl font-bold">Nginx 访问统计面板</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              页面数据来自服务器访问日志，只统计页面请求，不包含静态资源请求。
            </p>
          </div>
          <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
            {stats.generatedAt ? `最后更新：${new Date(stats.generatedAt).toLocaleString('zh-CN')}` : '等待统计文件生成'}
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-100">
            {error}
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-white/8 p-5">
                <p className="text-sm text-slate-300">今天 UV</p>
                <p className="mt-3 text-4xl font-bold">{stats.today.uniqueVisitors}</p>
                <p className="mt-2 text-sm text-cyan-200">{formatDateLabel(stats.today.date)} 页面访问 {stats.today.pageViews} 次</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-5">
                <p className="text-sm text-slate-300">昨天 UV</p>
                <p className="mt-3 text-4xl font-bold">{stats.yesterday.uniqueVisitors}</p>
                <p className="mt-2 text-sm text-cyan-200">{formatDateLabel(stats.yesterday.date)} 页面访问 {stats.yesterday.pageViews} 次</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-5">
                <p className="text-sm text-slate-300">近 7 天页面访问</p>
                <p className="mt-3 text-4xl font-bold">{stats.totalPageViews}</p>
                <p className="mt-2 text-sm text-cyan-200">按页面请求累计</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-5">
                <p className="text-sm text-slate-300">近 7 天 UV 累计</p>
                <p className="mt-3 text-4xl font-bold">{stats.totalUniqueVisitors}</p>
                <p className="mt-2 text-sm text-cyan-200">按每天独立访客累计</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-3xl border border-white/10 p-5">
                <h2 className="text-lg font-semibold">近 7 天趋势</h2>
                <div className="mt-5 space-y-4">
                  {stats.last7Days.map((item) => (
                    <div key={item.date} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 text-sm">
                      <span className="text-slate-300">{formatDateLabel(item.date)}</span>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-cyan-300"
                          style={{ width: `${Math.max(8, (item.uniqueVisitors / peakUv) * 100)}%` }}
                        />
                      </div>
                      <span className="text-slate-100">{item.uniqueVisitors} UV</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 p-5">
                <h2 className="text-lg font-semibold">热门页面</h2>
                <div className="mt-5 space-y-3">
                  {stats.topPages.length > 0 ? (
                    stats.topPages.map((page) => (
                      <div key={page.path} className="flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-4 py-3 text-sm">
                        <span className="truncate text-slate-200">{page.path}</span>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-cyan-200">{page.views}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">统计生成后会在这里展示热门页面。</p>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
