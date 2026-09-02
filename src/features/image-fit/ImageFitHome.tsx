import { useCallback, useEffect, useRef, useState } from 'react';
import { compressImage } from './compressor';
import { downloadBlob } from './download';
import { formatFileSize, getImageMetadata } from './image-utils';
import type { CompressionResult, ImageRequirement, SelectedImage } from './types';
import ImageUploader from './components/ImageUploader';
import RequirementForm from './components/RequirementForm';
import ResultCard from './components/ResultCard';
import Seo from '../../components/Seo';
import { Link } from 'react-router-dom';
import { TOOL_SEO_PAGES } from './seo-pages';
import type { ToolSeoPage } from './seo-pages';
import './image-fit.css';

const homepageFaqs = [
  {
    question: '图片会上传到服务器吗？',
    answer: '不会。图片压缩、尺寸调整和格式转换都在浏览器本地完成，文件不会离开你的设备。',
  },
  {
    question: '支持哪些图片格式？',
    answer: '支持 JPG、PNG、WebP 图片输入，并可输出为 JPG 或 WebP。',
  },
  {
    question: '可以把图片压缩到指定 KB 吗？',
    answer: '可以。输入目标文件大小后，工具会在尽量保留画质的前提下，将图片压缩到指定 KB 以内。',
  },
];

interface ImageFitHomeProps {
  page?: ToolSeoPage;
}

