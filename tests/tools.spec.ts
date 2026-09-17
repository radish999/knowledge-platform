import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { readFile } from 'node:fs/promises';
import {
  combinePdfPages,
  parsePageSelection,
  readPdf,
} from '../src/features/tools/pdf-utils';
import {
  compareText,
  dateFromInput,
  dateFromTimestamp,
  formatJson,
} from '../src/features/tools/developer-utils';

test('page selection validates ranges and keeps user order and duplicates', () => {
  expect(parsePageSelection('3,1-2,3', 3)).toEqual([2, 0, 1, 2]);
  expect(parsePageSelection('1，3', 3)).toEqual([0, 2]);
  expect(parsePageSelection('', 3)).toEqual([0, 1, 2]);
  for (const invalid of ['0', '4', '2-1', '1,', '1.5', '-1', 'a'])
    expect(() => parsePageSelection(invalid, 3)).toThrow();
  expect(() => parsePageSelection('1-2001', 2001)).toThrow();
});

test('PDF exports retain selected page sizes, order, and duplicate pages', async () => {
  const a = await PDFDocument.create();
  a.addPage([200, 300]);
  a.addPage([300, 400]);
  a.addPage([400, 500]);
  const b = await PDFDocument.create();
  b.addPage([500, 600]);
  const bytes = await combinePdfPages([
    { document: a, pages: parsePageSelection('3,1,1', 3) },
    { document: b, pages: [0] },
  ]);
  const result = await PDFDocument.load(bytes);
  expect(result.getPages().map((p) => p.getWidth())).toEqual([
    400, 200, 200, 500,
  ]);
  await expect(
    readPdf(new TextEncoder().encode('not a PDF').buffer)
  ).rejects.toThrow('无法读取 PDF');
  const form = await PDFDocument.create();
  const page = form.addPage();
  form.getForm().createTextField('name').addToPage(page);
  await expect(
    readPdf(new Uint8Array(await form.save()).buffer)
  ).rejects.toThrow('交互表单');
});

test('developer conversions handle invalid JSON, dates, epochs and whitespace changes', () => {
  expect(formatJson('{"a":1}')).toBe('{\n  "a": 1\n}');
  expect(formatJson('{ "a": 1 }', true)).toBe('{"a":1}');
  expect(() => formatJson('{"a":}')).toThrow('JSON 格式有误');
  expect(dateFromTimestamp('0', 'seconds').toISOString()).toBe(
    '1970-01-01T00:00:00.000Z'
  );
  expect(dateFromTimestamp('-1', 'milliseconds').getTime()).toBe(-1);
  expect(() => dateFromTimestamp('1e3', 'seconds')).toThrow();
  expect(() => dateFromTimestamp('9007199254740992', 'milliseconds')).toThrow();
  expect(dateFromInput('2024-02-29T12:30:45.123', 'utc').toISOString()).toBe(
    '2024-02-29T12:30:45.123Z'
  );
  expect(() => dateFromInput('2025-02-29T12:30', 'utc')).toThrow();
  expect(compareText('a\n', 'a \n').some((c) => c.added || c.removed)).toBe(
    true
  );
  expect(compareText('a\n', 'a').some((c) => c.added || c.removed)).toBe(true);
});

