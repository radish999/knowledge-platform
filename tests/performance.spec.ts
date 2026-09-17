import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { writeFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'default' });
async function monitor(page: Page) {
  await page.evaluate(() => {
    const state = window as unknown as {
      perfTasks: number[];
      perfObserver: PerformanceObserver;
    };
    state.perfTasks = [];
    state.perfObserver = new PerformanceObserver((list) => {
      state.perfTasks.push(...list.getEntries().map((e) => e.duration));
    });
    state.perfObserver.observe({ type: 'longtask', buffered: false });
  });
}
async function checkResponsive(page: Page, operation: string) {
  await page.waitForTimeout(150);
  const tasks = await page.evaluate(() => {
    const state = window as unknown as {
      perfTasks: number[];
      perfObserver: PerformanceObserver;
    };
    state.perfObserver.disconnect();
    return state.perfTasks;
  });
  const longest = Math.round(Math.max(0, ...tasks));
  console.log(
    JSON.stringify({
      operation,
      longestMainThreadTaskMs: longest,
      longTasks: tasks.length,
    })
  );
  expect(
    longest,
    `${operation} blocks interaction on the main thread`
  ).toBeLessThan(200);
}

test('large image dragging remains responsive', async ({ page }) => {
  await page.goto('/tools/image-privacy');
  const buffer = Buffer.from(
    await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 6000;
      canvas.height = 4000;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#f4f7fb';
      ctx.fillRect(0, 0, 6000, 4000);
      return canvas.toDataURL('image/png').split(',')[1];
    }),
    'base64'
  );
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer });
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(300);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await monitor(page);
  const box = (await page.locator('canvas').boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7, {
    steps: 20,
  });
  await page.mouse.up();
  await page.getByLabel('不透明度', { exact: false }).fill('60');
  await checkResponsive(page, '24MP image drag and watermark');
});

test('PDF processing keeps the main thread responsive', async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const pdf = await PDFDocument.create();
  for (let i = 0; i < 600; i++) {
    const p = pdf.addPage();
    for (let j = 0; j < 30; j++)
      p.drawText(`Page ${i + 1} / line ${j}`, {
        x: 30,
        y: 800 - j * 20,
        size: 12,
      });
  }
  const path = testInfo.outputPath('many-pages.pdf');
  await writeFile(path, await pdf.save());
  await page.goto('/tools/pdf');
  await page.getByRole('button', { name: '合并 PDF', exact: true }).click();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await monitor(page);
  await page.locator('input[type=file]').setInputFiles(path);
  await expect(page.getByText('1. many-pages.pdf')).toBeVisible({
    timeout: 30000,
  });
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '生成并下载 PDF' }).click();
  await pending;
  await checkResponsive(page, '600-page PDF read and export');
});

test('large text comparison keeps the main thread responsive', async ({
  page,
}) => {
  await page.goto('/tools/developer');
  await page.getByRole('button', { name: '文本对比', exact: true }).click();
  await page
    .getByLabel('原始文本')
    .fill(Array.from({ length: 1500 }, (_, i) => `before ${i}`).join('\n'));
  await page
    .getByLabel('修改后文本')
    .fill(Array.from({ length: 1500 }, (_, i) => `after ${i}`).join('\n'));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await monitor(page);
  await page.getByRole('button', { name: '对比文本', exact: true }).click();
  await expect(
    page.getByText(/新增 .* 行 · 删除 .* 行/).or(page.getByRole('alert'))
  ).toBeVisible();
  await checkResponsive(page, '1500-line text comparison');
});
