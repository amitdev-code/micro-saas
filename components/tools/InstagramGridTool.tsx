'use client';

import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import CalculatorCard from '../CalculatorCard';
import { getToolBySlug } from '@/lib/toolsConfig';

const GRID = 3;

export default function InstagramGridTool() {
  const tool = getToolBySlug('instagram-grid-splitter')!;
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [parts, setParts] = useState<string[]>([]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (src) URL.revokeObjectURL(src);
    setSrc(URL.createObjectURL(f));
    setParts([]);
  };

  const split = () => {
    const img = imgRef.current;
    if (!img?.naturalWidth) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const cellW = w / GRID;
    const cellH = h / GRID;
    const out: string[] = [];
    for (let row = 0; row < GRID; row += 1) {
      for (let col = 0; col < GRID; col += 1) {
        const c = document.createElement('canvas');
        c.width = cellW;
        c.height = cellH;
        const ctx = c.getContext('2d');
        if (!ctx) continue;
        ctx.drawImage(img, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH);
        out.push(c.toDataURL('image/png'));
      }
    }
    setParts(out);
  };

  return (
    <CalculatorCard title={tool.name} icon={tool.icon}>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Upload a square image for best 3×3 grid (Instagram). Split into 9 parts and download each.
      </p>
      <input type="file" accept="image/*" onChange={onFile} className="mb-3 block text-sm" />
      {src && (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgRef} src={src} alt="Upload" onLoad={split} className="max-h-48 rounded-lg object-contain" />
          <button
            type="button"
            onClick={split}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-medium"
          >
            <Icon icon="lucide:layout-grid" className="w-4 h-4" />
            Split 3×3
          </button>
          {parts.length > 0 && (
            <div className="grid grid-cols-3 gap-1 max-w-md">
              {parts.map((p, i) => (
                <a
                  key={i}
                  href={p}
                  download={`ig-grid-${i + 1}.png`}
                  className="block aspect-square overflow-hidden rounded border border-gray-200 dark:border-gray-600"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p} alt={`Part ${i + 1}`} className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </CalculatorCard>
  );
}
