import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getToolBySlug, getRelatedTools, tools } from '@/lib/toolsConfig';
import seoContent from '@/lib/seoContent';
import ToolLayout from '@/components/ToolLayout';
import ToolRenderer from '@/components/ToolRenderer';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};
  const content = seoContent[params.slug];

  return {
    title: `${tool.name} — Free Online ${tool.name}`,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
      title: `${tool.name} — Free Online ${tool.name} | FreeToolsHub`,
      description: tool.description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${tool.name} — Free Online ${tool.name}`,
      description: tool.description,
    },
    alternates: {
      canonical: `/tools/${tool.slug}`,
    },
  };
}

export default function ToolPage({ params }: Props) {
  const tool = getToolBySlug(params.slug);
  const content = seoContent[params.slug];

  if (!tool || !content) notFound();

  const relatedTools = getRelatedTools(params.slug);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://freetoolshub.com' },
      { '@type': 'ListItem', position: 2, name: tool.name, item: `https://freetoolshub.com/tools/${tool.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ToolLayout tool={tool} content={content} relatedTools={relatedTools}>
        <Suspense fallback={<div className="h-48 bg-white dark:bg-gray-900 rounded-2xl animate-pulse" />}>
          <ToolRenderer slug={params.slug} />
        </Suspense>
      </ToolLayout>
    </>
  );
}
