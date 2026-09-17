import { useEffect, useRef, useState } from 'react';
import {
  formatFileSize,
  loadImageFromFile,
  validateImageFile,
} from '../image-fit/image-utils';
import { ErrorNotice, ToolLayout } from './shared';
import { messageOf, saveBlob } from './file-utils';
import { isTaskCancelled, useTaskWorker } from './task-worker';

type Mode = 'images' | 'merge' | 'extract';
type Entry = { id: string; file: File; pageCount?: number; pages: string };
const modes: { id: Mode; label: string }[] = [
  { id: 'images', label: '图片转 PDF' },
  { id: 'merge', label: '合并 PDF' },
  { id: 'extract', label: '拆分 / 页面排序' },
];
async function jpegBytes(file: File): Promise<Uint8Array> {
  const image = await loadImageFromFile(file);
  if (image.naturalWidth * image.naturalHeight > 24_000_000)
    throw new Error(`${file.name} 超过 2400 万像素，请先缩小图片。`);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('当前浏览器不支持图片转换。');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  try {
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b
            ? resolve(b)
            : reject(new Error('图片转换失败，请缩小图片后重试。')),
        'image/jpeg',
        0.95
      )
    );
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
export default function PdfTools() {
  const [mode, setMode] = useState<Mode>('images');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [layout, setLayout] = useState<'a4' | 'original'>('a4');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [filename, setFilename] = useState('goodbai-document');
  const worker = useTaskWorker(
    () =>
      new Worker(new URL('./workers/pdf.worker.ts', import.meta.url), {
        type: 'module',
      })
  );
  const job = useRef(0);
  useEffect(
    () => () => {
      job.current++;
    },
    []
  );
  function cancelTask() {
    job.current++;
    worker.cancel();
    setBusy(false);
    setStatus('已取消处理，可重新开始。');
  }
  function updateEntries(next: Entry[]) {
    setEntries(next);
    worker.notify({ kind: 'release', keep: next.map((e) => e.id) });
  }

  async function addFiles(files: File[]) {
    if (!files.length || busy) return;
    const currentJob = ++job.current;
    setBusy(true);
    setError('');
    setStatus('正在读取文件…');
    try {
      if (mode === 'extract' && files.length !== 1)
        throw new Error('拆分与排序请每次选择一个 PDF。');
      const current = mode === 'extract' ? [] : entries;
      if (current.length + files.length > 50)
        throw new Error('一次最多添加 50 个文件。');
      if (
        [...current.map((e) => e.file), ...files].reduce(
          (sum, f) => sum + f.size,
          0
        ) >
        100 * 1024 * 1024
      )
        throw new Error('文件总大小不能超过 100MB，请分批处理。');
      const next: Entry[] = [];
      for (const file of files) {
        if (mode === 'images') validateImageFile(file);
        else {
          if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf')
            throw new Error('请选择 PDF 文件。');
          if (file.size > 50 * 1024 * 1024)
            throw new Error('单个 PDF 不能超过 50MB。');
        }
        next.push({ id: crypto.randomUUID(), file, pages: '' });
      }
      if (mode !== 'images') {
        const counts = await worker.run<number[]>(
          {
            kind: 'inspect',
            sources: next,
            keep: [...current, ...next].map((e) => e.id),
          },
          (message) => {
            if (currentJob === job.current) setStatus(message);
          }
        );
        next.forEach((entry, i) => {
          entry.pageCount = counts[i];
        });
      }
      if (currentJob !== job.current) return;
      setEntries([...current, ...next]);
      setStatus(`已添加 ${next.length} 个文件。`);
    } catch (e) {
      if (currentJob === job.current && !isTaskCancelled(e)) {
        setError(messageOf(e));
        setStatus('');
      }
    } finally {
      if (currentJob === job.current) setBusy(false);
    }
  }
  function move(index: number, offset: number) {
    const next = [...entries];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    setEntries(next);
    setStatus('');
  }
  async function generate() {
    if (!entries.length || busy) return;
    const currentJob = ++job.current;
    setBusy(true);
    setError('');
    setStatus('正在生成 PDF…');
    try {
      let result: { blob: Blob; pages: number };
      if (
        mode === 'images' &&
        (typeof OffscreenCanvas === 'undefined' ||
          typeof createImageBitmap !== 'function')
      ) {
        // Older browsers retain the compatible Canvas path and yield between files.
        async function* images() {
          for (let i = 0; i < entries.length; i++) {
            if (currentJob !== job.current)
              throw new DOMException('已取消', 'AbortError');
            setStatus(`正在处理图片 ${i + 1} / ${entries.length}…`);
            await new Promise((resolve) => setTimeout(resolve, 30));
            yield await jpegBytes(entries[i].file);
          }
        }
        const { imagesToPdf } = await import('./pdf-utils');
        const bytes = await imagesToPdf(images(), layout);
        result = {
          blob: new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
          pages: entries.length,
        };
      } else {
        result = await worker.run<{ blob: Blob; pages: number }>(
          { kind: 'export', sources: entries, mode, layout },
          (message) => {
            if (currentJob === job.current) setStatus(message);
          }
        );
      }
      if (currentJob !== job.current) return;
      const { blob, pages } = result;
      const name =
        filename
          .trim()
          .replace(/[/\\:*?"<>|]/g, '-')
          .replace(/\.pdf$/i, '') || 'goodbai-document';
      saveBlob(blob, `${name}.pdf`);
      setStatus(
        `已生成 ${pages} 页 PDF · ${formatFileSize(blob.size)}，下载已开始。`
      );
    } catch (e) {
      if (currentJob === job.current && !isTaskCancelled(e)) {
        setError(messageOf(e));
        setStatus('');
      }
    } finally {
      if (currentJob === job.current) setBusy(false);
    }
  }
  return (
    <ToolLayout
      title="PDF 工具箱"
      description="把图片整理成文档，合并多个 PDF，或按需要提取和排列页面。"
      path="/tools/pdf"
    >
      <div className="tools-tabs" aria-label="PDF 处理方式">
        {modes.map((m) => (
          <button
            key={m.id}
            aria-pressed={mode === m.id}
            disabled={busy}
            onClick={() => {
              worker.cancel();
              setMode(m.id);
              setEntries([]);
              setError('');
              setStatus('');
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
      <ErrorNotice message={error} />
      <div className="tools-workspace">
        <section className="tools-panel">
          <h2>
            {mode === 'images'
              ? '图片顺序'
              : mode === 'merge'
              ? '文件与页面顺序'
              : '选择源文件'}
          </h2>
          <fieldset disabled={busy}>
            <label>
              {mode === 'images'
                ? '添加图片'
                : mode === 'extract'
                ? '选择 / 替换 PDF'
                : '添加 PDF'}
              <input
                type="file"
                accept={
                  mode === 'images'
                    ? 'image/jpeg,image/png,image/webp'
                    : '.pdf,application/pdf'
                }
                multiple={mode !== 'extract'}
                onChange={(e) => {
                  void addFiles(Array.from(e.target.files ?? []));
                  e.target.value = '';
                }}
              />
            </label>
            <p className="tools-help">
              {mode === 'images'
                ? '每张图片生成一页，支持 JPG、PNG、WebP，单张 ≤20MB。'
                : '单个 PDF ≤50MB；支持普通 PDF，暂不支持加密文件或交互表单。'}{' '}
              最多 50 个文件，总大小 ≤100MB。
            </p>
            {!entries.length ? (
              <div className="tools-empty">
                <span className="tools-mark">PDF</span>
                <strong>添加文件后，在这里整理顺序</strong>
                <p>
                  {mode === 'extract'
                    ? '输入需要的页码，导出为一个新的 PDF。'
                    : '按列表从上到下生成，可随时调整或移除。'}
                </p>
              </div>
            ) : (
              <ol className="tools-file-list">
                {entries.map((e, i) => (
                  <li key={e.id}>
                    <div className="tools-file-name">
                      <strong>
                        {i + 1}. {e.file.name}
                      </strong>
                      <p className="tools-help">
                        {formatFileSize(e.file.size)}
                        {e.pageCount ? ` · ${e.pageCount} 页` : ''}
                      </p>
                      {e.pageCount && (
                        <label>
                          导出页码
                          <input
                            aria-label={`${e.file.name} 的导出页码`}
                            value={e.pages}
                            placeholder={`全部 ${e.pageCount} 页`}
                            onChange={(event) => {
                              setEntries(
                                entries.map((item) =>
                                  item.id === e.id
                                    ? { ...item, pages: event.target.value }
                                    : item
                                )
                              );
                              setStatus('');
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <div className="tools-actions">
                      <button
                        aria-label={`上移 ${e.file.name}`}
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        ↑
                      </button>
                      <button
                        aria-label={`下移 ${e.file.name}`}
                        disabled={i === entries.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        ↓
                      </button>
                      <button
                        aria-label={`移除 ${e.file.name}`}
                        onClick={() => {
                          updateEntries(
                            entries.filter((item) => item.id !== e.id)
                          );
                          setStatus('');
                        }}
                      >
                        移除
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {entries.length > 0 && (
              <button
                onClick={() => {
                  worker.cancel();
                  setEntries([]);
                  setStatus('');
                }}
              >
                清空文件
              </button>
            )}
          </fieldset>
        </section>
        <section className="tools-panel">
          <h2>导出设置</h2>
          <fieldset disabled={busy}>
            {mode === 'images' ? (
              <label>
                页面尺寸
                <select
                  value={layout}
                  onChange={(e) =>
                    setLayout(e.target.value as 'a4' | 'original')
                  }
                >
                  <option value="a4">A4 纵向 · 等比居中</option>
                  <option value="original">跟随图片比例 · 96 DPI</option>
                </select>
              </label>
            ) : (
              <div className="tools-help">
                <p>留空：保留全部页面。</p>
                <p>
                  提取页面：输入 <strong>1-3,5</strong>。
                </p>
                <p>
                  调整顺序：输入 <strong>3,1,2</strong>。
                </p>
                <p>
                  重复页码会保留重复页面。拆分为多个文件时，分别输入页码并下载。
                </p>
              </div>
            )}
            <label>
              文件名
              <input
                value={filename}
                maxLength={100}
                onChange={(e) => setFilename(e.target.value)}
              />
            </label>
            <p className="tools-help">
              输出格式 .pdf
              {mode === 'images'
                ? '。透明背景会转换为白色。'
                : '。保留所选页面的原始尺寸。'}
            </p>
          </fieldset>
          <button
            className="tools-primary tools-full"
            disabled={busy || !entries.length}
            onClick={() => void generate()}
          >
            {busy ? '正在处理…' : '生成并下载 PDF'}
          </button>
          {busy && (
            <button className="tools-full" onClick={cancelTask}>
              取消处理
            </button>
          )}
          <p className="tools-success" role="status">
            {status}
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}
