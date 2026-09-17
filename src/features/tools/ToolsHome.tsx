import { Link } from 'react-router-dom';
import { ToolLayout } from './shared';
import { toolEntries } from './catalog';
export default function ToolsHome() {
  return (
    <ToolLayout
      title="把手边的小事，处理好。"
      description="从图片上传到材料整理，再到日常开发。选一个工具，直接开始。"
      path="/tools"
    >
      <div className="tools-catalog">
        {toolEntries.map((t) => (
          <Link to={t.path} className="tools-card" key={t.path}>
            <span className="tools-mark">{t.mark}</span>
            <span className="tools-tag">{t.tag}</span>
            <h2>{t.name}</h2>
            <p>{t.description}</p>
            <span className="tools-card-action">
              打开工具 <span aria-hidden="true">↗</span>
            </span>
          </Link>
        ))}
      </div>
      <aside className="tools-tip">
        <strong>准备上传材料？</strong>
        <p>
          先遮挡个人信息、添加用途水印，再压缩图片；需要提交一个文件时，用 PDF
          工具箱整理。
        </p>
        <Link to="/tools/image-privacy">开始处理图片 →</Link>
      </aside>
    </ToolLayout>
  );
}
