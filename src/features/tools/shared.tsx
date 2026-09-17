import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Seo from '../../components/Seo';
import './tools.css';

import { toolEntries } from './catalog';
export function ToolLayout({
  title,
  description,
  path,
  children,
}: {
  title: string;
  description: string;
  path: string;
  children: ReactNode;
}) {
  return (
    <div className="tools-page">
      <Seo title={`${title} | GoodBai`} description={description} path={path} />
      <div className="tools-container">
        <div className="tools-topline">
          <Link to="/tools">GoodBai / 工具箱</Link>
          <span>本地处理 · 无需登录</span>
        </div>
        <header className="tools-heading">
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        <nav className="tools-nav" aria-label="工具导航">
          {toolEntries.map((t) => (
            <NavLink key={t.path} to={t.path} end>
              {t.tag}
            </NavLink>
          ))}
        </nav>
        {children}
        <footer className="tools-footer">
          文件和输入内容仅在当前浏览器内处理，刷新页面后需重新添加。
          <Link to="/privacy">隐私说明</Link>
        </footer>
      </div>
    </div>
  );
}
export function ErrorNotice({ message }: { message: string }) {
  return message ? (
    <p className="tools-error" role="alert">
      {message}
    </p>
  ) : null;
}
