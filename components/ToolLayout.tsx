import Link from 'next/link';
import { Icon } from '@iconify/react';
import type { ToolConfig } from '@/lib/toolsConfig';
import type { ToolSEOContent } from '@/lib/seoContent';
import SEOContent from './SEOContent';
import FAQ from './FAQ';
import RelatedTools from './RelatedTools';

interface ToolLayoutProps {
  tool: ToolConfig;
  content: ToolSEOContent;
  relatedTools: ToolConfig[];
  children: React.ReactNode;
}

export default function ToolLayout({ tool, content, relatedTools, children }: ToolLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Page header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1">
              <Icon icon="lucide:home" className="w-3.5 h-3.5" />
              Home
            </Link>
            <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">{tool.name}</span>
          </nav>

          {/* Title block */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
              <Icon icon={tool.icon} className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
                  {tool.category}
                </span>
                <span className="text-xs text-gray-400">Free</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                {content.h1}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{tool.shortDescription}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tool area — can opt into full width */}
      <div className={`${tool.fullWidth ? 'max-w-7xl' : 'max-w-4xl'} mx-auto px-4 sm:px-6 lg:px-8 pt-8`}>
        {children}
      </div>

      {/* SEO content stays at readable width */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SEOContent content={content} />
        <FAQ faqs={content.faqs} />
        <RelatedTools tools={relatedTools} />

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
            Back to all tools
          </Link>
        </div>
      </div>
    </main>
  );
}
