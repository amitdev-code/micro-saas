'use client';

import { useEffect, useMemo, useState } from 'react';
import CalculatorCard from '../CalculatorCard';
import InputField from '../InputField';
import ResultDisplay, { ResultScrollableText } from '../ResultDisplay';
import { getToolBySlug } from '@/lib/toolsConfig';
import { formatCurrency, formatNumber } from '@/lib/calculations';

type FieldType = 'number' | 'text' | 'date' | 'textarea' | 'select';

interface ToolField {
  key: string;
  label: string;
  type: FieldType;
  defaultValue: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

interface ToolResult {
  label: string;
  value: string;
  highlight?: boolean;
}

function getGeneratorResultLabel(slug: string): string {
  const map: Record<string, string> = {
    'strong-password-generator': 'Password',
    'uuid-generator': 'UUID',
    'random-date-generator': 'Date',
    'fake-name-generator': 'Name',
  };
  return map[slug] ?? 'Value';
}

const DAY_MS = 24 * 60 * 60 * 1000;

const TOOL_DEFS: Record<
  string,
  { icon: string; fields: ToolField[]; compute: (values: Record<string, string>) => ToolResult[] }
> = {
  'hra-calculator': {
    icon: 'lucide:house',
    fields: [
      { key: 'basic', label: 'Basic Salary (monthly)', type: 'number', defaultValue: '50000', prefix: '₹' },
      { key: 'hra', label: 'HRA Received (monthly)', type: 'number', defaultValue: '25000', prefix: '₹' },
      { key: 'rent', label: 'Rent Paid (monthly)', type: 'number', defaultValue: '30000', prefix: '₹' },
      {
        key: 'city',
        label: 'City Type',
        type: 'select',
        defaultValue: 'metro',
        options: [
          { label: 'Metro', value: 'metro' },
          { label: 'Non-metro', value: 'non-metro' },
        ],
      },
    ],
    compute: (v) => {
      const basic = +v.basic || 0;
      const hra = +v.hra || 0;
      const rent = +v.rent || 0;
      const limitPercent = v.city === 'metro' ? 0.5 : 0.4;
      const exemption = Math.max(0, Math.min(hra, basic * limitPercent, rent - basic * 0.1));
      return [
        { label: 'HRA Exemption (monthly)', value: formatCurrency(exemption), highlight: true },
        { label: 'Taxable HRA (monthly)', value: formatCurrency(Math.max(0, hra - exemption)) },
      ];
    },
  },
  'gratuity-calculator': {
    icon: 'lucide:wallet',
    fields: [
      { key: 'salary', label: 'Last Drawn Basic + DA (monthly)', type: 'number', defaultValue: '60000', prefix: '₹' },
      { key: 'years', label: 'Years of Service', type: 'number', defaultValue: '10', step: 0.5 },
    ],
    compute: (v) => {
      const salary = +v.salary || 0;
      const years = +v.years || 0;
      const gratuity = (salary * 15 * years) / 26;
      return [{ label: 'Estimated Gratuity', value: formatCurrency(gratuity), highlight: true }];
    },
  },
  'nps-calculator': {
    icon: 'lucide:shield',
    fields: [
      { key: 'monthly', label: 'Monthly Contribution', type: 'number', defaultValue: '5000', prefix: '₹' },
      { key: 'rate', label: 'Expected Annual Return', type: 'number', defaultValue: '10', suffix: '%' },
      { key: 'years', label: 'Years to Retirement', type: 'number', defaultValue: '25' },
      { key: 'annuity', label: 'Annuity Purchase %', type: 'number', defaultValue: '40', suffix: '%' },
    ],
    compute: (v) => {
      const p = +v.monthly || 0;
      const annual = (+v.rate || 0) / 100;
      const years = +v.years || 0;
      const n = years * 12;
      const r = annual / 12;
      const corpus = r > 0 ? p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : p * n;
      const annuityPct = Math.min(100, Math.max(0, +v.annuity || 0)) / 100;
      const annuity = corpus * annuityPct;
      const lumpSum = corpus - annuity;
      return [
        { label: 'Retirement Corpus', value: formatCurrency(corpus), highlight: true },
        { label: 'Lump Sum (Withdrawable)', value: formatCurrency(lumpSum) },
        { label: 'Annuity Purchase Amount', value: formatCurrency(annuity) },
      ];
    },
  },
  'ppf-calculator': {
    icon: 'lucide:piggy-bank',
    fields: [
      { key: 'yearly', label: 'Yearly Investment', type: 'number', defaultValue: '150000', prefix: '₹' },
      { key: 'rate', label: 'Annual Interest Rate', type: 'number', defaultValue: '7.1', suffix: '%' },
      { key: 'years', label: 'Years', type: 'number', defaultValue: '15' },
    ],
    compute: (v) => {
      const yearly = +v.yearly || 0;
      const rate = (+v.rate || 0) / 100;
      const years = +v.years || 0;
      const maturity = yearly * ((Math.pow(1 + rate, years) - 1) / rate);
      const invested = yearly * years;
      return [
        { label: 'Maturity Amount', value: formatCurrency(maturity), highlight: true },
        { label: 'Total Invested', value: formatCurrency(invested) },
        { label: 'Interest Earned', value: formatCurrency(maturity - invested) },
      ];
    },
  },
  'simple-interest-calculator': {
    icon: 'lucide:calculator',
    fields: [
      { key: 'principal', label: 'Principal', type: 'number', defaultValue: '100000', prefix: '₹' },
      { key: 'rate', label: 'Annual Rate', type: 'number', defaultValue: '8', suffix: '%' },
      { key: 'years', label: 'Years', type: 'number', defaultValue: '3' },
    ],
    compute: (v) => {
      const p = +v.principal || 0;
      const r = +v.rate || 0;
      const t = +v.years || 0;
      const interest = (p * r * t) / 100;
      return [
        { label: 'Simple Interest', value: formatCurrency(interest), highlight: true },
        { label: 'Total Amount', value: formatCurrency(p + interest) },
      ];
    },
  },
  'compound-interest-calculator': {
    icon: 'lucide:bar-chart-3',
    fields: [
      { key: 'principal', label: 'Principal', type: 'number', defaultValue: '100000', prefix: '₹' },
      { key: 'rate', label: 'Annual Rate', type: 'number', defaultValue: '8', suffix: '%' },
      { key: 'years', label: 'Years', type: 'number', defaultValue: '5' },
      { key: 'freq', label: 'Compounds / Year', type: 'number', defaultValue: '4' },
    ],
    compute: (v) => {
      const p = +v.principal || 0;
      const r = (+v.rate || 0) / 100;
      const t = +v.years || 0;
      const n = +v.freq || 1;
      const amount = p * Math.pow(1 + r / n, n * t);
      return [
        { label: 'Maturity Amount', value: formatCurrency(amount), highlight: true },
        { label: 'Interest Earned', value: formatCurrency(amount - p) },
      ];
    },
  },
  'loan-eligibility-calculator': {
    icon: 'lucide:badge-dollar-sign',
    fields: [
      { key: 'income', label: 'Monthly Net Income', type: 'number', defaultValue: '80000', prefix: '₹' },
      { key: 'obligation', label: 'Existing EMIs', type: 'number', defaultValue: '10000', prefix: '₹' },
      { key: 'rate', label: 'Interest Rate', type: 'number', defaultValue: '9', suffix: '%' },
      { key: 'months', label: 'Tenure (months)', type: 'number', defaultValue: '240' },
    ],
    compute: (v) => {
      const income = +v.income || 0;
      const obligation = +v.obligation || 0;
      const rate = (+v.rate || 0) / 12 / 100;
      const n = +v.months || 0;
      const eligibleEmi = Math.max(0, income * 0.5 - obligation);
      const principal = rate > 0 ? (eligibleEmi * (1 - Math.pow(1 + rate, -n))) / rate : eligibleEmi * n;
      return [
        { label: 'Eligible EMI', value: formatCurrency(eligibleEmi), highlight: true },
        { label: 'Estimated Loan Eligibility', value: formatCurrency(principal) },
      ];
    },
  },
  'credit-card-emi-calculator': {
    icon: 'lucide:credit-card',
    fields: [
      { key: 'amount', label: 'Purchase Amount', type: 'number', defaultValue: '60000', prefix: '₹' },
      { key: 'rate', label: 'Annual Interest Rate', type: 'number', defaultValue: '18', suffix: '%' },
      { key: 'months', label: 'Tenure (months)', type: 'number', defaultValue: '12' },
    ],
    compute: (v) => {
      const p = +v.amount || 0;
      const r = (+v.rate || 0) / 12 / 100;
      const n = +v.months || 1;
      const emi = r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / n;
      const total = emi * n;
      return [
        { label: 'Monthly EMI', value: formatCurrency(emi), highlight: true },
        { label: 'Total Interest', value: formatCurrency(total - p) },
        { label: 'Total Repayment', value: formatCurrency(total) },
      ];
    },
  },
  'inflation-calculator': {
    icon: 'lucide:trending-up',
    fields: [
      { key: 'amount', label: 'Current Amount', type: 'number', defaultValue: '100000', prefix: '₹' },
      { key: 'rate', label: 'Inflation Rate', type: 'number', defaultValue: '6', suffix: '%' },
      { key: 'years', label: 'Years', type: 'number', defaultValue: '10' },
    ],
    compute: (v) => {
      const amount = +v.amount || 0;
      const rate = (+v.rate || 0) / 100;
      const years = +v.years || 0;
      const future = amount * Math.pow(1 + rate, years);
      return [
        { label: 'Future Cost of Same Value', value: formatCurrency(future), highlight: true },
        { label: 'Purchasing Power Lost', value: formatCurrency(future - amount) },
      ];
    },
  },
  'cm-to-feet-inches-converter': {
    icon: 'lucide:ruler',
    fields: [{ key: 'cm', label: 'Centimeters', type: 'number', defaultValue: '170' }],
    compute: (v) => {
      const cm = +v.cm || 0;
      const totalInches = cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches - feet * 12;
      return [{ label: 'Feet & Inches', value: `${feet} ft ${inches.toFixed(2)} in`, highlight: true }];
    },
  },
  'kg-to-pounds-converter': {
    icon: 'lucide:weight',
    fields: [{ key: 'kg', label: 'Kilograms', type: 'number', defaultValue: '70' }],
    compute: (v) => [{ label: 'Pounds', value: `${((+v.kg || 0) * 2.20462).toFixed(4)} lb`, highlight: true }],
  },
  'celsius-to-fahrenheit-converter': {
    icon: 'lucide:thermometer',
    fields: [{ key: 'c', label: 'Celsius', type: 'number', defaultValue: '25' }],
    compute: (v) => [{ label: 'Fahrenheit', value: `${(((+v.c || 0) * 9) / 5 + 32).toFixed(2)} °F`, highlight: true }],
  },
  'square-feet-to-square-meter': {
    icon: 'lucide:square',
    fields: [{ key: 'sqft', label: 'Square Feet', type: 'number', defaultValue: '1000' }],
    compute: (v) => [{ label: 'Square Meter', value: `${((+v.sqft || 0) * 0.092903).toFixed(4)} m²`, highlight: true }],
  },
  'miles-to-km-converter': {
    icon: 'lucide:route',
    fields: [{ key: 'miles', label: 'Miles', type: 'number', defaultValue: '10' }],
    compute: (v) => [{ label: 'Kilometers', value: `${((+v.miles || 0) * 1.60934).toFixed(4)} km`, highlight: true }],
  },
  'seconds-to-hours-converter': {
    icon: 'lucide:timer',
    fields: [{ key: 'seconds', label: 'Seconds', type: 'number', defaultValue: '7200' }],
    compute: (v) => {
      const total = Math.max(0, +v.seconds || 0);
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = Math.floor(total % 60);
      return [
        { label: 'Hours (decimal)', value: (total / 3600).toFixed(4), highlight: true },
        { label: 'HH:MM:SS', value: `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` },
      ];
    },
  },
  'binary-to-decimal-converter': {
    icon: 'lucide:binary',
    fields: [{ key: 'binary', label: 'Binary Number', type: 'text', defaultValue: '1010' }],
    compute: (v) => {
      const b = (v.binary ?? '').trim();
      const valid = /^[01]+$/.test(b);
      return [{ label: 'Decimal', value: valid ? String(parseInt(b, 2)) : 'Enter valid binary (0/1)', highlight: true }];
    },
  },
  'number-to-words-converter': {
    icon: 'lucide:text',
    fields: [{ key: 'num', label: 'Number', type: 'number', defaultValue: '12345' }],
    compute: (v) => [{ label: 'Words', value: new Intl.NumberFormat('en-IN', { style: 'decimal' }).format(+v.num || 0), highlight: true }],
  },
  'working-days-calculator': {
    icon: 'lucide:calendar',
    fields: [
      { key: 'start', label: 'Start Date', type: 'date', defaultValue: todayString() },
      { key: 'end', label: 'End Date', type: 'date', defaultValue: todayString(14) },
    ],
    compute: (v) => [{ label: 'Working Days (Mon-Fri)', value: String(countBusinessDays(v.start, v.end)), highlight: true }],
  },
  'business-days-calculator': {
    icon: 'lucide:briefcase',
    fields: [
      { key: 'start', label: 'Start Date', type: 'date', defaultValue: todayString() },
      { key: 'end', label: 'End Date', type: 'date', defaultValue: todayString(30) },
    ],
    compute: (v) => [{ label: 'Business Days', value: String(countBusinessDays(v.start, v.end)), highlight: true }],
  },
  'week-number-calculator': {
    icon: 'lucide:calendar-range',
    fields: [{ key: 'date', label: 'Date', type: 'date', defaultValue: todayString() }],
    compute: (v) => [{ label: 'Week Number (ISO)', value: String(getWeekNumber(new Date(v.date))), highlight: true }],
  },
  'countdown-timer-date-based': {
    icon: 'lucide:hourglass',
    fields: [{ key: 'target', label: 'Target Date', type: 'date', defaultValue: todayString(10) }],
    compute: (v) => {
      const diff = Math.ceil((new Date(v.target).getTime() - Date.now()) / DAY_MS);
      return [{ label: 'Days Remaining', value: String(diff), highlight: true }];
    },
  },
  'age-difference-calculator': {
    icon: 'lucide:users',
    fields: [
      { key: 'd1', label: 'First Date of Birth', type: 'date', defaultValue: '1990-01-01' },
      { key: 'd2', label: 'Second Date of Birth', type: 'date', defaultValue: '1995-01-01' },
    ],
    compute: (v) => [{ label: 'Age Difference', value: diffHuman(v.d1, v.d2), highlight: true }],
  },
  'time-duration-calculator': {
    icon: 'lucide:clock-3',
    fields: [
      { key: 'start', label: 'Start Date', type: 'date', defaultValue: todayString() },
      { key: 'end', label: 'End Date', type: 'date', defaultValue: todayString(7) },
    ],
    compute: (v) => {
      const days = Math.abs(Math.round((new Date(v.end).getTime() - new Date(v.start).getTime()) / DAY_MS));
      return [
        { label: 'Days', value: String(days), highlight: true },
        { label: 'Hours', value: formatNumber(days * 24) },
      ];
    },
  },
  'remove-extra-spaces': {
    icon: 'lucide:eraser',
    fields: [{ key: 'text', label: 'Input Text', type: 'textarea', defaultValue: 'This   is   a   sample   text.' }],
    compute: (v) => [
      { label: 'Clean Text', value: (v.text ?? '').replace(/\s+/g, ' ').trim(), highlight: true },
    ],
  },
  'text-sorter-az': {
    icon: 'lucide:arrow-down-a-z',
    fields: [{ key: 'text', label: 'One item per line', type: 'textarea', defaultValue: 'Banana\nApple\nMango' }],
    compute: (v) => [
      {
        label: 'Sorted Text',
        value: (v.text ?? '')
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean)
          .sort()
          .join('\n'),
        highlight: true,
      },
    ],
  },
  'reverse-text-generator': {
    icon: 'lucide:flip-horizontal',
    fields: [{ key: 'text', label: 'Input Text', type: 'textarea', defaultValue: 'Hello World' }],
    compute: (v) => [
      { label: 'Reversed', value: (v.text ?? '').split('').reverse().join(''), highlight: true },
    ],
  },
  'slug-generator': {
    icon: 'lucide:link-2',
    fields: [{ key: 'text', label: 'Title', type: 'text', defaultValue: 'My Awesome SEO Post' }],
    compute: (v) => [{ label: 'Slug', value: slugify(v.text ?? ''), highlight: true }],
  },
  'html-to-text-converter': {
    icon: 'lucide:file-code',
    fields: [{ key: 'html', label: 'HTML Input', type: 'textarea', defaultValue: '<h1>Hello</h1><p>World</p>' }],
    compute: (v) => [{ label: 'Plain Text', value: v.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), highlight: true }],
  },
  'url-encoder-decoder': {
    icon: 'lucide:globe',
    fields: [{ key: 'text', label: 'Text or URL', type: 'text', defaultValue: 'hello world' }],
    compute: (v) => [
      { label: 'URL Encoded', value: encodeURIComponent(v.text ?? ''), highlight: true },
      { label: 'URL Decoded', value: safeDecodeURIComponent(v.text ?? '') },
    ],
  },
  'base64-encoder-decoder': {
    icon: 'lucide:lock-keyhole',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'Encode this text' }],
    compute: (v) => {
      const t = v.text ?? '';
      return [
        { label: 'Base64 Encoded', value: btoa(unescape(encodeURIComponent(t))), highlight: true },
        { label: 'Base64 Decoded', value: safeBase64Decode(t) },
      ];
    },
  },
};

