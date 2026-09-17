import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadImageFromFile, validateImageFile } from '../image-fit/image-utils';
import { canvasBlob, drawProtectedImage } from './image-editor';
import type { Redaction } from './image-editor';
import { queueImageForCompression } from './handoff';
import { ErrorNotice, ToolLayout } from './shared';
import { messageOf, saveBlob } from './file-utils';
import { isTaskCancelled, useTaskWorker } from './task-worker';

export default function ImagePrivacy() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [source, setSource] = useState<{
    width: number;
    height: number;
    name: string;
    file: File;
    preview: HTMLCanvasElement;
  } | null>(null);
  const [regions, setRegions] = useState<Redaction[]>([]);
  const selectionRef = useRef<HTMLDivElement>(null);
  const draft = useRef<Redaction | null>(null);
  const dragFrame = useRef(0);
  const exportId = useRef(0);
  const worker = useTaskWorker(
    () =>
      new Worker(new URL('./workers/image.worker.ts', import.meta.url), {
        type: 'module',
      })
  );
  function clearDraft() {
    cancelAnimationFrame(dragFrame.current);
    dragFrame.current = 0;
    draft.current = null;
    if (selectionRef.current) selectionRef.current.hidden = true;
  }
  function showDraft(region: Redaction) {
    draft.current = region;
    if (dragFrame.current) return;
    dragFrame.current = requestAnimationFrame(() => {
      dragFrame.current = 0;
      const overlay = selectionRef.current,
        r = draft.current;
      if (!source || !overlay || !r) return;
      overlay.hidden = false;
      Object.assign(overlay.style, {
        left: `${(r.x / source.width) * 100}%`,
        top: `${(r.y / source.height) * 100}%`,
        width: `${(r.width / source.width) * 100}%`,
        height: `${(r.height / source.height) * 100}%`,
      });
    });
  }
  useEffect(
    () => () => {
      cancelAnimationFrame(dragFrame.current);
      exportId.current++;
    },
    []
  );
  const origin = useRef<{ x: number; y: number } | null>(null);
  const [text, setText] = useState('仅供资料审核使用');
  const [opacity, setOpacity] = useState(30);
  const [size, setSize] = useState(4);
  const [color, setColor] = useState('#526078');
  const [tiled, setTiled] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [manual, setManual] = useState({
    x: '0',
    y: '0',
    width: '100',
    height: '50',
  });
  const loadId = useRef(0);

  useEffect(() => {
    if (!source) return;
    const frame = requestAnimationFrame(() => {
      if (!canvasRef.current) return;
      drawProtectedImage(
        canvasRef.current,
        source.preview,
        regions,
        { text, opacity, size, color, tiled },
        {
          width: source.preview.width,
          height: source.preview.height,
          sourceWidth: source.width,
          sourceHeight: source.height,
        }
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [source, regions, text, opacity, size, color, tiled]);

  async function select(file?: File) {
    if (!file) return;
    const id = ++loadId.current;
    setError('');
    setBusy(true);
    setStatus('');
    try {
      validateImageFile(file);
      const image = await loadImageFromFile(file);
      if (image.naturalWidth * image.naturalHeight > 24_000_000)
        throw new Error('图片超过 2400 万像素，请先缩小尺寸后再编辑。');
      if (id !== loadId.current) return;
      const scale = Math.min(
        1,
        1440 / Math.max(image.naturalWidth, image.naturalHeight)
      );
      const preview = document.createElement('canvas');
      preview.width = Math.max(1, Math.round(image.naturalWidth * scale));
      preview.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = preview.getContext('2d');
      if (!context) throw new Error('当前浏览器不支持图片预览。');
      context.drawImage(image, 0, 0, preview.width, preview.height);
      setSource({
        width: image.naturalWidth,
        height: image.naturalHeight,
        name: file.name,
        file,
        preview,
      });
      setRegions([]);
      clearDraft();
      origin.current = null;
    } catch (e) {
      if (id === loadId.current) setError(messageOf(e));
    } finally {
      if (id === loadId.current) setBusy(false);
    }
  }
  function point(e: PointerEvent<HTMLCanvasElement>) {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(
          source!.width,
          ((e.clientX - rect.left) * source!.width) / rect.width
        )
      ),
      y: Math.max(
        0,
        Math.min(
          source!.height,
          ((e.clientY - rect.top) * source!.height) / rect.height
        )
      ),
    };
  }
  function rectangle(e: PointerEvent<HTMLCanvasElement>) {
    const p = point(e);
    const start = origin.current!;
    return {
      x: Math.floor(Math.min(p.x, start.x)),
      y: Math.floor(Math.min(p.y, start.y)),
      width: Math.ceil(Math.abs(p.x - start.x)),
      height: Math.ceil(Math.abs(p.y - start.y)),
    };
  }
  function addManual() {
    if (!source) return;
    const r = {
      x: Number(manual.x),
      y: Number(manual.y),
      width: Number(manual.width),
      height: Number(manual.height),
    };
    if (
      Object.values(manual).some((v) => !v.trim()) ||
      Object.values(r).some((v) => !Number.isInteger(v)) ||
      r.x < 0 ||
      r.y < 0 ||
      r.width < 1 ||
      r.height < 1 ||
      r.x + r.width > source.width ||
      r.y + r.height > source.height
    ) {
      setError('请输入图片范围内的整数坐标和宽高，宽高须大于 0。');
      return;
    }
    setError('');
    setRegions((prev) => [...prev, r]);
  }
  async function exportImage(compress: boolean) {
    if (!source || busy) return;
    const current = ++exportId.current;
    setBusy(true);
    setError('');
    setStatus('正在生成原尺寸图片…');
    try {
      let blob: Blob;
      if (
        typeof OffscreenCanvas !== 'undefined' &&
        typeof createImageBitmap === 'function'
      ) {
        blob = await worker.run<Blob>({
          file: source.file,
          regions,
          watermark: { text, opacity, size, color, tiled },
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 30));
        const output = document.createElement('canvas');
        drawProtectedImage(
          output,
          await loadImageFromFile(source.file),
          regions,
          {
            text,
            opacity,
            size,
            color,
            tiled,
          }
        );
        blob = await canvasBlob(output);
        output.width = 0;
        output.height = 0;
      }
      if (current !== exportId.current) return;
      const name = `${source.name.replace(/\.[^.]+$/, '')}-protected.png`;
      if (compress && blob.size > 20 * 1024 * 1024)
        throw new Error(
          '处理后的 PNG 超过 ImageFit 的 20MB 上限，请先下载图片并缩小尺寸。'
        );
      if (compress) {
        queueImageForCompression(new File([blob], name, { type: 'image/png' }));
        navigate('/');
      } else {
        saveBlob(blob, name);
        setStatus('已生成 PNG，下载已开始。');
      }
    } catch (e) {
      if (current === exportId.current && !isTaskCancelled(e)) {
        setError(messageOf(e));
        setStatus('');
      }
    } finally {
      if (current === exportId.current) setBusy(false);
    }
  }
  return (
    <ToolLayout
      title="图片水印与隐私遮挡"
      description="框选遮挡敏感信息，添加用途水印。预览满意后下载，或继续压缩到指定大小。"
      path="/tools/image-privacy"
    >
      <ErrorNotice message={error} />
      <div className="tools-workspace">
        <section className="tools-panel">
          <h2>图片预览</h2>
          <label>
            选择图片
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(e) => {
                void select(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
          {source ? (
            <>
              <p className="tools-help">
                {source.name} · {source.width} × {source.height} px ·
                在图片上拖动添加遮挡
              </p>
              <div className="tools-canvas-wrap">
                <div className="tools-canvas-stage">
                  <canvas
                    ref={canvasRef}
                    className="tools-canvas"
                    aria-label="图片编辑预览，可拖动框选遮挡；也可使用下方坐标输入"
                    onPointerDown={(e) => {
                      if (busy || e.button !== 0 || !e.isPrimary) return;
                      e.currentTarget.setPointerCapture(e.pointerId);
                      origin.current = point(e);
                    }}
                    onPointerMove={(e) => {
                      if (origin.current) showDraft(rectangle(e));
                    }}
                    onPointerUp={(e) => {
                      if (!origin.current) return;
                      const r = rectangle(e);
                      if (r.width > 1 && r.height > 1)
                        setRegions((prev) => [...prev, r]);
                      origin.current = null;
                      clearDraft();
                    }}
                    onPointerCancel={() => {
                      origin.current = null;
                      clearDraft();
                    }}
                  />
                  <div
                    ref={selectionRef}
                    className="tools-selection"
                    hidden
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="tools-actions">
                <button
                  disabled={!regions.length || busy}
                  onClick={() => setRegions((prev) => prev.slice(0, -1))}
                >
                  撤销上一步遮挡
                </button>
                <button
                  disabled={!regions.length || busy}
                  onClick={() => setRegions([])}
                >
                  清除遮挡
                </button>
              </div>
              <p className="tools-help">
                已添加 {regions.length} 处实色遮挡。遮挡会写入导出图片。
              </p>
              <details>
                <summary>精确添加遮挡（像素坐标）</summary>
                <div className="tools-editor-grid">
                  {(['x', 'y', 'width', 'height'] as const).map((key, i) => (
                    <label key={key}>
                      {['左侧 X', '顶部 Y', '宽度', '高度'][i]}
                      <input
                        type="number"
                        min={i < 2 ? 0 : 1}
                        value={manual[key]}
                        onChange={(e) =>
                          setManual({ ...manual, [key]: e.target.value })
                        }
                      />
                    </label>
                  ))}
                </div>
                <button disabled={busy} onClick={addManual}>
                  添加遮挡区域
                </button>
              </details>
            </>
          ) : (
            <div className="tools-empty">
              <span className="tools-mark">▧</span>
              <strong>
                {busy ? '正在读取图片…' : '先选一张需要处理的图片'}
              </strong>
              <p>支持 JPG、PNG、WebP，单张不超过 20MB / 2400 万像素</p>
            </div>
          )}
        </section>
        <section className="tools-panel">
          <h2>用途水印</h2>
          <fieldset disabled={busy}>
            <label>
              水印文字
              <input
                value={text}
                maxLength={60}
                placeholder="留空则不添加水印"
                onChange={(e) => setText(e.target.value)}
              />
            </label>
            <label>
              排列方式
              <select
                value={tiled ? 'tile' : 'bottom'}
                onChange={(e) => setTiled(e.target.value === 'tile')}
              >
                <option value="tile">全图平铺</option>
                <option value="bottom">底部居中</option>
              </select>
            </label>
            <label>
              不透明度 · {opacity}%
              <input
                type="range"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
            </label>
            <label>
              文字大小 · {size}%
              <input
                type="range"
                min="2"
                max="8"
                step="0.5"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </label>
            <label>
              文字颜色
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </label>
          </fieldset>
          <button
            className="tools-primary tools-full"
            disabled={!source || busy}
            onClick={() => void exportImage(false)}
          >
            {busy ? '正在处理…' : '下载处理后的 PNG'}
          </button>
          <button
            className="tools-full"
            disabled={!source || busy}
            onClick={() => void exportImage(true)}
          >
            继续用 ImageFit 压缩 →
          </button>
          <p className="tools-help">
            导出保留原图尺寸。水印文字留空即可只做遮挡。
          </p>
          {busy && status === '正在生成原尺寸图片…' && (
            <button
              className="tools-full"
              onClick={() => {
                exportId.current++;
                worker.cancel();
                setBusy(false);
                setStatus('已取消导出。');
              }}
            >
              取消导出
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
