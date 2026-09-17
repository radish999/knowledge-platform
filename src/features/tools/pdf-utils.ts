import { PDFDocument, PageSizes } from 'pdf-lib';

export function parsePageSelection(input: string, pageCount: number): number[] {
  if (!input.trim()) return Array.from({ length: pageCount }, (_, i) => i);
  const indices: number[] = [];
  for (const part of input.replaceAll('，', ',').split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('页码格式不正确，请使用 1-3,5 或 3,1,2。');
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (
      start < 1 ||
      end < 1 ||
      start > pageCount ||
      end > pageCount ||
      end < start
    )
      throw new Error(`页码须在 1–${pageCount} 之间，范围请从小到大填写。`);
    if (indices.length + end - start + 1 > 2000)
      throw new Error('一次最多导出 2000 页，请分批处理。');
    for (let n = start; n <= end; n++) indices.push(n - 1);
  }
  return indices;
}
export async function readPdf(bytes: ArrayBuffer): Promise<PDFDocument> {
  try {
    const doc = await PDFDocument.load(bytes);
    if (doc.getPageCount() === 0) throw new Error('empty');
    if (doc.getForm().getFields().length) throw new Error('interactive');
    return doc;
  } catch (error) {
    if (error instanceof Error && error.message === 'interactive')
      throw new Error(
        '暂不支持带交互表单的 PDF，请先在 PDF 阅读器中打印为普通 PDF 后再添加。'
      );
    throw new Error('无法读取 PDF。请确认文件未损坏、未加密，并至少包含一页。');
  }
}
export async function combinePdfPages(
  sources: { document: PDFDocument; pages: number[] }[]
) {
  const output = await PDFDocument.create();
  const count = sources.reduce((sum, source) => sum + source.pages.length, 0);
  if (!count || count > 2000) throw new Error('请选取 1–2000 页后导出。');
  for (const source of sources) {
    const pages = await output.copyPages(source.document, source.pages);
    pages.forEach((page) => output.addPage(page));
  }
  return output.save();
}
export async function imagesToPdf(
  images: Iterable<Uint8Array> | AsyncIterable<Uint8Array>,
  layout: 'a4' | 'original'
) {
  const output = await PDFDocument.create();
  for await (const bytes of images) {
    const image = await output.embedJpg(bytes);
    const [width, height] =
      layout === 'a4'
        ? PageSizes.A4
        : [image.width * 0.75, image.height * 0.75];
    const margin = layout === 'a4' ? 24 : 0;
    const scale = Math.min(
      (width - margin * 2) / image.width,
      (height - margin * 2) / image.height
    );
    const page = output.addPage([width, height]);
    page.drawImage(image, {
      x: (width - image.width * scale) / 2,
      y: (height - image.height * scale) / 2,
      width: image.width * scale,
      height: image.height * scale,
    });
  }
  return output.save();
}
