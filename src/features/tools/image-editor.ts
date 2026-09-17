export interface Redaction {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface Watermark {
  text: string;
  opacity: number;
  size: number;
  color: string;
  tiled: boolean;
}
export function drawProtectedImage(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  image: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  regions: Redaction[],
  watermark: Watermark,
  preview?: {
    width: number;
    height: number;
    sourceWidth: number;
    sourceHeight: number;
  }
) {
  const width =
    preview?.sourceWidth ??
    ('naturalWidth' in image ? image.naturalWidth : image.width);
  const height =
    preview?.sourceHeight ??
    ('naturalHeight' in image ? image.naturalHeight : image.height);
  const outputWidth = preview?.width ?? width;
  const outputHeight = preview?.height ?? height;
  // Resizing clears the backing store; keep it allocated between preview frames.
  if (canvas.width !== outputWidth) canvas.width = outputWidth;
  if (canvas.height !== outputHeight) canvas.height = outputHeight;
  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) throw new Error('当前浏览器不支持图片编辑，请换用现代浏览器。');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(canvas.width / width, canvas.height / height);
  ctx.drawImage(image, 0, 0, width, height);
  ctx.fillStyle = '#111827';
  for (const region of regions)
    ctx.fillRect(region.x, region.y, region.width, region.height);
  if (!watermark.text.trim()) return;
  ctx.save();
  ctx.globalAlpha = watermark.opacity / 100;
  ctx.fillStyle = watermark.color;
  // Scale with the image so the control has the same visual effect at any resolution.
  const fontSize = Math.max(
    10,
    (Math.min(width, height) * watermark.size) / 100
  );
  ctx.font = `600 ${fontSize}px "PingFang SC", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (watermark.tiled) {
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 7);
    const diagonal = Math.hypot(width, height);
    const stepX = Math.max(
      ctx.measureText(watermark.text).width + fontSize * 3,
      fontSize * 8
    );
    for (let y = -diagonal; y < diagonal; y += fontSize * 5) {
      for (let x = -diagonal; x < diagonal; x += stepX)
        ctx.fillText(watermark.text, x, y);
    }
  } else {
    ctx.fillText(
      watermark.text,
      width / 2,
      height - fontSize * 1.5,
      width * 0.92
    );
  }
  ctx.restore();
}
export function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('图片导出失败，请选择较小的图片重试。')),
      'image/png'
    )
  );
}
