export type OutputFormat = 'image/jpeg' | 'image/webp';

export interface ImageRequirement {
  format: OutputFormat;
  maxSizeKB: number;
  width: number;
  height: number;
  keepAspectRatio: boolean;
  presetName?: string;
}

export interface ImagePreset {
  id: string;
  name: string;
  format: OutputFormat;
  maxSizeKB: number;
  width: number;
  height: number;
}

export interface ImageMetadata {
  name: string;
  size: number;
  width: number;
  height: number;
}

export interface CompressionResult {
  blob: Blob;
  width: number;
  height: number;
  format: OutputFormat;
  quality: number;
  meetsTarget: boolean;
}

export interface SelectedImage {
  file: File;
  metadata: ImageMetadata;
  previewUrl: string;
}
