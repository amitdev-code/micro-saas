import Link from 'next/link';
import { Icon } from '@iconify/react';
import type { ToolConfig } from '@/lib/toolsConfig';

export default function RelatedTools({ tools }: { tools: ToolConfig[] }) {
  if (!tools.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Related Tools</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tools.map((tool) => (
          <Link key={tool.slug} href={`/tools/${tool.slug}`}
            className="group flex flex-col items-center gap-2.5 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-card-md transition-all text-center">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-900 dark:group-hover:bg-white transition-colors">
              <Icon icon={tool.icon} className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white dark:group-hover:text-gray-900 transition-colors" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-tight">
              {tool.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
