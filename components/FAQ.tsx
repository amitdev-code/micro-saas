'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { FAQItem } from '@/lib/seoContent';

export default function FAQ({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Frequently Asked Questions</h2>
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
        {faqs.map((faq, i) => {
          const open = openIndex === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
              >
                <span className={`text-sm font-medium pr-4 leading-snug ${open ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {faq.question}
                </span>
                <Icon
                  icon="lucide:chevron-down"
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
              </button>
              {open && (
                <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/40">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
