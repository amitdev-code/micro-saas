import Link from 'next/link';
import { Icon } from '@iconify/react';
import { tools } from '@/lib/toolsConfig';

export default function Footer() {
  const financeTools = tools.filter((t) => t.category === 'Finance');
  const utilityTools = tools.filter((t) => t.category === 'Utility');
  const textTools = tools.filter((t) => t.category === 'Text');

  return (
    <footer className="bg-gray-950 dark:bg-black text-gray-400 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                <Icon icon="lucide:zap" className="w-4 h-4 text-gray-900" />
              </div>
              <span className="font-bold text-white text-base">Webeze</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Free, instant, and private tools for finance, health, and productivity. No login required.
            </p>
          </div>

          {/* Finance */}
          <div>
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Finance</h3>
            <ul className="space-y-2.5">
              {financeTools.map((t) => (
                <li key={t.slug}>
                  <Link href={`/tools/${t.slug}`} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Utility */}
          <div>
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Utility</h3>
            <ul className="space-y-2.5">
              {utilityTools.map((t) => (
                <li key={t.slug}>
                  <Link href={`/tools/${t.slug}`} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Text */}
          <div>
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Text & Dev</h3>
            <ul className="space-y-2.5">
              {textTools.map((t) => (
                <li key={t.slug}>
                  <Link href={`/tools/${t.slug}`} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} Webeze. All rights reserved.</p>
          <p>All calculations are for informational purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