test('JSON, diff, and timestamp tools respond to edits and invalid input', async ({
  page,
}) => {
  await page.goto('/tools/developer');
  await page.getByRole('button', { name: '填入示例' }).click();
  await page.getByRole('button', { name: '格式化 JSON', exact: true }).click();
  await expect(page.getByLabel('处理结果')).toHaveValue(/GoodBai/);
  expect(JSON.parse(await page.getByLabel('处理结果').inputValue()).name).toBe(
    'GoodBai'
  );
  await page.getByLabel('输入 JSON').fill('{');
  await page.getByRole('button', { name: '格式化 JSON', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('JSON 格式有误');
  await page.getByRole('button', { name: '文本对比', exact: true }).click();
  await page.getByLabel('原始文本').fill('one\ntwo\n');
  await page.getByLabel('修改后文本').fill('one\nthree\n');
  await page.getByRole('button', { name: '对比文本', exact: true }).click();
  await expect(page.getByText('新增 1 行 · 删除 1 行')).toBeVisible();
  await page.getByRole('button', { name: '时间戳转换', exact: true }).click();
  await page.getByLabel('时间戳', { exact: true }).fill('0');
  await page.getByRole('button', { name: '转换为日期' }).click();
  await expect(page.getByText(/UTC：1970-01-01/)).toBeVisible();
  await page.getByLabel('日期与时间').fill('2026-09-17T00:00');
  await page.getByLabel('输入时区').selectOption('utc');
  await page.getByRole('button', { name: '转换为时间戳' }).click();
  await expect(page.getByText(/UTC：2026-09-17T00:00:00.000Z/)).toBeVisible();
});

async function imageFixture(page: import('@playwright/test').Page) {
  return Buffer.from(
    await page.evaluate(() => {
      const c = document.createElement('canvas');
      c.width = 800;
      c.height = 500;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 500);
      ctx.fillStyle = '#1769e0';
      ctx.fillRect(0, 0, 800, 90);
      ctx.fillStyle = '#172033';
      ctx.font = '28px sans-serif';
      ctx.fillText('GoodBai / document sample', 35, 160);
      ctx.fillText('Name: SAMPLE', 35, 240);
      return c.toDataURL('image/png').split(',')[1];
    }),
    'base64'
  );
}

test('image redaction is baked into downloaded pixels and hands off to ImageFit', async ({
  page,
}, testInfo) => {
  await page.goto('/tools/image-privacy');
  await page.locator('input[type=file]').setInputFiles({
    name: 'sample.png',
    mimeType: 'image/png',
    buffer: await imageFixture(page),
  });
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByLabel('水印文字').fill('');
  await page.getByText('精确添加遮挡（像素坐标）').click();
  await page.getByLabel('左侧 X').fill('30');
  await page.getByLabel('顶部 Y').fill('200');
  await page.getByLabel('宽度', { exact: true }).fill('280');
  await page.getByLabel('高度', { exact: true }).fill('60');
  await page.getByRole('button', { name: '添加遮挡区域' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载处理后的 PNG' }).click();
  const download = await downloadPromise;
  const path = testInfo.outputPath('protected.png');
  await download.saveAs(path);
  const bytes = await readFile(path);
  const pixel = await page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const c = document.createElement('canvas');
    c.width = image.width;
    c.height = image.height;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    return [...ctx.getImageData(50, 220, 1, 1).data];
  }, bytes.toString('base64'));
  expect(pixel).toEqual([17, 24, 39, 255]);
  await page.getByRole('button', { name: '撤销上一步遮挡' }).click();
  await expect(
    page.getByText('已添加 0 处实色遮挡。遮挡会写入导出图片。')
  ).toBeVisible();
  // Real pointer coordinates also map from the scaled preview to image pixels.
  const box = (await page.locator('canvas').boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 120);
  await page.mouse.down();
  await page.mouse.move(box.x + 180, box.y + 170);
  await page.mouse.up();
  await expect(
    page.getByText('已添加 1 处实色遮挡。遮挡会写入导出图片。')
  ).toBeVisible();
  await page.getByLabel('水印文字').fill('仅供资料审核使用');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath('image-editor.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: '继续用 ImageFit 压缩 →' }).click();
  await expect(page).toHaveURL('/');
  await expect(
    page.getByText('sample-protected.png', { exact: true })
  ).toBeVisible();
});

test('PDF UI exports images and selected/reordered PDF pages', async ({
  page,
}, testInfo) => {
  await page.goto('/tools/pdf');
  await page.locator('input[type=file]').setInputFiles({
    name: 'sample.png',
    mimeType: 'image/png',
    buffer: await imageFixture(page),
  });
  await expect(page.getByText('1. sample.png')).toBeVisible();
  let pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '生成并下载 PDF' }).click();
  let path = testInfo.outputPath('images.pdf');
  await (await pending).saveAs(path);
  let document = await PDFDocument.load(await readFile(path));
  expect(document.getPageCount()).toBe(1);
  expect(document.getPage(0).getWidth()).toBeCloseTo(595.28, 1);
  await page.getByRole('button', { name: '拆分 / 页面排序' }).click();
  const source = await PDFDocument.create();
  source.addPage([200, 300]);
  source.addPage([300, 400]);
  source.addPage([400, 500]);
  await page.locator('input[type=file]').setInputFiles({
    name: 'pages.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await source.save()),
  });
  await page.getByLabel('pages.pdf 的导出页码').fill('4');
  await page.getByRole('button', { name: '生成并下载 PDF' }).click();
  await expect(page.getByRole('alert')).toContainText('1–3');
  await page.getByLabel('pages.pdf 的导出页码').fill('3,1');
  pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '生成并下载 PDF' }).click();
  path = testInfo.outputPath('reordered.pdf');
  await (await pending).saveAs(path);
  document = await PDFDocument.load(await readFile(path));
  expect(document.getPages().map((p) => p.getWidth())).toEqual([400, 200]);
  await page.getByRole('button', { name: '合并 PDF', exact: true }).click();
  const files = [
    {
      name: 'first.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(await source.save()),
    },
    {
      name: 'second.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(await document.save()),
    },
  ];
  await page.locator('input[type=file]').setInputFiles(files);
  await page.getByRole('button', { name: '上移 second.pdf' }).click();
  pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '生成并下载 PDF' }).click();
  path = testInfo.outputPath('merged.pdf');
  await (await pending).saveAs(path);
  document = await PDFDocument.load(await readFile(path));
  expect(document.getPages().map((p) => p.getWidth())).toEqual([
    400, 200, 200, 300, 400,
  ]);
});