function todayString(offset = 0) {
  const d = new Date(Date.now() + offset * DAY_MS);
  return d.toISOString().slice(0, 10);
}

function countBusinessDays(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || s > e) return 0;
  let days = 0;
  const curr = new Date(s);
  while (curr <= e) {
    const day = curr.getDay();
    if (day !== 0 && day !== 6) days += 1;
    curr.setDate(curr.getDate() + 1);
  }
  return days;
}

function getWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / DAY_MS) + 1) / 7);
}

function diffHuman(a: string, b: string) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  const [start, end] = d1 <= d2 ? [d1, d2] : [d2, d1];
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years} years, ${months} months, ${days} days`;
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return 'Invalid encoded URL string';
  }
}

function safeBase64Decode(value: string) {
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch {
    return 'Enter valid Base64 to decode';
  }
}

const PW_UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const PW_LOWER = 'abcdefghijkmnpqrstuvwxyz';
const PW_DIGITS = '23456789';
const PW_SPECIAL = '!@#$%^&*';
const PW_ALL = PW_UPPER + PW_LOWER + PW_DIGITS + PW_SPECIAL;

function randomFrom(pool: string): string {
  return pool[Math.floor(Math.random() * pool.length)] ?? '';
}

function shuffleString(s: string): string {
  const a = s.split('');
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join('');
}

/** At least one each: upper, lower, digit, special. Length 14 (always ≥ 8). */
function generatePassword() {
  const len = 14;
  const parts = [
    randomFrom(PW_UPPER),
    randomFrom(PW_LOWER),
    randomFrom(PW_DIGITS),
    randomFrom(PW_SPECIAL),
  ];
  for (let i = parts.length; i < len; i += 1) {
    parts.push(randomFrom(PW_ALL));
  }
  return shuffleString(parts.join(''));
}

export default function GenericTool({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);
  const def = TOOL_DEFS[slug];
  const [values, setValues] = useState<Record<string, string>>({});
  const [timerLeft, setTimerLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [cpsRunning, setCpsRunning] = useState(false);
  const [cpsLeft, setCpsLeft] = useState(5);
  const [cpsCount, setCpsCount] = useState(0);
  const [randOutput, setRandOutput] = useState<string>('');
  const [ipInfo, setIpInfo] = useState<string>('');

  useEffect(() => {
    if (!def) return;
    const next: Record<string, string> = {};
    def.fields.forEach((f) => {
      next[f.key] = f.defaultValue;
    });
    setValues(next);
  }, [def]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimerLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!cpsRunning) return;
    const id = setInterval(() => {
      setCpsLeft((prev) => {
        if (prev <= 1) {
          setCpsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cpsRunning]);

  const results = useMemo(() => (def ? def.compute(values) : []), [def, values]);
  const title = tool?.name || 'Tool';
  const icon = tool?.icon || 'lucide:tool-case';

  if (!tool) return null;

  if (slug === 'random-color-generator') {
    return (
      <CalculatorCard title={title} icon={icon}>
        <button
          type="button"
          onClick={() => setRandOutput(generateRandomBySlug(slug))}
          className="w-full py-3 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold"
        >
          Generate
        </button>
        {randOutput && (
          <div className="mt-4 space-y-3">
            <div
              className="w-full h-16 sm:h-20 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-inner"
              style={{ backgroundColor: randOutput }}
              role="img"
              aria-label={`Color preview: ${randOutput}`}
            />
            <ResultDisplay
              className="mt-0"
              results={[{ label: 'HEX', value: randOutput, highlight: true }]}
            />
          </div>
        )}
      </CalculatorCard>
    );
  }

  if (slug === 'strong-password-generator' || slug === 'uuid-generator' || slug === 'random-date-generator' || slug === 'fake-name-generator') {
    const resultLabel = getGeneratorResultLabel(slug);
    return (
      <CalculatorCard title={title} icon={icon}>
        <button
          type="button"
          onClick={() => setRandOutput(generateRandomBySlug(slug))}
          className="w-full py-3 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold"
        >
          Generate
        </button>
        {randOutput && (
          <ResultDisplay
            className="mt-4"
            results={[{ label: resultLabel, value: randOutput, highlight: true }]}
          />
        )}
      </CalculatorCard>
    );
  }

  if (slug === 'pomodoro-timer') {
    return (
      <CalculatorCard title={title} icon={icon}>
        <div className="text-center">
          <p className="text-5xl font-black">{`${String(Math.floor(timerLeft / 60)).padStart(2, '0')}:${String(timerLeft % 60).padStart(2, '0')}`}</p>
          <div className="mt-4 flex gap-2 justify-center">
            <button onClick={() => setRunning((p) => !p)} className="px-4 py-2 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900">{running ? 'Pause' : 'Start'}</button>
            <button onClick={() => { setRunning(false); setTimerLeft(25 * 60); }} className="px-4 py-2 rounded border">Reset</button>
          </div>
        </div>
      </CalculatorCard>
    );
  }

  if (slug === 'click-speed-test-cps-test') {
    return (
      <CalculatorCard title={title} icon={icon}>
        <p className="text-sm text-gray-500 mb-3">Click test runs for 5 seconds.</p>
        <button
          onClick={() => {
            if (!cpsRunning && cpsLeft === 0) return;
            if (!cpsRunning) {
              setCpsRunning(true);
              setCpsLeft(5);
              setCpsCount(1);
            } else {
              setCpsCount((c) => c + 1);
            }
          }}
          className="w-full py-10 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-xl"
        >
          Click Me
        </button>
        <ResultDisplay
          className="mt-4"
          results={[
            { label: 'CPS', value: cpsLeft === 0 && cpsCount > 0 ? (cpsCount / 5).toFixed(2) : '—', highlight: true },
            { label: 'Time left', value: `${cpsLeft} s` },
            { label: 'Clicks', value: String(cpsCount) },
          ]}
        />
      </CalculatorCard>
    );
  }

  if (slug === 'screen-resolution-checker') {
    return (
      <CalculatorCard title={title} icon={icon}>
        <ResultDisplay
          results={[
            { label: 'Screen', value: `${window.screen.width} × ${window.screen.height}`, highlight: true },
            { label: 'Viewport', value: `${window.innerWidth} × ${window.innerHeight}` },
            { label: 'Device Pixel Ratio', value: String(window.devicePixelRatio) },
          ]}
        />
      </CalculatorCard>
    );
  }

  if (slug === 'ip-info-viewer-frontend-fetch') {
    return (
      <CalculatorCard title={title} icon={icon}>
        <button
          onClick={async () => {
            try {
              const res = await fetch('https://ipapi.co/json/');
              const data = await res.json();
              setIpInfo(JSON.stringify(data, null, 2));
            } catch {
              setIpInfo('Unable to fetch IP info right now.');
            }
          }}
          className="w-full py-3 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold"
        >
          Fetch IP Info
        </button>
        {ipInfo && (
          <ResultScrollableText
            className="mt-4"
            value={ipInfo}
            variant={/^[\s]*[[{]/.test(ipInfo) ? 'pre' : 'plain'}
            maxHeightClass="max-h-96"
          />
        )}
      </CalculatorCard>
    );
  }

  if (!def) {
    return (
      <CalculatorCard title={title} icon={icon}>
        <p className="text-sm text-gray-500">This tool screen is ready. Calculator logic will be added next.</p>
      </CalculatorCard>
    );
  }

  return (
    <CalculatorCard title={title} icon={icon}>
      <div className="space-y-4 mb-5">
        {def.fields.map((field) =>
          field.type === 'textarea' ? (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
              <textarea
                value={values[field.key] || ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                spellCheck={false}
                className="w-full min-h-[7rem] max-h-72 resize-y overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10"
              />
            </div>
          ) : field.type === 'select' ? (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
              <select
                value={values[field.key] || ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm"
              >
                {(field.options || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <InputField
              key={field.key}
              label={field.label}
              type={field.type === 'date' ? 'date' : field.type === 'text' ? 'text' : 'number'}
              value={values[field.key] || ''}
              onChange={(value) => setValues((prev) => ({ ...prev, [field.key]: value }))}
              min={field.min}
              max={field.max}
              step={field.step}
              prefix={field.prefix}
              suffix={field.suffix}
              placeholder={field.placeholder}
            />
          )
        )}
      </div>
      <ResultDisplay results={results.map((r) => ({ label: r.label, value: r.value, highlight: r.highlight }))} />
    </CalculatorCard>
  );
}

function generateRandomBySlug(slug: string) {
  if (slug === 'strong-password-generator') return generatePassword();
  if (slug === 'random-color-generator') return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  if (slug === 'uuid-generator') return crypto.randomUUID();
  if (slug === 'random-date-generator') {
    const start = new Date(1990, 0, 1).getTime();
    const end = new Date(2035, 11, 31).getTime();
    return new Date(start + Math.random() * (end - start)).toISOString().slice(0, 10);
  }
  if (slug === 'fake-name-generator') {
    const first = ['Aarav', 'Siya', 'Rohan', 'Priya', 'Kabir', 'Anaya'];
    const last = ['Sharma', 'Verma', 'Patel', 'Mehta', 'Reddy', 'Nair'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  }
  return '';
}
