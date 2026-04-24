import type { ToolSEOContent } from '@/lib/seoContent';

export default function SEOContent({ content }: { content: ToolSEOContent }) {
  return (
    <section className="mt-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-7 pb-7 border-b border-gray-100 dark:border-gray-800">
        {content.intro}
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        {content.sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">
                {i + 1}
              </span>
              {section.heading}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pl-7">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