for (const width of [390, 1280])
  test(`tool navigation and layout at ${width}px`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/tools',
      '/tools/image-privacy',
      '/tools/pdf',
      '/tools/developer',
    ]) {
      await page.goto(path);
      await expect(page.locator('.tools-heading h1')).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(path.replaceAll('/', '-') + '.png'),
        fullPage: true,
        animations: 'disabled',
      });
    }
    await page.goto('/tools');
    if (width < 760) {
      await page.getByRole('button', { name: '打开菜单' }).click();
      await expect(
        page.getByRole('link', { name: '工具箱', exact: true })
      ).toBeVisible();
    }
    await page.getByRole('button', { name: /亮色|暗色/ }).click();
    await expect(page.locator('.dark .tools-page')).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath('dark.png'),
      fullPage: true,
      animations: 'disabled',
    });
    expect(errors).toEqual([]);
  });

test('scaled preview exports original dimensions and correct pointer coordinates', async ({
  page,
}) => {
  await page.goto('/tools/image-privacy');
  const bytes = Buffer.from(
    await page.evaluate(() => {
      const c = document.createElement('canvas');
      c.width = 3000;
      c.height = 2000;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      return c.toDataURL('image/png').split(',')[1];
    }),
    'base64'
  );
  await page.locator('input[type=file]').setInputFiles({
    name: 'original.png',
    mimeType: 'image/png',
    buffer: bytes,
  });
  await expect(page.locator('canvas')).toHaveAttribute('width', '1440');
  await page.getByLabel('水印文字').fill('');
  const box = (await page.locator('canvas').boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.25);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.up();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载处理后的 PNG' }).click();
  const download = await pending;
  const data = (await readFile((await download.path())!)).toString('base64');
  const actual = await page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const c = document.createElement('canvas');
    c.width = image.width;
    c.height = image.height;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    return {
      width: image.width,
      height: image.height,
      masked: [...ctx.getImageData(900, 600, 1, 1).data],
      clear: [...ctx.getImageData(100, 100, 1, 1).data],
    };
  }, data);
  expect(actual).toEqual({
    width: 3000,
    height: 2000,
    masked: [17, 24, 39, 255],
    clear: [255, 255, 255, 255],
  });
});

