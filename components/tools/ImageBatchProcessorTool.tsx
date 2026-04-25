'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import CalculatorCard from '../CalculatorCard';
import { getToolBySlug } from '@/lib/toolsConfig';
import { Icon } from '@iconify/react';

type ProcessorSlug =
  | 'image-compressor-canvas'
  | 'image-resizer'
  | 'jpg-to-png-converter'
  | 'favicon-generator';

type OutputItem = {
  id: string;
  sourceName: string;
  outputName: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  width: number;
  height: number;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function sanitizeBase(name: string) {
  return name.replace(/\.[^.]+$/, '').replace(/[^\w.-]/g, '_');
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Failed to produce image blob'));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

async function processImage(
  slug: ProcessorSlug,
  file: File,
  opts: { quality: number; width: number; height: number; keepAspect: boolean },
): Promise<OutputItem[]> {
  const img = await fileToImage(file);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const base = sanitizeBase(file.name);

  const drawToCanvas = (w: number, h: number, sx = 0, sy = 0, sw = srcW, sh = srcH) => {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('Canvas not available');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    return c;
  };

  if (slug === 'jpg-to-png-converter') {
    const canvas = drawToCanvas(srcW, srcH);
    const blob = await canvasToBlob(canvas, 'image/png');
    const url = URL.createObjectURL(blob);
    return [
      {
        id: crypto.randomUUID(),
        sourceName: file.name,
        outputName: `${base}.png`,
        url,
        sizeBytes: blob.size,
        mimeType: blob.type,
        width: canvas.width,
        height: canvas.height,
      },
    ];
  }

  if (slug === 'image-compressor-canvas') {
    const type = 'image/jpeg';
    const canvas = drawToCanvas(srcW, srcH);
    const blob = await canvasToBlob(canvas, type, opts.quality);
    const url = URL.createObjectURL(blob);
    return [
      {
        id: crypto.randomUUID(),
        sourceName: file.name,
        outputName: `${base}-compressed.jpg`,
        url,
        sizeBytes: blob.size,
        mimeType: blob.type,
        width: canvas.width,
        height: canvas.height,
      },
    ];
  }

  if (slug === 'image-resizer') {
    let targetW = Math.max(1, Math.round(opts.width || srcW));
    let targetH = Math.max(1, Math.round(opts.height || srcH));
    if (opts.keepAspect) {
      if (opts.width && !opts.height) targetH = Math.round((srcH * targetW) / srcW);
      else if (!opts.width && opts.height) targetW = Math.round((srcW * targetH) / srcH);
      else if (opts.width && opts.height) {
        // fit inside requested box while keeping aspect ratio
        const scale = Math.min(targetW / srcW, targetH / srcH);
        targetW = Math.max(1, Math.round(srcW * scale));
        targetH = Math.max(1, Math.round(srcH * scale));
      }
    }
    const canvas = drawToCanvas(targetW, targetH);
    const blob = await canvasToBlob(canvas, 'image/png');
    const url = URL.createObjectURL(blob);
    return [
      {
        id: crypto.randomUUID(),
        sourceName: file.name,
        outputName: `${base}-${targetW}x${targetH}.png`,
        url,
        sizeBytes: blob.size,
        mimeType: blob.type,
        width: canvas.width,
        height: canvas.height,
      },
    ];
  }

  // favicon-generator
  const sizes = [16, 32, 48, 64, 128, 256];
  const side = Math.min(srcW, srcH);
  const sx = Math.floor((srcW - side) / 2);
  const sy = Math.floor((srcH - side) / 2);
  const outputs: OutputItem[] = [];
  for (const size of sizes) {
    const canvas = drawToCanvas(size, size, sx, sy, side, side);
    const blob = await canvasToBlob(canvas, 'image/png');
    outputs.push({
      id: crypto.randomUUID(),
      sourceName: file.name,
      outputName: `${base}-favicon-${size}x${size}.png`,
      url: URL.createObjectURL(blob),
      sizeBytes: blob.size,
      mimeType: blob.type,
      width: size,
      height: size,
    });
  }
  return outputs;
}

export default function ImageBatchProcessorTool({ slug }: { slug: ProcessorSlug }) {
  const tool = getToolBySlug(slug);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('single');
  const [files, setFiles] = useState<File[]>([]);
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [quality, setQuality] = useState(82);
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [keepAspect, setKeepAspect] = useState(true);

  useEffect(() => {
    return () => {
      outputs.forEach((o) => URL.revokeObjectURL(o.url));
    };
  }, [outputs]);

  const accepts = useMemo(() => (slug === 'jpg-to-png-converter' ? '.jpg,.jpeg,image/jpeg,image/jpg' : 'image/*'), [slug]);

  const setPickedFiles = (incoming: File[]) => {
    setError('');
    if (!incoming.length) return;
    setFiles(uploadMode === 'single' ? [incoming[0]!] : incoming);
  };

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    setPickedFiles(list);
  };

  const resetAll = () => {
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
    setOutputs([]);
    setFiles([]);
    setError('');
  };

  const run = async () => {
    if (!files.length) {
      setError('Please upload at least one image.');
      return;
    }
    setLoading(true);
    setError('');
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
    try {
      const all: OutputItem[] = [];
      for (const f of files) {
        const out = await processImage(slug, f, { quality: quality / 100, width, height, keepAspect });
        all.push(...out);
      }
      setOutputs(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process image(s).');
      setOutputs([]);
    } finally {
      setLoading(false);
    }
  };

  if (!tool) return null;

  return (
    <CalculatorCard title={tool.name} icon={tool.icon}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload mode</span>
          <button
            type="button"
            onClick={() => setUploadMode('single')}
            className={`rounded-lg px-3 py-1.5 text-sm border ${uploadMode === 'single' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-700'}`}
          >
            Single
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('batch')}
            className={`rounded-lg px-3 py-1.5 text-sm border ${uploadMode === 'batch' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-700'}`}
          >
            Batch
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accepts}
          multiple={uploadMode === 'batch'}
          onChange={onFiles}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const dropped = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith('image/'));
            setPickedFiles(dropped);
          }}
          className={`w-full rounded-xl border-2 border-dashed p-5 text-left transition ${
            dragging
              ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800/60'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-lg border border-gray-300 dark:border-gray-700 p-2">
              <Icon icon="lucide:image-plus" className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Click to upload or drag & drop image{uploadMode === 'batch' ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {slug === 'jpg-to-png-converter' ? 'JPG/JPEG only' : 'PNG, JPG, WEBP and more'}
              </p>
            </div>
          </div>
        </button>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((f) => (
              <span key={`${f.name}-${f.size}`} className="text-xs rounded-full border border-gray-300 dark:border-gray-700 px-2.5 py-1">
                {f.name}
              </span>
            ))}
          </div>
        )}

        {slug === 'image-compressor-canvas' && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Quality
              </label>
              <input
                type="number"
                min={20}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Math.min(100, Math.max(20, +e.target.value || 20)))}
                className="w-20 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1 text-sm"
              />
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={1}
              value={quality}
              onChange={(e) => setQuality(+e.target.value)}
              className="w-full h-2 rounded-lg appearance-none accent-gray-900 dark:accent-white bg-gray-200 dark:bg-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Lower quality leads to smaller size. Recommended: 75-85 for photos.
            </p>
          </div>
        )}

        {slug === 'image-resizer' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Width
              <input type="number" min={1} value={width} onChange={(e) => setWidth(+e.target.value || 1)} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2" />
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Height
              <input type="number" min={1} value={height} onChange={(e) => setHeight(+e.target.value || 1)} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2" />
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 pt-7">
              <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} />
              Keep aspect ratio
            </label>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 disabled:opacity-60"
          >
            <Icon icon="lucide:wand-sparkles" className="w-4 h-4" />
            {loading ? 'Processing...' : 'Process'}
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm"
          >
            Reset
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">{files.length} file(s) selected.</p>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        {outputs.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Results ({outputs.length})</p>
            <div className="space-y-2">
              {outputs.map((o) => (
                <div key={o.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={o.url} alt={o.outputName} className="h-14 w-14 rounded object-cover border border-gray-200 dark:border-gray-700" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{o.outputName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        From: {o.sourceName} • {o.width}×{o.height} • {formatBytes(o.sizeBytes)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={o.url}
                    download={o.outputName}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-2 text-sm font-medium self-start sm:self-auto"
                  >
                    <Icon icon="lucide:download" className="w-4 h-4" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}
