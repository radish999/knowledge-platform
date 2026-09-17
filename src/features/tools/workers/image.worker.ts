import { drawProtectedImage } from '../image-editor';
import type { Redaction, Watermark } from '../image-editor';
import type { TaskRequest } from '../task-worker';
self.onmessage = async ({
  data,
}: MessageEvent<
  TaskRequest<{ file: File; regions: Redaction[]; watermark: Watermark }>
>) => {
  const { id, payload } = data;
  let image: ImageBitmap | undefined;
  let canvas: OffscreenCanvas | undefined;
  try {
    image = await createImageBitmap(payload.file);
    canvas = new OffscreenCanvas(image.width, image.height);
    drawProtectedImage(canvas, image, payload.regions, payload.watermark);
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    self.postMessage({ id, result: blob });
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : '图片导出失败，请重试。',
    });
  } finally {
    image?.close();
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
};
