import type { OutputFormat } from './types';

export function downloadBlob(blob: Blob, originalName: string, format: OutputFormat): void {
  const extension = format === 'image/jpeg' ? 'jpg' : 'webp';
  const baseName = originalName.replace(/\.[^/.]+$/, '') || 'image';
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `${baseName}-imagefit.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
