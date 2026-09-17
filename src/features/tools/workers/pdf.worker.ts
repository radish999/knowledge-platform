import type { PDFDocument } from 'pdf-lib';
import {
  combinePdfPages,
  imagesToPdf,
  parsePageSelection,
  readPdf,
} from '../pdf-utils';
import type { TaskRequest } from '../task-worker';

interface Source {
  id: string;
  file: File;
  pages: string;
}
type Request =
  | { kind: 'release'; keep: string[] }
  | { kind: 'inspect'; sources: Source[]; keep: string[] }
  | {
      kind: 'export';
      sources: Source[];
      mode: 'images' | 'merge' | 'extract';
      layout: 'a4' | 'original';
    };
const documents = new Map<string, PDFDocument>();
function retain(ids: string[]) {
  const keep = new Set(ids);
  for (const id of documents.keys()) if (!keep.has(id)) documents.delete(id);
}
async function documentFor(source: Source) {
  let document = documents.get(source.id);
  if (!document) {
    document = await readPdf(await source.file.arrayBuffer());
    documents.set(source.id, document);
  }
  return document;
}
async function jpegBytes(file: File) {
  const image = await createImageBitmap(file);
  let canvas: OffscreenCanvas | undefined;
  try {
    if (image.width * image.height > 24_000_000)
      throw new Error(`${file.name} 超过 2400 万像素，请先缩小图片。`);
    canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('当前浏览器不支持图片转换。');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    return new Uint8Array(
      await (
        await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 })
      ).arrayBuffer()
    );
  } finally {
    image.close();
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}
self.onmessage = async ({ data }: MessageEvent<TaskRequest<Request>>) => {
  const { id, payload } = data;
  const progress = (message: string) =>
    self.postMessage({ id, progress: message });
  try {
    if (payload.kind === 'release') {
      retain(payload.keep);
      return;
    }
    if (payload.kind === 'inspect') {
      const previous = [...documents.keys()];
      retain(payload.keep);
      try {
        const counts: number[] = [];
        for (let i = 0; i < payload.sources.length; i++) {
          progress(`正在读取 PDF ${i + 1} / ${payload.sources.length}…`);
          counts.push((await documentFor(payload.sources[i])).getPageCount());
        }
        self.postMessage({ id, result: counts });
      } catch (error) {
        retain(previous);
        throw error;
      }
      return;
    }
    retain(payload.sources.map((s) => s.id));
    let bytes: Uint8Array, count: number;
    if (payload.mode === 'images') {
      const imageSources = payload.sources;
      async function* images() {
        for (let i = 0; i < imageSources.length; i++) {
          progress(`正在处理图片 ${i + 1} / ${imageSources.length}…`);
          yield await jpegBytes(imageSources[i].file);
        }
      }
      bytes = await imagesToPdf(images(), payload.layout);
      count = payload.sources.length;
    } else {
      const sources = [];
      for (let i = 0; i < payload.sources.length; i++) {
        progress(`正在整理 PDF ${i + 1} / ${payload.sources.length}…`);
        const source = payload.sources[i],
          document = await documentFor(source);
        sources.push({
          document,
          pages: parsePageSelection(source.pages, document.getPageCount()),
        });
      }
      count = sources.reduce((n, s) => n + s.pages.length, 0);
      progress(`正在生成 ${count} 页 PDF…`);
      bytes = await combinePdfPages(sources);
    }
    const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
    self.postMessage({ id, result: { blob, pages: count } });
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : 'PDF 处理失败，请重试。',
    });
  }
};
