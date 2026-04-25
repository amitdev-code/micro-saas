import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { tools, toolsByCategory } from '@/lib/toolsConfig';
import { aiContentTools } from '@/lib/aiToolsConfig';

export const metadata: Metadata = {
  title: {
    absolute:
      'Free Online Calculators, Converters & Generators | Finance, Utility, Text Tools',
  },
  description:
    'Use free online calculators, converters, generators, and utility tools. Calculate EMI, SIP, interest, GST, age, and more with instant browser-based results.',
  alternates: {
    canonical: 'https://webeze.in',
  },
  openGraph: {
    title: 'Free Online Calculators, Converters & Generators',
    description:
      'Finance, utility, converter and text tools for instant calculations and quick daily tasks.',
    url: 'https://webeze.in',
    siteName: 'Webeze',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Calculators, Converters & Generators',
    description:
      'Calculate EMI, SIP, GST, interest and use text, converter, and utility tools online for free.',
  },
};

const CATEGORIES = [
  {
    key: 'Finance' as const,
    id: 'finance',
    label: 'Finance Tools',
    icon: 'lucide:indian-rupee',
    description: 'Plan investments, calculate loans, estimate taxes',
  },
  {
    key: 'Utility' as const,
    id: 'utility',
    label: 'Utility Tools',
    icon: 'lucide:wrench',
    description: 'Everyday calculators at your fingertips',
  },
  {
    key: 'Text' as const,
    id: 'text',
    label: 'Text & Developer Tools',
    icon: 'lucide:code-2',
    description: 'Format, analyze, and work with text and data',
  },
];

const FEATURES = [
  { icon: 'lucide:zap', title: 'Instant Results', desc: 'Results update in real time as you type — zero loading.' },
  { icon: 'lucide:lock', title: '100% Private', desc: 'All processing happens in your browser. Nothing is sent to a server.' },
  { icon: 'lucide:smartphone', title: 'Works Everywhere', desc: 'Fully optimized for mobile, tablet, and desktop.' },
  { icon: 'lucide:link', title: 'Shareable URLs', desc: 'Results are in the URL — copy and share any calculation.' },
];

const SEO_SECTIONS = [
  {
    title: 'What makes these online tools useful every day',
    body: 'Webeze is designed for practical daily use, not just one-time calculations. Most users need quick answers for money decisions, conversions, writing tasks, or date planning. Instead of opening multiple apps, you can use one clean interface and switch between finance calculators, converter tools, and text utilities in seconds. Every tool is built to be simple for beginners while still useful for power users who need speed. This combination of clarity and coverage is what makes a tool hub valuable long term.',
  },
  {
    title: 'Finance calculators for smarter money planning',
    body: 'Financial planning improves when decisions are based on clear numbers. A SIP calculator helps estimate wealth growth through regular investments. EMI and credit-card EMI calculators reveal repayment burden before you borrow. Interest calculators show the real cost of loans and the potential return from savings. Tools like inflation and retirement calculators help project future needs so current plans are more realistic. Instead of relying on rough mental math, these calculators provide structured outputs you can compare and act on.',
  },
  {
    title: 'Conversion tools for quick and accurate unit changes',
    body: 'Unit conversion is one of the most frequent online tasks. Height and weight converters are useful for fitness forms and international standards. Temperature and area converters help with academics, travel, and property use cases. Time converters are useful in productivity and scheduling workflows where seconds, minutes, and hours need to be interpreted quickly. Accurate conversion matters because small mistakes can create large confusion, especially in health, finance, or engineering contexts. These tools are built to provide instant and dependable conversion results.',
  },
  {
    title: 'Text and utility tools that save real time',
    body: 'Text utilities improve speed in content writing, SEO workflows, and development tasks. Slug generators help create clean URLs. Space remover and sorter tools make datasets readable. Encoder and decoder tools are useful for debugging and web-safe formatting. For creators and marketers, these small operations repeat many times each week, so a focused utility reduces friction and errors. This is why lightweight browser tools continue to be relevant even for advanced users.',
  },
  {
    title: 'Why browser-based tools are better for privacy',
    body: 'Many online tools ask for sign-up before use, which slows down workflow and creates privacy risk for simple tasks. Webeze tools are designed for direct access with no account requirement for standard usage. In many cases, processing is done in the browser itself, which helps users work faster with confidence. If a user is calculating personal finances, editing text drafts, or testing data conversions, this local-first behavior improves trust and usability.',
  },
  {
    title: 'How to choose the right calculator for your goal',
    body: 'Start by identifying your decision, not the formula. If your goal is wealth growth, begin with SIP, PPF, or NPS calculators. If your goal is debt management, compare EMI, loan eligibility, and interest tools side by side. For productivity and routine work, choose utility and text tools that reduce repetitive manual formatting. The best approach is to run multiple scenarios, not a single input set. Small changes in tenure, rate, contribution, or timing can significantly change outcomes.',
  },
];

