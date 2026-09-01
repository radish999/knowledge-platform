import type { ImagePreset } from './types';

export const IMAGE_PRESETS: readonly ImagePreset[] = [
  {
    id: 'application-photo',
    name: '常用报名照',
    format: 'image/jpeg',
    maxSizeKB: 100,
    width: 295,
    height: 413,
  },
  {
    id: 'one-inch-photo',
    name: '标准一寸照',
    format: 'image/jpeg',
    maxSizeKB: 200,
    width: 295,
    height: 413,
  },
  {
    id: 'square-avatar',
    name: '方形头像',
    format: 'image/jpeg',
    maxSizeKB: 200,
    width: 600,
    height: 600,
  },
  {
    id: 'web-image',
    name: '网页配图',
    format: 'image/webp',
    maxSizeKB: 200,
    width: 1200,
    height: 800,
  },
] as const;
