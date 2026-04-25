'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import CalculatorCard from '../CalculatorCard';
import InputField from '../InputField';
import { getToolBySlug } from '@/lib/toolsConfig';
import { aiToolDefinitions } from '@/lib/aiToolDefs';
import { aiContentTools } from '@/lib/aiToolsConfig';

type AiField = {
  key: string;
  label: string;
  type: 'number' | 'text' | 'date' | 'textarea' | 'select';
  defaultValue: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
};

function buildPromptExamples(seed: string) {
  const s = seed.trim();
  if (!s) return ['Exam preparation tips', 'Climate change essay', 'Daily study routine'];
  return [
    s,
    `${s} for class 8`,
    `Simple ${s.toLowerCase()} for students`,
  ];
}

function renderRichContent(text: string) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  return lines.map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={`sp-${i}`} className="h-2" />;
    if (/^\d+\./.test(t)) return <p key={`li-${i}`} className="text-sm leading-7 pl-2">{t}</p>;
    if (/^[-*]\s+/.test(t)) return <p key={`bl-${i}`} className="text-sm leading-7 pl-2">{t.replace(/^[-*]\s+/, '• ')}</p>;
    if (/:$/.test(t) || /^(introduction|conclusion|summary|body|steps?)\b/i.test(t))
      return <p key={`hd-${i}`} className="text-sm font-semibold mt-1">{t}</p>;
    return <p key={`p-${i}`} className="text-sm leading-7">{t}</p>;
  });
}

export default function AIGeneratorTool({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);
  const def = aiToolDefinitions[slug];
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [rateInfo, setRateInfo] = useState<{ remaining: number; resetAt: number } | null>(null);
  const [serverError, setServerError] = useState('');
  const [generated, setGenerated] = useState<{ label: string; value: string; highlight?: boolean }[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [nonce, setNonce] = useState(0);
  const AI_SLUG_SET = useMemo(() => new Set(aiContentTools.map((t) => t.slug)), []);

  useEffect(() => {
    if (!def) return;
    const next: Record<string, string> = {};
    def.fields.forEach((f) => {
      next[f.key] = f.defaultValue;
    });
    setValues(next);
    setGenerated([]);
  }, [def, slug]);

  const firstPromptField = useMemo(
    () => def?.fields.find((f) => f.type === 'text' || f.type === 'textarea')?.key,
    [def],
  );

  const examples = useMemo(() => {
    if (!def || !firstPromptField) return [];
    return buildPromptExamples(values[firstPromptField] ?? def.fields.find((f) => f.key === firstPromptField)?.defaultValue ?? '');
  }, [def, firstPromptField, values]);

  const canGenerate = Boolean(def);

  const runGenerate = async (regen = false) => {
    if (!def) return;
    setLoading(true);
    setServerError('');
    if (regen) setNonce((x) => x + 1);
    // intentional tiny delay for modern loading/skeleton feel
    await new Promise((r) => setTimeout(r, 380));
    try {
      if (AI_SLUG_SET.has(slug)) {
        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, values }),
        });
        if (res.ok) {
          const data = (await res.json()) as { content: string; remaining?: number; resetAt?: number };
          setGenerated([{ label: 'Generated output', value: data.content, highlight: true }]);
          if (typeof data.remaining === 'number' && typeof data.resetAt === 'number') {
            setRateInfo({ remaining: data.remaining, resetAt: data.resetAt });
          }
          setLoading(false);
          return;
        }
        const err = (await res.json()) as { error?: string; message?: string; remaining?: number; resetAt?: number };
        setServerError(err.message || err.error || 'AI request failed, using local fallback.');
      }
      // fallback to local deterministic logic
      const out = def.compute(values);
      setGenerated(out);
    } catch {
      setGenerated(def.compute(values));
      setServerError('Unable to reach AI service, showing local result.');
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    if (!def) return;
    const next: Record<string, string> = {};
    def.fields.forEach((f) => {
      next[f.key] = f.defaultValue;
    });
    setValues(next);
    setGenerated([]);
    setExpanded({});
  };

  if (!tool || !def) return null;

  return (
    <CalculatorCard title={tool.name} icon={tool.icon}>
      <div className="space-y-5">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              AI-style generator • fast local response • regenerate for variation
            </p>
            <span className="text-[10px] px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
              #{nonce}
            </span>
          </div>

          {def.fields.length > 0 && (
            <div className="space-y-3">
              {def.fields.map((field) =>
                field.type === 'textarea' ? (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                    <textarea
                      value={values[field.key] ?? ''}
                      onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      spellCheck={false}
                      className="w-full min-h-[8.5rem] max-h-80 resize-y rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
                    />
                  </div>
                ) : field.type === 'select' ? (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                    <select
                      value={values[field.key] ?? ''}
                      onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm"
                    >
                      {(field.options ?? []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <InputField
                    key={field.key}
                    label={field.label}
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    value={values[field.key] ?? ''}
                    onChange={(value) => setValues((prev) => ({ ...prev, [field.key]: value }))}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    prefix={field.prefix}
                    suffix={field.suffix}
                    placeholder={field.placeholder}
                  />
                ),
              )}
            </div>
          )}

          {examples.length > 0 && firstPromptField && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Example prompts</p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, i) => (
                  <button
                    key={`${example}-${i}`}
                    type="button"
                    onClick={() => setValues((prev) => ({ ...prev, [firstPromptField]: example }))}
                    className="text-xs rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canGenerate || loading}
            onClick={() => runGenerate(false)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            <Icon icon="lucide:sparkles" className="w-4 h-4" />
            Generate
          </button>
          <button
            type="button"
            disabled={!canGenerate || loading}
            onClick={() => runGenerate(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
            Regenerate
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm"
          >
            <Icon icon="lucide:rotate-ccw" className="w-4 h-4" />
            Reset
          </button>
        </div>

        {(serverError || rateInfo) && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs">
            {serverError && <p className="text-amber-700 dark:text-amber-300">{serverError}</p>}
            {rateInfo && (
              <p className="text-amber-700 dark:text-amber-300">
                Attempts left: <strong>{rateInfo.remaining}</strong> (resets at{' '}
                {new Date(rateInfo.resetAt).toLocaleString()})
              </p>
            )}
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse space-y-2">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-3 w-11/12 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-3 w-10/12 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        )}

        {!loading && generated.length > 0 && (
          <div className="space-y-3">
            {generated.map((r, idx) => (
              <div key={`${r.label}-${idx}`} className={`rounded-xl border p-3 ${r.highlight ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800/50' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold">{r.label}</p>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(r.value)}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-xs"
                  >
                    <Icon icon="lucide:copy" className="w-3.5 h-3.5" />
                    Copy
                  </button>
                </div>
                <div
                  className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 px-3 py-2.5 ${
                    expanded[idx] ? '' : 'max-h-72 overflow-y-auto'
                  }`}
                >
                  {renderRichContent(r.value)}
                </div>
                {(r.value.length > 700 || r.value.split('\n').length > 12) && (
                  <button
                    type="button"
                    onClick={() => setExpanded((p) => ({ ...p, [idx]: !p[idx] }))}
                    className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:underline"
                  >
                    {expanded[idx] ? 'Show less' : 'Show full content'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}