const HOME_FAQS = [
  {
    q: 'Are these tools free to use?',
    a: 'Yes. The calculators, converters, and generators on Webeze are free for regular use and available without complicated onboarding.',
  },
  {
    q: 'Which tools are most useful for finance beginners?',
    a: 'New users typically start with EMI Calculator, SIP Calculator, PPF Calculator, Compound Interest Calculator, and Inflation Calculator. These tools cover borrowing, investing, and long-term money planning.',
  },
  {
    q: 'Can I use these tools on mobile?',
    a: 'Yes. The full tool hub is responsive and works across phone, tablet, and desktop so you can calculate values quickly on any device.',
  },
  {
    q: 'How do I improve decision quality using calculators?',
    a: 'Run multiple scenarios with different values for rate, tenure, or amount. Compare outputs rather than relying on a single estimate. This gives better planning confidence.',
  },
  {
    q: 'Do these tools support SEO and content workflows?',
    a: 'Yes. Slug Generator, text cleanup tools, and encoding utilities are especially useful for SEO writers, editors, developers, and operations teams.',
  },
  {
    q: 'Why does more content matter for ranking?',
    a: 'Search engines prefer pages that explain intent clearly and cover a topic comprehensively. Detailed, useful content can improve relevance and ranking potential when quality remains high.',
  },
];

export default function HomePage() {
  const aiToolSlugSet = new Set(aiContentTools.map((tool) => tool.slug));
  const heroTools = tools.filter((tool) => !aiToolSlugSet.has(tool.slug));

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative bg-gray-950 overflow-hidden">
        <div className="grid-overlay absolute inset-0" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">

          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-up">
            <span className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-1.5 text-sm font-medium text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              {tools.length} free tools — no sign-up required
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white text-center leading-tight tracking-tight mb-6 animate-fade-up animate-delay-100">
            Free Online Calculators,<br />
            <span className="text-gray-400">Converters & Generators</span>
          </h1>

          <p className="text-center text-gray-400 text-lg sm:text-xl max-w-xl mx-auto mb-10 animate-fade-up animate-delay-200">
            Finance calculator, utility converter, and text generator tools for fast, accurate, and private browser-based usage.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-14 animate-fade-up animate-delay-300">
            <a href="#finance" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-all">
              <Icon icon="lucide:indian-rupee" className="w-4 h-4" />
              Finance Tools
            </a>
            <a href="#utility" className="inline-flex items-center gap-2 px-5 py-2.5 glass-dark text-white text-sm font-semibold rounded-lg hover:bg-white/15 transition-all">
              <Icon icon="lucide:wrench" className="w-4 h-4" />
              Utility Tools
            </a>
            <a href="#text" className="inline-flex items-center gap-2 px-5 py-2.5 glass-dark text-white text-sm font-semibold rounded-lg hover:bg-white/15 transition-all">
              <Icon icon="lucide:code-2" className="w-4 h-4" />
              Developer Tools
            </a>
          </div>

          {/* Tool pills */}
          <div className="flex flex-wrap justify-center gap-2 animate-fade-up animate-delay-300">
            {heroTools.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 glass-dark rounded-full text-xs font-medium text-gray-300 hover:text-white hover:bg-white/15 transition-all">
                <Icon icon={tool.icon} className="w-3.5 h-3.5 shrink-0" />
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap justify-center gap-10 sm:gap-20">
            {[
              { v: `${tools.length}+`, l: 'Free Tools' },
              { v: '3', l: 'Categories' },
              { v: '0ms', l: 'Server Requests' },
              { v: '100%', l: 'Private & Secure' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-xl font-black text-gray-900 dark:text-white">{s.v}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {CATEGORIES.map((cat) => (
          <section key={cat.key} id={cat.id}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center shrink-0">
                <Icon icon={cat.icon} className="w-4.5 h-4.5 text-white dark:text-gray-900" width={18} height={18} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{cat.label}</h2>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {toolsByCategory[cat.key].map((tool) => (
                <Link key={tool.slug} href={`/tools/${tool.slug}`}
                  className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-card-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-900 dark:group-hover:bg-white transition-colors">
                      <Icon icon={tool.icon} className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-white dark:group-hover:text-gray-900 transition-colors" />
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2 py-0.5 rounded-full">
                      {tool.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                    {tool.shortDescription}
                  </p>
                  <div className="flex items-center text-sm font-semibold text-gray-900 dark:text-white gap-1.5 group-hover:gap-2.5 transition-all">
                    Open tool
                    <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* ── Features ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Why Webeze?</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">Built for speed, privacy, and simplicity.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-card-md transition-all">
                <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <Icon icon={f.icon} className="w-4.5 h-4.5 text-gray-700 dark:text-gray-300" width={18} height={18} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── All Tools CTA ── */}
        <section className="bg-gray-950 dark:bg-gray-900 rounded-2xl p-8 sm:p-10 border border-gray-800">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">All {tools.length} Tools</h2>
          <p className="text-gray-500 text-sm mb-7">Jump directly to any tool</p>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 glass-dark rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                <Icon icon={tool.icon} className="w-3.5 h-3.5 shrink-0" />
                {tool.name}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Long-form SEO content ── */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Free calculators, converters, and utility tools for daily use
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
            This page is built for users who need fast, accurate online tools without friction. Whether you are
            calculating loan EMI, planning SIP investments, converting units, checking date differences, or cleaning
            text for SEO, the goal is the same: save time and make better decisions with clear outputs. Explore the
            sections below to understand when to use each tool category and how to get better outcomes from them.
          </p>

          <div className="space-y-7">
            {SEO_SECTIONS.map((section) => (
              <article key={section.title}>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Home FAQ ── */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            {HOME_FAQS.map((item) => (
              <article key={item.q}>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5">{item.q}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
