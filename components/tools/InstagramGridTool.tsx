'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import CalculatorCard from '../CalculatorCard';
import { getToolBySlug } from '@/lib/toolsConfig';

const GRID = 3;
type GridResult = { id: string; sourceName: string; tiles: string[] };

export default function InstagramGridTool() {
  const tool = getToolBySlug('instagram-grid-splitter')!;
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('single');
  const [results, setResults] = useState<GridResult[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return () => {
      results.forEach((r) => r.tiles.forEach((u) => URL.revokeObjectURL(u)));
    };
  }, [results]);

  const fileToImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to load ${file.name}`));
      };
      img.src = url;
    });

  const splitFile = async (file: File): Promise<GridResult> => {
    const img = await fileToImage(file);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const cellW = Math.floor(w / GRID);
    const cellH = Math.floor(h / GRID);
    const tiles: string[] = [];
    for (let row = 0; row < GRID; row += 1) {
      for (let col = 0; col < GRID; col += 1) {
        const c = document.createElement('canvas');
        c.width = cellW;
        c.height = cellH;
        const ctx = c.getContext('2d');
        if (!ctx) continue;
        ctx.drawImage(img, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH);
        const blob = await new Promise<Blob>((resolve, reject) => {
          c.toBlob((b) => (b ? resolve(b) : reject(new Error('Unable to create tile'))), 'image/png');
        });
        tiles.push(URL.createObjectURL(blob));
      }
    }
    return { id: crypto.randomUUID(), sourceName: file.name, tiles };
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setProcessing(true);
    const selected = uploadMode === 'single' ? [files[0]!] : files;
    results.forEach((r) => r.tiles.forEach((u) => URL.revokeObjectURL(u)));
    try {
      const next: GridResult[] = [];
      for (const f of selected) {
        next.push(await splitFile(f));
      }
      setResults(next);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <CalculatorCard title={tool.name} icon={tool.icon}>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Upload single or batch images. Each image is split into 3×3 tiles with direct download buttons.
      </p>
      <div className="mb-3 flex gap-2">
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
      <input type="file" accept="image/*" multiple={uploadMode === 'batch'} onChange={onFile} className="mb-3 block text-sm" />
      {processing && <p className="text-sm text-gray-500">Splitting image(s)...</p>}
      {results.length > 0 && (
        <div className="space-y-5">
          {results.map((r) => (
            <div key={r.id} className="space-y-2">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.sourceName}</p>
              <div className="grid grid-cols-3 gap-1 max-w-md">
                {r.tiles.map((p, i) => (
                  <div key={`${r.id}-${i}`} className="space-y-1">
                    <a
                      href={p}
                      download={`${r.sourceName.replace(/\.[^.]+$/, '')}-grid-${i + 1}.png`}
                      className="block aspect-square overflow-hidden rounded border border-gray-200 dark:border-gray-600"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p} alt={`Part ${i + 1}`} className="h-full w-full object-cover" />
                    </a>
                    <a
                      href={p}
                      download={`${r.sourceName.replace(/\.[^.]+$/, '')}-grid-${i + 1}.png`}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-xs"
                    >
                      <Icon icon="lucide:download" className="w-3 h-3" />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </CalculatorCard>
  );
}
