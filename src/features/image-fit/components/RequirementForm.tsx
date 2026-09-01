import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ImageRequirement, OutputFormat } from '../types';
import { IMAGE_PRESETS } from '../presets';

interface RequirementFormProps {
  originalWidth: number;
  originalHeight: number;
  processing: boolean;
  initialPresetId?: string;
  initialMaxSizeKB?: number;
  initialFormat?: OutputFormat;
  onProcess: (requirement: ImageRequirement) => void;
}

const normalizeDimension = (value: number) => Math.max(1, Math.round(Number.isFinite(value) ? value : 1));

export default function RequirementForm({
  originalWidth,
  originalHeight,
  processing,
  initialPresetId,
  initialMaxSizeKB,
  initialFormat,
  onProcess,
}: RequirementFormProps) {
  const initialPreset = IMAGE_PRESETS.find((preset) => preset.id === initialPresetId);
  const [format, setFormat] = useState<OutputFormat>(initialPreset?.format ?? initialFormat ?? 'image/jpeg');
  const [maxSizeKB, setMaxSizeKB] = useState(initialPreset?.maxSizeKB ?? initialMaxSizeKB ?? 200);
  const [width, setWidth] = useState(initialPreset?.width ?? originalWidth);
  const [height, setHeight] = useState(initialPreset?.height ?? originalHeight);
  const [keepAspectRatio, setKeepAspectRatio] = useState(!initialPreset);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(initialPreset?.id ?? null);
  const ratio = originalWidth / originalHeight;
  const selectedPreset = IMAGE_PRESETS.find((preset) => preset.id === selectedPresetId);

  const markCustom = () => setSelectedPresetId(null);

  const applyPreset = (presetId: string) => {
    const preset = IMAGE_PRESETS.find((candidate) => candidate.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setFormat(preset.format);
    setMaxSizeKB(preset.maxSizeKB);
    setWidth(preset.width);
    setHeight(preset.height);
    setKeepAspectRatio(false);
  };

  const updateWidth = (value: number) => {
    markCustom();
    const normalized = normalizeDimension(value);
    setWidth(normalized);
    if (keepAspectRatio) setHeight(Math.max(1, Math.round(normalized / ratio)));
  };

  const updateHeight = (value: number) => {
    markCustom();
    const normalized = normalizeDimension(value);
    setHeight(normalized);
    if (keepAspectRatio) setWidth(Math.max(1, Math.round(normalized * ratio)));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedMaxSize = normalizeDimension(maxSizeKB);
    setMaxSizeKB(normalizedMaxSize);
    onProcess({
      format,
      maxSizeKB: normalizedMaxSize,
      width: normalizeDimension(width),
      height: normalizeDimension(height),
      keepAspectRatio,
      presetName: selectedPreset?.name,
    });
  };

  return (
    <form className="if-requirements" onSubmit={submit}>
      <div className="if-panel-heading">
        <div>
          <span className="if-step-label">02</span>
          <h2>目标要求</h2>
        </div>
        <span className="if-local-chip">本地处理</span>
      </div>

      <fieldset className="if-field-group if-preset-group">
        <legend>合规预设</legend>
        <div className="if-preset-grid">
          {IMAGE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={selectedPresetId === preset.id ? 'selected' : ''}
              aria-pressed={selectedPresetId === preset.id}
              onClick={() => applyPreset(preset.id)}
            >
              <span className="if-preset-name">{preset.name}</span>
              <span>{preset.width} × {preset.height}</span>
              <span>{preset.format === 'image/jpeg' ? 'JPG' : 'WebP'} · ≤ {preset.maxSizeKB}KB</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="if-field-group">
        <legend>输出格式</legend>
        <div className="if-segmented-control">
          {(['image/jpeg', 'image/webp'] as const).map((value) => (
            <label key={value} className={format === value ? 'active' : ''}>
              <input
                type="radio"
                name="format"
                value={value}
                checked={format === value}
                onChange={() => {
                  markCustom();
                  setFormat(value);
                }}
              />
              {value === 'image/jpeg' ? 'JPG' : 'WebP'}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="if-field-group">
        <label htmlFor="max-size">最大文件大小</label>
        <div className="if-input-with-suffix">
          <input
            id="max-size"
            value={maxSizeKB}
            type="number"
            min="1"
            step="1"
            required
            onChange={(event) => {
              markCustom();
              setMaxSizeKB(event.target.valueAsNumber);
            }}
          />
          <span>KB</span>
        </div>
        <div className="if-quick-targets" aria-label="快捷目标">
          {[50, 100, 200].map((size) => (
            <button
              key={size}
              type="button"
              className={maxSizeKB === size ? 'selected' : ''}
              onClick={() => {
                markCustom();
                setMaxSizeKB(size);
              }}
            >
              {size}KB
            </button>
          ))}
        </div>
      </div>

      <div className="if-dimension-grid">
        <div className="if-field-group">
          <label htmlFor="target-width">宽度</label>
          <div className="if-input-with-suffix">
            <input
              id="target-width"
              value={width}
              type="number"
              min="1"
              step="1"
              required
              onChange={(event) => updateWidth(event.target.valueAsNumber)}
            />
            <span>px</span>
          </div>
        </div>
        <span className="if-dimension-x" aria-hidden="true">×</span>
        <div className="if-field-group">
          <label htmlFor="target-height">高度</label>
          <div className="if-input-with-suffix">
            <input
              id="target-height"
              value={height}
              type="number"
              min="1"
              step="1"
              required
              onChange={(event) => updateHeight(event.target.valueAsNumber)}
            />
            <span>px</span>
          </div>
        </div>
      </div>

      <label className="if-checkbox-row">
        <input
          type="checkbox"
          checked={keepAspectRatio}
          onChange={(event) => {
            const checked = event.target.checked;
            markCustom();
            setKeepAspectRatio(checked);
            if (checked) setHeight(Math.max(1, Math.round(width / ratio)));
          }}
        />
        <span aria-hidden="true" />
        {keepAspectRatio ? '保持原图比例' : '居中裁剪到精确尺寸'}
      </label>

      <button className="if-primary-button" type="submit" disabled={processing}>
        {processing ? <span className="if-spinner" aria-hidden="true" /> : (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v18M3 12h18" /></svg>
        )}
        {processing ? '正在优化图片…' : '开始处理'}
      </button>
      {processing ? (
        <div className="if-processing-progress" role="progressbar" aria-label="图片处理进度"><span /></div>
      ) : null}
    </form>
  );
}