test('text jobs can be cancelled and do not overwrite subsequent input or results', async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const pattern = '**/workers/developer.worker.ts*';
  await page.route(pattern, async (route) => {
    await gate;
    await route.continue().catch(() => {});
  });
  await page.goto('/tools/developer');
  await page.getByLabel('输入 JSON').fill('{"old":true}');
  await page.getByRole('button', { name: '格式化 JSON', exact: true }).click();
  await page.getByRole('button', { name: '取消处理', exact: true }).click();
  release();
  await page.unroute(pattern);
  await page.getByLabel('输入 JSON').fill('{"new":true}');
  await page.getByRole('button', { name: '格式化 JSON', exact: true }).click();
  await expect(page.getByLabel('处理结果')).toHaveValue('{\n  "new": true\n}');
  await page.getByRole('button', { name: '文本对比', exact: true }).click();
  await page.getByRole('button', { name: 'JSON 格式化', exact: true }).click();
  await expect(page.getByLabel('输入 JSON')).toHaveValue('{"new":true}');
  await expect(page.getByLabel('处理结果')).toHaveValue('{\n  "new": true\n}');
});

test('PDF cancellation permits a fresh job without stale file results', async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const pattern = '**/workers/pdf.worker.ts*';
  await page.route(pattern, async (route) => {
    await gate;
    await route.continue().catch(() => {});
  });
  await page.goto('/tools/pdf');
  await page.getByRole('button', { name: '合并 PDF', exact: true }).click();
  const pdf = await PDFDocument.create();
  pdf.addPage([200, 300]);
  const file = {
    name: 'first.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await pdf.save()),
  };
  await page.locator('input[type=file]').setInputFiles(file);
  await page.getByRole('button', { name: '取消处理', exact: true }).click();
  await expect(page.getByText('已取消处理，可重新开始。')).toBeVisible();
  release();
  await page.unroute(pattern);
  await page
    .locator('input[type=file]')
    .setInputFiles({ ...file, name: 'second.pdf' });
  await expect(page.getByText('1. second.pdf')).toBeVisible();
  await expect(page.getByText('1. first.pdf')).toHaveCount(0);
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '生成并下载 PDF' }).click();
  const result = await PDFDocument.load(
    await readFile((await (await pending).path())!)
  );
  expect(result.getPage(0).getSize()).toEqual({ width: 200, height: 300 });
});

test('long diff results remain complete across result pages', async ({
  page,
}) => {
  await page.goto('/tools/developer');
  await page.getByRole('button', { name: '文本对比', exact: true }).click();
  await page
    .getByLabel('原始文本')
    .fill(Array.from({ length: 130 }, (_, i) => `old-${i}`).join('\n'));
  await page
    .getByLabel('修改后文本')
    .fill(Array.from({ length: 130 }, (_, i) => `new-${i}`).join('\n'));
  await page.getByRole('button', { name: '对比文本', exact: true }).click();
  await expect(page.getByText('新增 130 行 · 删除 130 行')).toBeVisible();
  await expect(page.getByLabel('文本差异结果')).toContainText('old-0');
  await page.getByRole('button', { name: '下一段' }).click();
  await expect(page.getByLabel('文本差异结果')).toContainText('old-129');
  await page.getByRole('button', { name: '下一段' }).click();
  await expect(page.getByLabel('文本差异结果')).toContainText('new-129');
  await expect(page.getByRole('button', { name: '下一段' })).toBeDisabled();
});

test('image and PDF exports work without OffscreenCanvas', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'OffscreenCanvas', {
      value: undefined,
      configurable: true,
    })
  );
  await page.goto('/tools/image-privacy');
  const file = {
    name: 'fallback.png',
    mimeType: 'image/png',
    buffer: await imageFixture(page),
  };
  await page.locator('input[type=file]').setInputFiles(file);
  await expect(page.locator('canvas')).toBeVisible();
  let pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载处理后的 PNG' }).click();
  const png = await readFile((await (await pending).path())!);
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  await page.goto('/tools/pdf');
  await page.locator('input[type=file]').setInputFiles(file);
  pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '生成并下载 PDF' }).click();
  const pdf = await PDFDocument.load(
    await readFile((await (await pending).path())!)
  );
  expect(pdf.getPageCount()).toBe(1);
});
