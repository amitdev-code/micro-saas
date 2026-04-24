export type ToolCategory = 'Finance' | 'Utility' | 'Text';

export interface ToolConfig {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  relatedTools: string[];
  fullWidth?: boolean;
}

export const tools: ToolConfig[] = [
  {
    slug: 'sip-calculator',
    name: 'SIP Calculator',
    shortDescription: 'Calculate returns on your systematic investment plan',
    description:
      'Free online SIP Calculator to estimate mutual fund returns. Calculate maturity amount, total investment, and estimated returns for systematic investment plans instantly.',
    seoTitle: 'Free SIP Calculator — Estimate Mutual Fund Returns Online',
    seoDescription:
      'Use our free SIP Calculator to estimate mutual fund returns. Enter monthly investment, expected return rate & tenure to calculate maturity amount instantly. No sign-up needed.',
    category: 'Finance',
    icon: 'lucide:trending-up',
    keywords: [
      'sip calculator',
      'sip return calculator',
      'mutual fund sip calculator',
      'systematic investment plan calculator',
      'sip maturity calculator',
      'monthly sip calculator',
      'sip calculator india',
      'online sip calculator',
      'sip investment calculator',
      'sip calculator with graph',
    ],
    relatedTools: ['emi-calculator', 'fd-calculator', 'percentage-calculator', 'discount-calculator'],
  },
  {
    slug: 'emi-calculator',
    name: 'EMI Calculator',
    shortDescription: 'Calculate monthly EMI for home, car, or personal loans',
    description:
      'Free EMI Calculator to calculate equated monthly installments for any loan. Know your monthly payment, total interest, and total repayment amount instantly.',
    seoTitle: 'EMI Calculator — Home, Car & Personal Loan EMI Calculator',
    seoDescription:
      'Free EMI Calculator for home loan, car loan & personal loan. Enter loan amount, interest rate & tenure to calculate monthly EMI, total interest & total repayment instantly.',
    category: 'Finance',
    icon: 'lucide:landmark',
    keywords: [
      'emi calculator',
      'loan emi calculator',
      'home loan emi calculator',
      'car loan emi calculator',
      'personal loan emi calculator',
      'bank loan emi calculator',
      'emi calculator india',
      'monthly emi calculator',
      'housing loan emi calculator',
      'emi calculation formula',
    ],
    relatedTools: ['sip-calculator', 'fd-calculator', 'gst-calculator', 'percentage-calculator'],
  },
  {
    slug: 'fd-calculator',
    name: 'FD Calculator',
    shortDescription: 'Calculate fixed deposit maturity amount and interest',
    description:
      'Free Fixed Deposit (FD) Calculator to compute maturity amount and interest earned. Compare returns for different compounding frequencies and tenures.',
    seoTitle: 'FD Calculator — Fixed Deposit Maturity & Interest Calculator',
    seoDescription:
      'Free FD Calculator to calculate fixed deposit maturity amount & interest earned. Compare returns across compounding frequencies & tenures. Works for SBI, HDFC & all banks.',
    category: 'Finance',
    icon: 'lucide:piggy-bank',
    keywords: [
      'fd calculator',
      'fixed deposit calculator',
      'fd maturity calculator',
      'fd interest calculator',
      'bank fd calculator',
      'fd calculator online',
      'fd return calculator',
      'fd calculator india',
      'sbi fd calculator',
      'fd calculator with interest rate',
    ],
    relatedTools: ['sip-calculator', 'emi-calculator', 'percentage-calculator', 'discount-calculator'],
  },
  {
    slug: 'gst-calculator',
    name: 'GST Calculator',
    shortDescription: 'Calculate GST amount for any product or service',
    description:
      'Free online GST Calculator to compute GST amount for 5%, 12%, 18%, and 28% slabs. Calculate both GST-exclusive and GST-inclusive amounts instantly.',
    seoTitle: 'GST Calculator — Calculate GST Online (5%, 12%, 18%, 28%)',
    seoDescription:
      'Free GST Calculator for all tax slabs — 5%, 12%, 18% & 28%. Calculate GST-exclusive & GST-inclusive amounts with CGST, SGST & IGST breakdown. Instant results, no sign-up.',
    category: 'Finance',
    icon: 'lucide:receipt',
    keywords: [
      'gst calculator',
      'gst amount calculator',
      'gst calculator india',
      'gst inclusive calculator',
      'gst exclusive calculator',
      'online gst calculator',
      'gst tax calculator',
      '18 percent gst calculator',
      'gst calculation formula',
      'goods and services tax calculator',
    ],
    relatedTools: ['discount-calculator', 'percentage-calculator', 'emi-calculator', 'sip-calculator'],
  },
  {
    slug: 'discount-calculator',
    name: 'Discount Calculator',
    shortDescription: 'Calculate final price after applying any discount',
    description:
      'Free Discount Calculator to find out how much you save on any purchase. Enter the original price and discount percentage to see the discounted price instantly.',
    seoTitle: 'Discount Calculator — Find Sale Price & Savings Instantly',
    seoDescription:
      'Free Discount Calculator to find the final price after any percentage discount. Enter original price & discount % to instantly see discounted price & exact amount saved.',
    category: 'Finance',
    icon: 'lucide:tag',
    keywords: [
      'discount calculator',
      'price discount calculator',
      'percentage off calculator',
      'sale price calculator',
      'discount percentage calculator',
      'calculate discount online',
      'discount amount calculator',
      'how to calculate discount',
      'original price calculator',
      'percent off calculator',
    ],
    relatedTools: ['gst-calculator', 'percentage-calculator', 'bmi-calculator', 'age-calculator'],
  },
  {
    slug: 'age-calculator',
    name: 'Age Calculator',
    shortDescription: 'Calculate exact age in years, months, and days',
    description:
      'Free Age Calculator to find your exact age in years, months, and days from your date of birth. Also shows total days lived and days until your next birthday.',
    seoTitle: 'Age Calculator — Find Exact Age from Date of Birth Online',
    seoDescription:
      'Free Age Calculator to find your exact age in years, months & days from date of birth. Shows total days lived & days until your next birthday. Handles leap years accurately.',
    category: 'Utility',
    icon: 'lucide:calendar-days',
    keywords: [
      'age calculator',
      'age calculator from date of birth',
      'exact age calculator',
      'how old am i calculator',
      'birthday age calculator',
      'age in years months days calculator',
      'age calculation online',
      'date of birth age calculator',
      'age finder online',
      'my age calculator india',
    ],
    relatedTools: ['bmi-calculator', 'percentage-calculator', 'discount-calculator', 'word-counter'],
  },
  {
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    shortDescription: 'Calculate percentages, percentage change, and more',
    description:
      'Free Percentage Calculator with multiple modes. Find what % of a number is, calculate percentage change, and solve common percentage problems in seconds.',
    seoTitle: 'Percentage Calculator — Calculate % of Any Number Online',
    seoDescription:
      'Free Percentage Calculator with 3 modes: find X% of a number, what % one number is of another, and percentage change. Instant, accurate results online. No sign-up needed.',
    category: 'Utility',
    icon: 'lucide:percent',
    keywords: [
      'percentage calculator',
      'percent calculator online',
      'percentage change calculator',
      'calculate percentage of a number',
      'percentage increase calculator',
      'how to calculate percentage',
      'percentage decrease calculator',
      'marks percentage calculator',
      'percentage difference calculator',
      'percentage formula calculator',
    ],
    relatedTools: ['discount-calculator', 'gst-calculator', 'bmi-calculator', 'sip-calculator'],
  },
  {
    slug: 'bmi-calculator',
    name: 'BMI Calculator',
    shortDescription: 'Calculate your Body Mass Index and health category',
    description:
      'Free BMI Calculator to measure your Body Mass Index. Enter your weight and height to instantly know your BMI and whether you are underweight, normal, overweight, or obese.',
    seoTitle: 'BMI Calculator — Check Body Mass Index & Weight Category',
    seoDescription:
      'Free BMI Calculator to find your Body Mass Index instantly. Enter weight & height to check if you are underweight, normal weight, overweight or obese. Includes BMI chart for Indians.',
    category: 'Utility',
    icon: 'lucide:activity',
    keywords: [
      'bmi calculator',
      'body mass index calculator',
      'bmi calculator india',
      'bmi chart',
      'healthy weight calculator',
      'bmi calculator kg cm',
      'ideal weight calculator',
      'obesity calculator',
      'bmi calculator for adults',
      'bmi calculator online free',
    ],
    relatedTools: ['age-calculator', 'percentage-calculator', 'word-counter', 'discount-calculator'],
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    shortDescription: 'Count words, characters, sentences, and reading time',
    description:
      'Free online Word Counter tool. Count words, characters, sentences, paragraphs, and estimate reading time for any text. Perfect for writers, students, and content creators.',
    seoTitle: 'Word Counter — Count Words, Characters & Reading Time Free',
    seoDescription:
      'Free online Word Counter tool. Count words, characters (with & without spaces), sentences, paragraphs & reading time instantly. Works for all languages. 100% private.',
    category: 'Text',
    icon: 'lucide:file-text',
    keywords: [
      'word counter',
      'character counter online',
      'word count tool',
      'online word counter',
      'free word counter',
      'word counter for essay',
      'character count tool',
      'word and character counter',
      'sentence counter online',
      'paragraph counter',
    ],
    relatedTools: ['json-formatter', 'bmi-calculator', 'age-calculator', 'percentage-calculator'],
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    shortDescription: 'Format, validate, and minify JSON online',
    description:
      'Free online JSON Formatter and Validator. Beautify, format, and minify JSON data instantly. Validate JSON syntax and copy formatted output with one click.',
    seoTitle: 'JSON Formatter — Beautify, Validate & Minify JSON Online',
    seoDescription:
      'Free JSON Formatter to beautify, validate & minify JSON instantly. Paste raw JSON to format with proper indentation & validate syntax. Runs in your browser — data stays private.',
    category: 'Text',
    icon: 'lucide:braces',
    keywords: [
      'json formatter',
      'json beautifier online',
      'json validator',
      'format json online',
      'json pretty print',
      'json minifier online',
      'json formatter online free',
      'json viewer online',
      'json parser online',
      'json formatter and validator',
    ],
    relatedTools: ['word-counter', 'percentage-calculator', 'age-calculator', 'bmi-calculator'],
    fullWidth: true,
  },
];

export const toolsByCategory = tools.reduce<Record<ToolCategory, ToolConfig[]>>(
  (acc, tool) => {
    acc[tool.category].push(tool);
    return acc;
  },
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
