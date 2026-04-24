import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getToolBySlug, getRelatedTools, tools } from '@/lib/toolsConfig';
import { getSEOContent } from '@/lib/seoContent';
import ToolLayout from '@/components/ToolLayout';
import ToolRenderer from '@/components/ToolRenderer';

const BASE_URL = 'https://webeze.in';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    keywords: tool.keywords,
    openGraph: {
      title: `${tool.seoTitle} | Webeze`,
      description: tool.seoDescription,
      type: 'website',
      url: `${BASE_URL}/tools/${tool.slug}`,
      siteName: 'Webeze',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.seoTitle,
      description: tool.seoDescription,
    },
    alternates: {
      canonical: `${BASE_URL}/tools/${tool.slug}`,
    },
  };
}

export default function ToolPage({ params }: Props) {
  const tool = getToolBySlug(params.slug);
  const content = tool ? getSEOContent(tool) : null;

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
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${BASE_URL}/tools` },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.name,
        item: `${BASE_URL}/tools/${tool.slug}`,
      },
    ],
  };

  const appCategoryMap: Record<string, string> = {
    Finance: 'FinanceApplication',
    Utility: 'UtilitiesApplication',
    Text: 'DeveloperApplication',
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: `${BASE_URL}/tools/${tool.slug}`,
    description: tool.seoDescription,
    applicationCategory: appCategoryMap[tool.category] ?? 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    creator: {
      '@type': 'Organization',
      name: 'Webeze',
      url: BASE_URL,
    },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <ToolLayout tool={tool} content={content} relatedTools={relatedTools}>
        <Suspense
          fallback={
            <div className="h-48 bg-white dark:bg-gray-900 rounded-2xl animate-pulse" />
          }
        >
          <ToolRenderer slug={params.slug} />
        </Suspense>
      </ToolLayout>
    </>
  );
}
