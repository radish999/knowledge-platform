import type { ImageMetadata } from './types';

export const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function validateImageFile(file: File): void {
  if (!ACCEPTED_IMAGE_TYPES.some((type) => type === file.type)) {
    throw new Error('仅支持 JPG、JPEG、PNG 或 WebP 图片。');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('图片超过 20MB，请选择更小的图片。');
  }
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片加载失败，请确认文件未损坏后重试。'));
    image.src = url;
  });
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await loadImageFromUrl(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function getImageMetadata(file: File): Promise<ImageMetadata> {
  validateImageFile(file);
  const image = await loadImageFromFile(file);

  return {
    name: file.name,
    size: file.size,
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatLabel(mimeType: string): string {
  return mimeType === 'image/jpeg' ? 'JPG' : 'WebP';
}
