'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { aiContentTools } from '@/lib/aiToolsConfig';

const ImageCompressorTool = dynamic(
  () =>
    import('./tools/ImageBatchProcessorTool').then((m) => {
      function ImageCompressorToolComponent() {
        return <m.default slug="image-compressor-canvas" />;
      }
      return ImageCompressorToolComponent;
    }),
  { ssr: false },
);
const ImageResizerTool = dynamic(
  () =>
    import('./tools/ImageBatchProcessorTool').then((m) => {
      function ImageResizerToolComponent() {
        return <m.default slug="image-resizer" />;
      }
      return ImageResizerToolComponent;
    }),
  { ssr: false },
);
const JpgToPngTool = dynamic(
  () =>
    import('./tools/ImageBatchProcessorTool').then((m) => {
      function JpgToPngToolComponent() {
        return <m.default slug="jpg-to-png-converter" />;
      }
      return JpgToPngToolComponent;
    }),
  { ssr: false },
);
const FaviconTool = dynamic(
  () =>
    import('./tools/ImageBatchProcessorTool').then((m) => {
      function FaviconToolComponent() {
        return <m.default slug="favicon-generator" />;
      }
      return FaviconToolComponent;
    }),
  { ssr: false },
);

const toolMap: Record<string, React.ComponentType> = {
  'sip-calculator': dynamic(() => import('./tools/SIPCalculator'), { ssr: false }),
  'emi-calculator': dynamic(() => import('./tools/EMICalculator'), { ssr: false }),
  'fd-calculator': dynamic(() => import('./tools/FDCalculator'), { ssr: false }),
  'gst-calculator': dynamic(() => import('./tools/GSTCalculator'), { ssr: false }),
  'discount-calculator': dynamic(() => import('./tools/DiscountCalculator'), { ssr: false }),
  'age-calculator': dynamic(() => import('./tools/AgeCalculator'), { ssr: false }),
  'percentage-calculator': dynamic(() => import('./tools/PercentageCalculator'), { ssr: false }),
  'bmi-calculator': dynamic(() => import('./tools/BMICalculator'), { ssr: false }),
  'word-counter': dynamic(() => import('./tools/WordCounter'), { ssr: false }),
  'json-formatter': dynamic(() => import('./tools/JSONFormatter'), { ssr: false }),
  'typing-speed-test': dynamic(() => import('./tools/TypingSpeedTest'), { ssr: false }),
  'random-string-generator': dynamic(() => import('./tools/RandomStringGenerator'), { ssr: false }),
  'fullscreen-stopwatch': dynamic(() => import('./tools/FullscreenStopwatchTool'), { ssr: false }),
  'fullscreen-countdown-timer': dynamic(() => import('./tools/FullscreenCountdownTool'), { ssr: false }),
  'text-to-handwriting-generator': dynamic(() => import('./tools/HandwritingTool'), { ssr: false }),
  'instagram-grid-splitter': dynamic(() => import('./tools/InstagramGridTool'), { ssr: false }),
  'image-compressor-canvas': ImageCompressorTool,
  'image-resizer': ImageResizerTool,
  'jpg-to-png-converter': JpgToPngTool,
  'favicon-generator': FaviconTool,
  'base64-image-converter': dynamic(() => import('./tools/Base64ImageConverterTool'), { ssr: false }),
};
const AIGeneratorTool = dynamic(() => import('./tools/AIGeneratorTool'), { ssr: false });
const GenericTool = dynamic(() => import('./tools/GenericTool'), { ssr: false });
const AI_TOOL_SLUGS = new Set(aiContentTools.map((t) => t.slug));

function SkeletonLoader() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="bg-blue-600 px-6 py-4 h-16" />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}

export default function ToolRenderer({ slug }: { slug: string }) {
  const Component = toolMap[slug];
  return (
    <Suspense fallback={<SkeletonLoader />}>
      {Component ? <Component /> : AI_TOOL_SLUGS.has(slug) ? <AIGeneratorTool slug={slug} /> : <GenericTool slug={slug} />}
    </Suspense>
  );
}
