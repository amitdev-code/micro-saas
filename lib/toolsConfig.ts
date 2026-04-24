export type ToolCategory = 'Finance' | 'Utility' | 'Text';

export interface ToolConfig {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ToolCategory;
  icon: string; // Iconify icon name
  keywords: string[];
  relatedTools: string[];
}

export const tools: ToolConfig[] = [
  {
    slug: 'sip-calculator',
    name: 'SIP Calculator',
    shortDescription: 'Calculate returns on your systematic investment plan',
    description:
      'Free online SIP Calculator to estimate mutual fund returns. Calculate maturity amount, total investment, and estimated returns for systematic investment plans instantly.',
    category: 'Finance',
    icon: 'lucide:trending-up',
    keywords: ['sip calculator', 'mutual fund sip calculator', 'sip returns', 'systematic investment plan calculator'],
    relatedTools: ['emi-calculator', 'fd-calculator', 'percentage-calculator', 'discount-calculator'],
  },
  {
    slug: 'emi-calculator',
    name: 'EMI Calculator',
    shortDescription: 'Calculate monthly EMI for home, car, or personal loans',
    description:
      'Free EMI Calculator to calculate equated monthly installments for any loan. Know your monthly payment, total interest, and total repayment amount instantly.',
    category: 'Finance',
    icon: 'lucide:landmark',
    keywords: ['emi calculator', 'loan emi calculator', 'home loan emi', 'car loan emi', 'personal loan calculator'],
    relatedTools: ['sip-calculator', 'fd-calculator', 'gst-calculator', 'percentage-calculator'],
  },
  {
    slug: 'fd-calculator',
    name: 'FD Calculator',
    shortDescription: 'Calculate fixed deposit maturity amount and interest',
    description:
      'Free Fixed Deposit (FD) Calculator to compute maturity amount and interest earned. Compare returns for different compounding frequencies and tenures.',
    category: 'Finance',
    icon: 'lucide:piggy-bank',
    keywords: ['fd calculator', 'fixed deposit calculator', 'fd maturity calculator', 'fd interest calculator'],
    relatedTools: ['sip-calculator', 'emi-calculator', 'percentage-calculator', 'discount-calculator'],
  },
  {
    slug: 'gst-calculator',
    name: 'GST Calculator',
    shortDescription: 'Calculate GST amount for any product or service',
    description:
      'Free online GST Calculator to compute GST amount for 5%, 12%, 18%, and 28% slabs. Calculate both GST-exclusive and GST-inclusive amounts instantly.',
    category: 'Finance',
    icon: 'lucide:receipt',
    keywords: ['gst calculator', 'gst amount calculator', 'gst inclusive exclusive', 'goods and services tax calculator'],
    relatedTools: ['discount-calculator', 'percentage-calculator', 'emi-calculator', 'sip-calculator'],
  },
  {
    slug: 'discount-calculator',
    name: 'Discount Calculator',
    shortDescription: 'Calculate final price after applying any discount',
    description:
      'Free Discount Calculator to find out how much you save on any purchase. Enter the original price and discount percentage to see the discounted price instantly.',
    category: 'Finance',
    icon: 'lucide:tag',
    keywords: ['discount calculator', 'price discount calculator', 'percentage off calculator', 'sale price calculator'],
    relatedTools: ['gst-calculator', 'percentage-calculator', 'bmi-calculator', 'age-calculator'],
  },
  {
    slug: 'age-calculator',
    name: 'Age Calculator',
    shortDescription: 'Calculate exact age in years, months, and days',
    description:
      'Free Age Calculator to find your exact age in years, months, and days from your date of birth. Also shows total days lived and days until your next birthday.',
    category: 'Utility',
    icon: 'lucide:calendar-days',
    keywords: ['age calculator', 'age from date of birth', 'exact age calculator', 'birthday age calculator'],
    relatedTools: ['bmi-calculator', 'percentage-calculator', 'discount-calculator', 'word-counter'],
  },
  {
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    shortDescription: 'Calculate percentages, percentage change, and more',
    description:
      'Free Percentage Calculator with multiple modes. Find what % of a number is, calculate percentage change, and solve common percentage problems in seconds.',
    category: 'Utility',
    icon: 'lucide:percent',
    keywords: ['percentage calculator', 'percent calculator', 'percentage change calculator', 'calculate percentage'],
    relatedTools: ['discount-calculator', 'gst-calculator', 'bmi-calculator', 'sip-calculator'],
  },
  {
    slug: 'bmi-calculator',
    name: 'BMI Calculator',
    shortDescription: 'Calculate your Body Mass Index and health category',
    description:
      'Free BMI Calculator to measure your Body Mass Index. Enter your weight and height to instantly know your BMI and whether you are underweight, normal, overweight, or obese.',
    category: 'Utility',
    icon: 'lucide:activity',
    keywords: ['bmi calculator', 'body mass index calculator', 'bmi chart', 'healthy weight calculator'],
    relatedTools: ['age-calculator', 'percentage-calculator', 'word-counter', 'discount-calculator'],
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    shortDescription: 'Count words, characters, sentences, and reading time',
    description:
      'Free online Word Counter tool. Count words, characters, sentences, paragraphs, and estimate reading time for any text. Perfect for writers, students, and content creators.',
    category: 'Text',
    icon: 'lucide:file-text',
    keywords: ['word counter', 'character counter', 'word count tool', 'online word counter', 'text word counter'],
    relatedTools: ['json-formatter', 'bmi-calculator', 'age-calculator', 'percentage-calculator'],
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    shortDescription: 'Format, validate, and minify JSON online',
    description:
      'Free online JSON Formatter and Validator. Beautify, format, and minify JSON data instantly. Validate JSON syntax and copy formatted output with one click.',
    category: 'Text',
    icon: 'lucide:braces',
    keywords: ['json formatter', 'json beautifier', 'json validator', 'format json online', 'json pretty print'],
    relatedTools: ['word-counter', 'percentage-calculator', 'age-calculator', 'bmi-calculator'],
  },
];

export const toolsByCategory = tools.reduce<Record<ToolCategory, ToolConfig[]>>(
  (acc, tool) => { acc[tool.category].push(tool); return acc; },
  { Finance: [], Utility: [], Text: [] }
);

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getRelatedTools(slug: string): ToolConfig[] {
  const tool = getToolBySlug(slug);
  if (!tool) return [];
  return tool.relatedTools
    .map((s) => getToolBySlug(s))
    .filter((t): t is ToolConfig => t !== undefined)
    .slice(0, 5);
}
