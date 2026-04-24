import { MetadataRoute } from 'next';
import { tools } from '@/lib/toolsConfig';

const BASE_URL = 'https://webeze.in';

const CATEGORY_PRIORITY: Record<string, number> = {
  Finance: 0.9,
  Utility: 0.8,
  Text: 0.8,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPages = tools.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: CATEGORY_PRIORITY[tool.category] ?? 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    ...toolPages,
  ];
}
