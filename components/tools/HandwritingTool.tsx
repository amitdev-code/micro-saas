'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import CalculatorCard from '../CalculatorCard';
import { getToolBySlug } from '@/lib/toolsConfig';
import { Icon } from '@iconify/react';

export default function HandwritingTool() {
  const tool = getToolBySlug('text-to-handwriting-generator')!;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [text, setText] = useState('Type here — cursive style preview');

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const w = c.width;
    const h = c.height;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    const fam = 'cursive, "Brush Script MT", "Segoe Script", "Apple Chancery", fantasy';
    ctx.font = '28px ' + fam;
    ctx.textBaseline = 'top';
    const lineH = 40;
    const maxW = w - 32;
    const words = text.split(/\s+/);
    let line = '';
    let y = 24;
    const lines: string[] = [];
    for (const w0 of words) {
      const test = line + (line ? ' ' : '') + w0;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w0;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    for (const ln of lines) {
      if (y + lineH > h - 12) break;
      ctx.fillText(ln, 20, y);
      y += lineH;
    }
  }, [text]);

  useEffect(() => {
    draw();
  }, [draw]);

  const download = () => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = 'handwriting.png';
    a.click();
  };

  return (
    <CalculatorCard title={tool.name} icon={tool.icon}>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Browser cursive & fantasy fonts; not a true ML handwriting model. Download as PNG.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full min-h-24 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm mb-4"
        spellCheck={false}
      />
      <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2">
        <canvas ref={canvasRef} width={640} height={400} className="max-w-full h-auto" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={draw}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm"
        >
          <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
          Redraw
        </button>
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-2 text-sm font-medium"
        >
          <Icon icon="lucide:download" className="w-4 h-4" />
          Download PNG
        </button>
      </div>
    </CalculatorCard>
  );
}
