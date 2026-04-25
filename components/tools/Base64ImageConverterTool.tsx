'use client';

import { useEffect, useState } from 'react';
import CalculatorCard from '../CalculatorCard';
import { getToolBySlug } from '@/lib/toolsConfig';
import { Icon } from '@iconify/react';

type OutputItem = {
  id: string;
  name: string;
  url: string;
  base64: string;
};

export default function Base64ImageConverterTool() {
  const tool = getToolBySlug('base64-image-converter');
  const [mode, setMode] = useState<'imageToBase64' | 'base64ToImage'>('imageToBase64');
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('single');
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [inputBase64, setInputBase64] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      outputs.forEach((o) => URL.revokeObjectURL(o.url));
    };
  }, [outputs]);

  if (!tool) return null;

  const reset = () => {
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
    setOutputs([]);
    setInputBase64('');
    setError('');
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setError('');
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
    const chosen = uploadMode === 'single' ? [files[0]!] : files;
    const next: OutputItem[] = [];
    for (const file of chosen) {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('Unable to read file'));
        reader.readAsDataURL(file);
      });
      next.push({
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^.]+$/, ''),
        url: base64,
        base64,
      });
    }
    setOutputs(next);
  };

  const fromBase64 = () => {
    setError('');
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
    const raw = inputBase64.trim();
    if (!raw) {
      setError('Paste a base64 string first.');
      return;
    }
    try {
      const withMime = raw.startsWith('data:image/') ? raw : `data:image/png;base64,${raw.replace(/\s/g, '')}`;
      setOutputs([
        {
          id: crypto.randomUUID(),
          name: 'decoded-image',
          url: withMime,
          base64: withMime,
        },
      ]);
    } catch {
      setError('Invalid base64 input');
    }
  };

  return (
    <CalculatorCard title={tool.name} icon={tool.icon}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('imageToBase64')}
            className={`rounded-lg px-3 py-1.5 text-sm border ${mode === 'imageToBase64' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-700'}`}
          >
            Image → Base64
          </button>
          <button
            type="button"
            onClick={() => setMode('base64ToImage')}
            className={`rounded-lg px-3 py-1.5 text-sm border ${mode === 'base64ToImage' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-700'}`}
          >
            Base64 → Image
          </button>
        </div>

        {mode === 'imageToBase64' ? (
          <>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Upload mode</span>
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
            <input type="file" accept="image/*" multiple={uploadMode === 'batch'} onChange={onUpload} className="block w-full text-sm" />
          </>
        ) : (
          <>
            <textarea
              value={inputBase64}
              onChange={(e) => setInputBase64(e.target.value)}
              className="w-full min-h-36 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm"
              placeholder="Paste base64 string or full data URL..."
            />
            <button
              type="button"
              onClick={fromBase64}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-gray-900"
            >
              <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
              Convert to image
            </button>
          </>
        )}

        <button type="button" onClick={reset} className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm">
          Reset
        </button>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        {outputs.length > 0 && (
          <div className="space-y-3">
            {outputs.map((o) => (
              <div key={o.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.url} alt={o.name} className="max-h-48 rounded border border-gray-200 dark:border-gray-700 object-contain" />
                {mode === 'imageToBase64' && (
                  <textarea
                    readOnly
                    value={o.base64}
                    className="w-full min-h-28 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs"
                  />
                )}
                <div className="flex flex-wrap gap-2">
                  <a
                    href={o.url}
                    download={`${o.name}.png`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    <Icon icon="lucide:download" className="w-4 h-4" />
                    Download image
                  </a>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(o.base64)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm"
                  >
                    <Icon icon="lucide:copy" className="w-4 h-4" />
                    Copy base64
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}
