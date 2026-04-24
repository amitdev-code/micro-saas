import Link from 'next/link';
import { Icon } from '@iconify/react';
import { tools } from '@/lib/toolsConfig';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon icon="lucide:search-x" className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
          This page doesn&apos;t exist. Try one of our tools below.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tools.slice(0, 6).map((tool) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white transition-all shadow-card">
              <Icon icon={tool.icon} className="w-3.5 h-3.5 shrink-0" />
              {tool.name}
            </Link>
          ))}
        </div>

        <Link href="/"
          className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-all text-sm">
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Back to Webeze
        </Link>
      </div>
    </main>
  );
}
