import { useRef, useState } from 'react';

interface ImageUploaderProps {
  onSelect: (file: File) => void;
}

export default function ImageUploader({ onSelect }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickFirstFile = (files: FileList | null) => {
    const file = files?.item(0);
    if (file) onSelect(file);
  };

  return (
    <button
      className={`if-upload-zone${isDragging ? ' is-dragging' : ''}`}
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        pickFirstFile(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        className="if-visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={(event) => pickFirstFile(event.target.files)}
      />
      <span className="if-upload-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
        </svg>
      </span>
      <span className="if-upload-title">拖入照片开始处理</span>
      <span className="if-upload-action">或点击选择图片</span>
      <span className="if-upload-help">JPG / PNG / WebP · 最大 20MB</span>
    </button>
  );
}
