import { formatFileSize, formatLabel } from '../image-utils';
import type { CompressionResult } from '../types';

interface ResultCardProps {
  result: CompressionResult;
  previewUrl: string;
  targetKB: number;
  onDownload: () => void;
  onRestart: () => void;
  onReprocess: () => void;
}

export default function ResultCard({
  result,
  previewUrl,
  targetKB,
  onDownload,
  onRestart,
  onReprocess,
}: ResultCardProps) {
  return (
    <section className="if-result-shell" aria-labelledby="result-title">
      <div className="if-result-heading">
        <div className="if-success-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="m6 12.5 4 4L18.5 8" /></svg>
        </div>
        <div>
          <span className="if-step-label">完成</span>
          <h2 id="result-title">处理完成</h2>
          <p>图片已经按目标要求生成，可以直接下载使用。</p>
        </div>
      </div>

      <div className="if-result-layout">
        <div className="if-result-preview">
          <img src={previewUrl} alt="处理后的图片预览" />
        </div>
        <div className="if-result-details">
          <dl className="if-result-stats">
            <div><dt>文件大小</dt><dd>{formatFileSize(result.blob.size)}</dd></div>
            <div><dt>图片尺寸</dt><dd>{result.width} × {result.height}</dd></div>
            <div><dt>格式</dt><dd>{formatLabel(result.format)}</dd></div>
            <div><dt>目标大小</dt><dd className="success">≤ {targetKB} KB</dd></div>
          </dl>

          <ul className="if-check-list">
            <li><span>✓</span> 文件大小已处理</li>
            <li><span>✓</span> 输出格式正确</li>
            <li><span>✓</span> 图片尺寸已处理</li>
            <li><span>✓</span> 浏览器本地处理</li>
          </ul>

          <div className="if-result-actions">
            <button className="if-primary-button" type="button" onClick={onDownload}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" />
              </svg>
              下载图片
            </button>
            <button className="if-secondary-button" type="button" onClick={onReprocess}>重新处理</button>
            <button className="if-text-button" type="button" onClick={onRestart}>处理另一张</button>
          </div>
        </div>
      </div>
    </section>
  );
}
