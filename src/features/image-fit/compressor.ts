import { loadImageFromFile } from './image-utils';
import type { CompressionResult, ImageRequirement } from './types';

const MIN_QUALITY = 0.05;
const MAX_QUALITY = 0.95;
const MAX_ITERATIONS = 10;

function calculateOutputSize(
  sourceWidth: number,
  sourceHeight: number,
  requirement: ImageRequirement,
): { width: number; height: number } {
  const targetWidth = Math.max(1, Math.round(requirement.width));
  const targetHeight = Math.max(1, Math.round(requirement.height));

  if (!requirement.keepAspectRatio) return { width: targetWidth, height: targetHeight };

  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('浏览器无法生成该格式的图片，请更换格式后重试。'));
      },
      format,
      quality,
    );
  });
}

type OutputFormat = ImageRequirement['format'];

export async function compressImage(
  file: File,
  requirement: ImageRequirement,
): Promise<CompressionResult> {
  const image = await loadImageFromFile(file);
  const { width, height } = calculateOutputSize(
    image.naturalWidth,
    image.naturalHeight,
    requirement,
  );
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('当前浏览器不支持 Canvas 图片处理。');

  if (requirement.format === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  if (requirement.keepAspectRatio) {
    context.drawImage(image, 0, 0, width, height);
  } else {
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = width / height;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;

    if (sourceRatio > targetRatio) {
      sourceWidth = image.naturalHeight * targetRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = image.naturalWidth / targetRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      width,
      height,
    );
  }

  const maxBytes = requirement.maxSizeKB * 1024;
  const minimumQualityBlob = await canvasToBlob(canvas, requirement.format, MIN_QUALITY);
  if (minimumQualityBlob.size > maxBytes) {
    throw new Error('当前图片尺寸较大，无法在保持较高画质的情况下达到目标大小，请降低目标尺寸后重试。');
  }

  let low = MIN_QUALITY;
  let high = MAX_QUALITY;
  let bestBlob = minimumQualityBlob;
  let bestQuality = MIN_QUALITY;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
    const quality = (low + high) / 2;
    const blob = await canvasToBlob(canvas, requirement.format, quality);

    if (blob.size <= maxBytes) {
      bestBlob = blob;
      bestQuality = quality;
      low = quality;
    } else {
      high = quality;
    }
  }

  return {
    blob: bestBlob,
    width,
    height,
    format: requirement.format,
    quality: bestQuality,
    meetsTarget: bestBlob.size <= maxBytes,
  };
}