export default function ImageFitHome({ page }: ImageFitHomeProps) {
  const [selected, setSelected] = useState<SelectedImage | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [lastRequirement, setLastRequirement] = useState<ImageRequirement | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const selectedRef = useRef<SelectedImage | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const replaceSelected = useCallback((next: SelectedImage | null) => {
    if (selectedRef.current?.previewUrl) URL.revokeObjectURL(selectedRef.current.previewUrl);
    selectedRef.current = next;
    setSelected(next);
  }, []);

  const replaceResultUrl = useCallback((next: string | null) => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = next;
    setResultUrl(next);
  }, []);

  useEffect(() => () => {
    if (selectedRef.current?.previewUrl) URL.revokeObjectURL(selectedRef.current.previewUrl);
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
  }, []);

  const selectFile = async (file: File) => {
    setError('');
    replaceSelected(null);
    replaceResultUrl(null);
    setResult(null);

    try {
      const metadata = await getImageMetadata(file);
      replaceSelected({ file, metadata, previewUrl: URL.createObjectURL(file) });
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : '无法读取这张图片，请重试。');
    }
  };

  const processImage = async (requirement: ImageRequirement) => {
    if (!selected || processing) return;
    setError('');
    setProcessing(true);
    replaceResultUrl(null);
    setResult(null);
    setLastRequirement(requirement);

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 80));
      const compressed = await compressImage(selected.file, requirement);
      setResult(compressed);
      replaceResultUrl(URL.createObjectURL(compressed.blob));
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : '图片处理失败，请稍后重试。');
    } finally {
      setProcessing(false);
    }
  };

  const restart = () => {
    replaceSelected(null);
    replaceResultUrl(null);
    setResult(null);
    setLastRequirement(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reprocess = () => {
    replaceResultUrl(null);
    setResult(null);
    setError('');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="image-fit-page">
      <Seo
        title={page?.title ?? 'ImageFit - 免费在线图片压缩与尺寸调整工具'}
        description={page?.description ?? '免费在线压缩图片到指定 KB，调整宽高并转换为 JPG 或 WebP。图片仅在浏览器本地处理，不会上传服务器。'}
        path={page?.path ?? '/'}
        structuredData={page ? {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: `${page.h1Line1}${page.h1Line2}`,
          url: `https://www.goodbai.baby${page.path}`,
          description: page.description,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Any',
          isAccessibleForFree: true,
        } : {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebApplication',
              name: 'ImageFit',
              url: 'https://www.goodbai.baby/',
              description: '免费的在线图片压缩与尺寸调整工具，可指定文件大小、宽高及 JPG 或 WebP 输出格式。',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Any',
              browserRequirements: 'Requires JavaScript and HTML5 Canvas support',
              inLanguage: 'zh-CN',
              isAccessibleForFree: true,
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
              featureList: ['图片压缩到指定 KB', '调整图片宽度和高度', '转换为 JPG 或 WebP', '浏览器本地处理图片'],
            },
            {
              '@type': 'FAQPage',
              mainEntity: homepageFaqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
              })),
            },
          ],
        }}
      />
      <main className="if-main">
        <section className="if-intro" aria-labelledby="imagefit-title">
          <div className="if-eyebrow"><span /> {page?.eyebrow ?? 'ImageFit 图片上传合规助手'}</div>
          <h1 id="imagefit-title">
            {page?.h1Line1 ?? '免费在线图片压缩'}<br />{page?.h1Line2 ?? '与尺寸调整'}
          </h1>
          <p>{page?.subtitle ?? '指定文件大小、尺寸和格式，一键生成可以上传的图片。'}</p>
          <div className="if-privacy-inline">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            图片不会上传服务器，仅在浏览器本地处理
          </div>
        </section>

        {error ? (
          <div className="if-error-banner" role="alert">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 4h.01" /></svg>
            <span>{error}</span>
            <button type="button" aria-label="关闭错误提示" onClick={() => setError('')}>×</button>
          </div>
        ) : null}

        {result && resultUrl && lastRequirement ? (
          <ResultCard
            result={result}
            previewUrl={resultUrl}
            requirement={lastRequirement}
            onDownload={() => selected && downloadBlob(result.blob, selected.metadata.name, result.format)}
            onReprocess={reprocess}
            onRestart={restart}
          />
        ) : selected ? (
          <section className="if-workspace" aria-label="图片处理工作台">
            <article className="if-source-panel">
              <div className="if-panel-heading">
                <div><span className="if-step-label">01</span><h2>原始图片</h2></div>
                <button className="if-replace-button" type="button" onClick={restart}>更换图片</button>
              </div>
              <div className="if-source-preview"><img src={selected.previewUrl} alt="原始图片预览" /></div>
              <dl className="if-source-meta">
                <div className="filename-row"><dt>文件名</dt><dd title={selected.metadata.name}>{selected.metadata.name}</dd></div>
                <div><dt>文件大小</dt><dd>{formatFileSize(selected.metadata.size)}</dd></div>
                <div><dt>图片尺寸</dt><dd>{selected.metadata.width} × {selected.metadata.height} px</dd></div>
              </dl>
            </article>
            <RequirementForm
              key={selected.previewUrl}
              originalWidth={selected.metadata.width}
              originalHeight={selected.metadata.height}
              processing={processing}
              initialPresetId={page?.presetId}
              initialMaxSizeKB={page?.initialMaxSizeKB}
              initialFormat={page?.initialFormat}
              onProcess={processImage}
            />
          </section>
        ) : <ImageUploader onSelect={selectFile} />}

        <nav className="if-target-links" aria-label="常用图片处理目标">
          {TOOL_SEO_PAGES.map((target) => (
            <Link key={target.path} to={target.path} aria-current={page?.path === target.path ? 'page' : undefined}>
              {target.eyebrow}
            </Link>
          ))}
        </nav>

        <section className="if-trust-strip" aria-label="产品特点">
          <article><span className="if-feature-icon" aria-hidden="true">⌑</span><div><h2>本地处理</h2><p>图片不会上传服务器</p></div></article>
          <article><span className="if-feature-icon" aria-hidden="true">↯</span><div><h2>快速处理</h2><p>浏览器直接完成压缩</p></div></article>
          <article><span className="if-feature-icon" aria-hidden="true">◎</span><div><h2>精确控制</h2><p>指定 KB / 尺寸 / 格式</p></div></article>
        </section>

        {!page ? (
          <section className="if-seo-content" aria-labelledby="imagefit-guide-title">
            <div className="if-seo-intro">
              <h2 id="imagefit-guide-title">在线压缩图片、修改尺寸和转换格式</h2>
              <p>
                ImageFit 支持 JPG、PNG、WebP 图片，可按上传要求指定目标 KB、宽度和高度，并输出 JPG 或 WebP。
                所有处理均在浏览器本地完成，无需上传图片，也无需安装软件。
              </p>
            </div>
            <div className="if-seo-steps" aria-label="图片处理步骤">
              <article><span>1</span><h3>选择图片</h3><p>上传 JPG、PNG 或 WebP 文件。</p></article>
              <article><span>2</span><h3>设置上传要求</h3><p>填写目标 KB、图片尺寸和输出格式。</p></article>
              <article><span>3</span><h3>压缩并下载</h3><p>本地生成符合要求的新图片。</p></article>
            </div>
            <div className="if-faq">
              <h2>图片压缩常见问题</h2>
              {homepageFaqs.map((faq) => (
                <article key={faq.question}>
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="if-footer">
        <span>ImageFit · GoodBai</span>
        <span>你的图片始终留在本机</span>
      </footer>
    </div>
  );
}
