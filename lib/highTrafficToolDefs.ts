import { formatCurrency, formatNumber } from '@/lib/calculations';

type ToolField = {
  key: string;
  label: string;
  type: 'number' | 'text' | 'date' | 'textarea' | 'select';
  defaultValue: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
};

type ToolResult = { label: string; value: string; highlight?: boolean };

const n = (v: string | undefined) => +((v ?? '').replace(/,/g, '')) || 0;
const s = (v: string | undefined) => (v ?? '').trim();

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const lcm = (a: number, b: number): number => (a && b ? Math.abs(a * b) / gcd(a, b) : 0);

const isPrime = (x: number) => {
  if (x < 2 || !Number.isInteger(x)) return false;
  if (x === 2) return true;
  if (x % 2 === 0) return false;
  for (let i = 3; i * i <= x; i += 2) if (x % i === 0) return false;
  return true;
};

function parseFlows(raw: string) {
  return s(raw)
    .split('\n')
    .map((line) => {
      const [dt, amt] = line.split(',').map((x) => x.trim());
      return { date: new Date(dt), amount: +amt };
    })
    .filter((x) => !Number.isNaN(x.date.getTime()) && Number.isFinite(x.amount));
}

function npv(rate: number, flows: { date: Date; amount: number }[]) {
  const base = flows[0]?.date.getTime() ?? Date.now();
  return flows.reduce((acc, f) => {
    const years = (f.date.getTime() - base) / (1000 * 60 * 60 * 24 * 365);
    return acc + f.amount / Math.pow(1 + rate, years);
  }, 0);
}

function xirr(flows: { date: Date; amount: number }[]) {
  let lo = -0.9999;
  let hi = 10;
  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2;
    const v = npv(mid, flows);
    if (v > 0) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
}

function matrix2x2(a: number, b: number, c: number, d: number) {
  return {
    det: a * d - b * c,
    trace: a + d,
  };
}

function tinyHashMd5Like(input: string) {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return (h1 >>> 0).toString(16).padStart(8, '0');
}

export const highTrafficToolDefinitions: Record<
  string,
  { icon: string; fields: ToolField[]; compute: (values: Record<string, string>) => ToolResult[] }
> = {
  'cagr-calculator': {
    icon: 'lucide:trending-up',
    fields: [
      { key: 'start', label: 'Initial value', type: 'number', defaultValue: '100000', prefix: '₹' },
      { key: 'end', label: 'Final value', type: 'number', defaultValue: '180000', prefix: '₹' },
      { key: 'years', label: 'Years', type: 'number', defaultValue: '5' },
    ],
    compute: (v) => {
      const start = Math.max(1, n(v.start));
      const end = Math.max(0, n(v.end));
      const years = Math.max(0.01, n(v.years));
      const cagr = (Math.pow(end / start, 1 / years) - 1) * 100;
      return [{ label: 'CAGR', value: `${cagr.toFixed(2)}%`, highlight: true }];
    },
  },
  'xirr-calculator-simplified': {
    icon: 'lucide:chart-line',
    fields: [
      {
        key: 'flows',
        label: 'Cash flows (date,amount per line)',
        type: 'textarea',
        defaultValue: '2022-01-01,-100000\n2023-01-01,20000\n2024-01-01,20000\n2025-01-01,80000',
      },
    ],
    compute: (v) => {
      const flows = parseFlows(v.flows);
      if (flows.length < 2) return [{ label: 'XIRR', value: 'Enter at least 2 valid lines', highlight: true }];
      const r = xirr(flows);
      return [{ label: 'Simplified XIRR', value: `${r.toFixed(2)}%`, highlight: true }];
    },
  },
  'break-even-calculator': {
    icon: 'lucide:goal',
    fields: [
      { key: 'fixed', label: 'Fixed cost', type: 'number', defaultValue: '100000', prefix: '₹' },
      { key: 'price', label: 'Revenue per unit', type: 'number', defaultValue: '500', prefix: '₹' },
      { key: 'var', label: 'Variable cost per unit', type: 'number', defaultValue: '250', prefix: '₹' },
    ],
    compute: (v) => {
      const cm = n(v.price) - n(v.var);
      const q = cm > 0 ? n(v.fixed) / cm : 0;
      return [
        { label: 'Break-even units', value: cm > 0 ? formatNumber(Math.ceil(q)) : 'Invalid contribution margin', highlight: true },
        { label: 'Contribution / unit', value: formatCurrency(cm) },
      ];
    },
  },
  'profit-margin-calculator': {
    icon: 'lucide:percent',
    fields: [
      { key: 'cost', label: 'Cost price', type: 'number', defaultValue: '500', prefix: '₹' },
      { key: 'sell', label: 'Selling price', type: 'number', defaultValue: '750', prefix: '₹' },
    ],
    compute: (v) => {
      const c = n(v.cost);
      const p = n(v.sell);
      const margin = p > 0 ? ((p - c) / p) * 100 : 0;
      return [{ label: 'Profit margin', value: `${margin.toFixed(2)}%`, highlight: true }];
    },
  },
  'discount-reverse-calculator': {
    icon: 'lucide:badge-percent',
    fields: [
      { key: 'final', label: 'Final price', type: 'number', defaultValue: '799', prefix: '₹' },
      { key: 'disc', label: 'Discount %', type: 'number', defaultValue: '20', suffix: '%' },
    ],
    compute: (v) => {
      const d = n(v.disc) / 100;
      const original = d < 1 ? n(v.final) / (1 - d) : 0;
      return [{ label: 'Original price', value: formatCurrency(original), highlight: true }];
    },
  },
  'investment-doubling-time-calculator': {
    icon: 'lucide:infinity',
    fields: [{ key: 'rate', label: 'Interest rate %', type: 'number', defaultValue: '12', suffix: '%' }],
    compute: (v) => {
      const rate = n(v.rate);
      return [{ label: 'Doubling time (Rule of 72)', value: rate > 0 ? `${(72 / rate).toFixed(2)} years` : 'Enter positive rate', highlight: true }];
    },
  },
  'loan-prepayment-calculator': {
    icon: 'lucide:banknote',
    fields: [
      { key: 'loan', label: 'Outstanding loan', type: 'number', defaultValue: '3000000', prefix: '₹' },
      { key: 'emi', label: 'Current EMI', type: 'number', defaultValue: '30000', prefix: '₹' },
      { key: 'extra', label: 'Extra monthly prepayment', type: 'number', defaultValue: '5000', prefix: '₹' },
      { key: 'rate', label: 'Interest % p.a.', type: 'number', defaultValue: '9', suffix: '%' },
    ],
    compute: (v) => {
      const P = n(v.loan);
      const r = n(v.rate) / 1200;
      const emi = n(v.emi);
      const emi2 = emi + n(v.extra);
      const months = r > 0 ? Math.log(emi / (emi - P * r)) / Math.log(1 + r) : P / emi;
      const months2 = r > 0 ? Math.log(emi2 / (emi2 - P * r)) / Math.log(1 + r) : P / emi2;
      return [
        { label: 'Tenure reduction', value: `${Math.max(0, Math.floor(months - months2))} months`, highlight: true },
        { label: 'Old tenure (est.)', value: `${Math.ceil(months)} months` },
        { label: 'New tenure (est.)', value: `${Math.ceil(months2)} months` },
      ];
    },
  },
  'net-worth-calculator': {
    icon: 'lucide:wallet',
    fields: [
      { key: 'assets', label: 'Total assets', type: 'number', defaultValue: '5000000', prefix: '₹' },
      { key: 'liab', label: 'Total liabilities', type: 'number', defaultValue: '1800000', prefix: '₹' },
    ],
    compute: (v) => [{ label: 'Net worth', value: formatCurrency(n(v.assets) - n(v.liab)), highlight: true }],
  },
  'calorie-needs-calculator': {
    icon: 'lucide:flame',
    fields: [
      { key: 'age', label: 'Age', type: 'number', defaultValue: '30' },
      { key: 'wt', label: 'Weight (kg)', type: 'number', defaultValue: '70' },
      { key: 'ht', label: 'Height (cm)', type: 'number', defaultValue: '170' },
      {
        key: 'act',
        label: 'Activity',
        type: 'select',
        defaultValue: '1.55',
        options: [
          { label: 'Sedentary', value: '1.2' },
          { label: 'Light', value: '1.375' },
          { label: 'Moderate', value: '1.55' },
          { label: 'Active', value: '1.725' },
        ],
      },
    ],
    compute: (v) => {
      const bmr = 10 * n(v.wt) + 6.25 * n(v.ht) - 5 * n(v.age) + 5;
      const tdee = bmr * n(v.act);
      return [{ label: 'Daily calories (est.)', value: `${Math.round(tdee)} kcal`, highlight: true }];
    },
  },
  'body-fat-calculator': {
    icon: 'lucide:activity',
    fields: [
      { key: 'waist', label: 'Waist (cm)', type: 'number', defaultValue: '85' },
      { key: 'neck', label: 'Neck (cm)', type: 'number', defaultValue: '38' },
      { key: 'height', label: 'Height (cm)', type: 'number', defaultValue: '170' },
    ],
    compute: (v) => {
      const val = 495 / (1.0324 - 0.19077 * Math.log10(Math.max(1, n(v.waist) - n(v.neck))) + 0.15456 * Math.log10(Math.max(1, n(v.height)))) - 450;
      return [{ label: 'Body fat % (US Navy rough)', value: `${val.toFixed(2)}%`, highlight: true }];
    },
  },
  'ideal-weight-calculator': {
    icon: 'lucide:heart',
    fields: [
      { key: 'h', label: 'Height (cm)', type: 'number', defaultValue: '170' },
      { key: 'g', label: 'Gender', type: 'select', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
    ],
    compute: (v) => {
      const inch = n(v.h) / 2.54;
      const base = v.g === 'female' ? 45.5 : 50;
      const ibw = base + Math.max(0, inch - 60) * (v.g === 'female' ? 2.2 : 2.3);
      return [{ label: 'Ideal body weight (Devine)', value: `${ibw.toFixed(1)} kg`, highlight: true }];
    },
  },
  'water-intake-calculator': {
    icon: 'lucide:droplets',
    fields: [{ key: 'w', label: 'Weight (kg)', type: 'number', defaultValue: '70' }],
    compute: (v) => [{ label: 'Daily water (rough)', value: `${(n(v.w) * 0.035).toFixed(2)} liters`, highlight: true }],
  },
  'macro-nutrient-calculator': {
    icon: 'lucide:utensils',
    fields: [{ key: 'cal', label: 'Calories / day', type: 'number', defaultValue: '2200' }],
    compute: (v) => {
      const cal = n(v.cal);
      const p = (cal * 0.3) / 4;
      const c = (cal * 0.4) / 4;
      const f = (cal * 0.3) / 9;
      return [
        { label: 'Protein (30%)', value: `${Math.round(p)} g`, highlight: true },
        { label: 'Carbs (40%)', value: `${Math.round(c)} g` },
        { label: 'Fat (30%)', value: `${Math.round(f)} g` },
      ];
    },
  },
  'scientific-calculator-web': {
    icon: 'lucide:calculator',
    fields: [{ key: 'expr', label: 'Expression (e.g. (2+3)*4)', type: 'text', defaultValue: '(2+3)*4' }],
    compute: (v) => {
      try {
        const expr = s(v.expr).replace(/[^0-9+\-*/().%\s]/g, '');
        const value = Function(`"use strict"; return (${expr});`)();
        return [{ label: 'Result', value: String(value), highlight: true }];
      } catch {
        return [{ label: 'Result', value: 'Invalid expression', highlight: true }];
      }
    },
  },
  'fraction-calculator': {
    icon: 'lucide:divide',
    fields: [
      { key: 'a', label: 'A numerator', type: 'number', defaultValue: '1' },
      { key: 'b', label: 'A denominator', type: 'number', defaultValue: '2' },
      { key: 'c', label: 'B numerator', type: 'number', defaultValue: '1' },
      { key: 'd', label: 'B denominator', type: 'number', defaultValue: '3' },
    ],
    compute: (v) => {
      const a = n(v.a), b = Math.max(1, n(v.b)), c = n(v.c), d = Math.max(1, n(v.d));
      return [
        { label: 'A + B', value: `${a * d + b * c}/${b * d}`, highlight: true },
        { label: 'A - B', value: `${a * d - b * c}/${b * d}` },
        { label: 'A × B', value: `${a * c}/${b * d}` },
      ];
    },
  },
  'lcm-calculator': {
    icon: 'lucide:list-tree',
    fields: [{ key: 'nums', label: 'Numbers (comma separated)', type: 'text', defaultValue: '12,18,24' }],
    compute: (v) => {
      const arr = s(v.nums).split(',').map((x) => +x.trim()).filter((x) => Number.isFinite(x));
      const out = arr.reduce((acc, x) => lcm(acc, x), 1);
      return [{ label: 'LCM', value: formatNumber(out), highlight: true }];
    },
  },
  'gcd-calculator': {
    icon: 'lucide:workflow',
    fields: [{ key: 'nums', label: 'Numbers (comma separated)', type: 'text', defaultValue: '84,126,210' }],
    compute: (v) => {
      const arr = s(v.nums).split(',').map((x) => +x.trim()).filter((x) => Number.isFinite(x));
      const out = arr.reduce((acc, x) => gcd(acc, x), 0);
      return [{ label: 'GCD / HCF', value: formatNumber(out), highlight: true }];
    },
  },
  'prime-number-checker': {
    icon: 'lucide:circle-dot',
    fields: [{ key: 'x', label: 'Number', type: 'number', defaultValue: '97' }],
    compute: (v) => [{ label: 'Prime?', value: isPrime(n(v.x)) ? 'Yes' : 'No', highlight: true }],
  },
  'random-number-list-generator': {
    icon: 'lucide:list',
    fields: [
      { key: 'count', label: 'Count', type: 'number', defaultValue: '10' },
      { key: 'min', label: 'Min', type: 'number', defaultValue: '1' },
      { key: 'max', label: 'Max', type: 'number', defaultValue: '100' },
    ],
    compute: (v) => {
      const count = Math.min(500, Math.max(1, n(v.count)));
      const min = n(v.min);
      const max = Math.max(min, n(v.max));
      const arr = Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
      return [{ label: 'Random list', value: arr.join(', '), highlight: true }];
    },
  },
  'matrix-calculator-basic': {
    icon: 'lucide:table',
    fields: [
      { key: 'a', label: 'a11', type: 'number', defaultValue: '1' },
      { key: 'b', label: 'a12', type: 'number', defaultValue: '2' },
      { key: 'c', label: 'a21', type: 'number', defaultValue: '3' },
      { key: 'd', label: 'a22', type: 'number', defaultValue: '4' },
    ],
    compute: (v) => {
      const m = matrix2x2(n(v.a), n(v.b), n(v.c), n(v.d));
      return [
        { label: 'Determinant', value: String(m.det), highlight: true },
        { label: 'Trace', value: String(m.trace) },
      ];
    },
  },
  'age-in-months-days-calculator': {
    icon: 'lucide:calendar-days',
    fields: [{ key: 'dob', label: 'Date of birth', type: 'date', defaultValue: '2000-01-01' }],
    compute: (v) => {
      const d = new Date(v.dob ?? '');
      if (Number.isNaN(d.getTime())) return [{ label: 'Result', value: 'Enter valid DOB', highlight: true }];
      const diff = Math.max(0, Date.now() - d.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const months = Math.floor(days / 30.44);
      return [
        { label: 'Age in days', value: formatNumber(days), highlight: true },
        { label: 'Age in months', value: formatNumber(months) },
      ];
    },
  },
  'time-ago-calculator': {
    icon: 'lucide:history',
    fields: [{ key: 'date', label: 'Past date', type: 'date', defaultValue: '2024-01-01' }],
    compute: (v) => {
      const t = new Date(v.date ?? '').getTime();
      const diff = Math.max(0, Date.now() - t);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const years = Math.floor(days / 365);
      return [{ label: 'Time ago', value: years > 0 ? `${years} year(s), ${days % 365} day(s)` : `${days} day(s)`, highlight: true }];
    },
  },
  'next-birthday-countdown': {
    icon: 'lucide:cake',
    fields: [{ key: 'dob', label: 'DOB', type: 'date', defaultValue: '1995-06-10' }],
    compute: (v) => {
      const d = new Date(v.dob ?? '');
      if (Number.isNaN(d.getTime())) return [{ label: 'Countdown', value: 'Enter valid DOB', highlight: true }];
      const now = new Date();
      const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
      if (next < now) next.setFullYear(now.getFullYear() + 1);
      const days = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return [{ label: 'Days to next birthday', value: String(days), highlight: true }];
    },
  },
  'leap-year-checker': {
    icon: 'lucide:calendar',
    fields: [{ key: 'year', label: 'Year', type: 'number', defaultValue: '2028' }],
    compute: (v) => {
      const y = Math.floor(n(v.year));
      const leap = y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0);
      return [{ label: 'Leap year?', value: leap ? 'Yes' : 'No', highlight: true }];
    },
  },
  'work-hours-calculator': {
    icon: 'lucide:clock-4',
    fields: [
      { key: 'in', label: 'Start HH:MM (24h)', type: 'text', defaultValue: '09:30' },
      { key: 'out', label: 'End HH:MM (24h)', type: 'text', defaultValue: '18:30' },
      { key: 'break', label: 'Break minutes', type: 'number', defaultValue: '60' },
    ],
    compute: (v) => {
      const [h1, m1] = s(v.in).split(':').map((x) => +x);
      const [h2, m2] = s(v.out).split(':').map((x) => +x);
      const mins = (h2 * 60 + m2) - (h1 * 60 + m1) - n(v.break);
      return [{ label: 'Net work hours', value: `${(mins / 60).toFixed(2)} h`, highlight: true }];
    },
  },
  'sha256-generator': {
    icon: 'lucide:shield',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'hello world' }],
    compute: (v) => [{ label: 'SHA-256', value: 'Use built-in hash tools in browser crypto (custom UI planned)', highlight: true }, { label: 'Input', value: s(v.text) }],
  },
  'md5-hash-generator': {
    icon: 'lucide:key-round',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'hello world' }],
    compute: (v) => [{ label: 'MD5-like checksum', value: tinyHashMd5Like(s(v.text)), highlight: true }, { label: 'Note', value: 'This is a fast checksum placeholder, not cryptographic MD5.' }],
  },
  'password-strength-checker': {
    icon: 'lucide:lock',
    fields: [{ key: 'pw', label: 'Password', type: 'text', defaultValue: 'P@ssw0rd123' }],
    compute: (v) => {
      const pw = s(v.pw);
      let score = 0;
      if (pw.length >= 8) score += 1;
      if (/[A-Z]/.test(pw)) score += 1;
      if (/[a-z]/.test(pw)) score += 1;
      if (/[0-9]/.test(pw)) score += 1;
      if (/[^A-Za-z0-9]/.test(pw)) score += 1;
      const label = score >= 5 ? 'Very strong' : score >= 4 ? 'Strong' : score >= 3 ? 'Medium' : 'Weak';
      return [{ label: 'Strength', value: `${label} (${score}/5)`, highlight: true }];
    },
  },
  'url-slug-cleaner': {
    icon: 'lucide:link',
    fields: [{ key: 'text', label: 'Title / URL part', type: 'text', defaultValue: '  My New Blog Post!  ' }],
    compute: (v) => {
      const slug = s(v.text).toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      return [{ label: 'Clean slug', value: slug, highlight: true }];
    },
  },
  'rot13-encoder': {
    icon: 'lucide:rotate-cw',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'hello world' }],
    compute: (v) => {
      const out = (v.text ?? '').replace(/[a-zA-Z]/g, (c) => String.fromCharCode((c <= 'Z' ? 90 : 122) >= c.charCodeAt(0) + 13 ? c.charCodeAt(0) + 13 : c.charCodeAt(0) - 13));
      return [{ label: 'ROT13', value: out, highlight: true }];
    },
  },
  'image-compressor-canvas': {
    icon: 'lucide:image',
    fields: [{ key: 'note', label: 'Status', type: 'text', defaultValue: 'Upload UI coming next batch' }],
    compute: () => [{ label: 'Info', value: 'Frontend canvas compressor UI scaffold added in backlog.', highlight: true }],
  },
  'image-resizer': {
    icon: 'lucide:scaling',
    fields: [{ key: 'note', label: 'Status', type: 'text', defaultValue: 'Upload UI coming next batch' }],
    compute: () => [{ label: 'Info', value: 'Frontend image resizer UI scaffold added in backlog.', highlight: true }],
  },
  'jpg-to-png-converter': {
    icon: 'lucide:file-image',
    fields: [{ key: 'note', label: 'Status', type: 'text', defaultValue: 'Upload UI coming next batch' }],
    compute: () => [{ label: 'Info', value: 'JPG→PNG conversion requires upload canvas screen; queued.', highlight: true }],
  },
  'base64-image-converter': {
    icon: 'lucide:binary',
    fields: [{ key: 'note', label: 'Status', type: 'text', defaultValue: 'Upload UI coming next batch' }],
    compute: () => [{ label: 'Info', value: 'Image↔Base64 upload tooling queued for dedicated component.', highlight: true }],
  },
  'qr-code-generator': {
    icon: 'lucide:qr-code',
    fields: [{ key: 'text', label: 'Text / URL', type: 'text', defaultValue: 'https://webeze.in' }],
    compute: (v) => [{ label: 'QR payload', value: s(v.text), highlight: true }, { label: 'Info', value: 'Visual QR renderer will be added in dedicated component.' }],
  },
  'qr-code-scanner-upload': {
    icon: 'lucide:scan-line',
    fields: [{ key: 'note', label: 'Status', type: 'text', defaultValue: 'Upload scanner coming next batch' }],
    compute: () => [{ label: 'Info', value: 'Client-side QR decode from image upload planned in next batch.', highlight: true }],
  },
  'keyword-density-checker': {
    icon: 'lucide:search',
    fields: [
      { key: 'text', label: 'Content', type: 'textarea', defaultValue: 'SEO content content is important for content teams.' },
      { key: 'key', label: 'Keyword', type: 'text', defaultValue: 'content' },
    ],
    compute: (v) => {
      const text = s(v.text).toLowerCase();
      const key = s(v.key).toLowerCase();
      const words = text ? text.split(/\s+/) : [];
      const count = key ? (text.match(new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')) ?? []).length : 0;
      const pct = words.length ? (count / words.length) * 100 : 0;
      return [
        { label: 'Keyword density', value: `${pct.toFixed(2)}%`, highlight: true },
        { label: 'Occurrences', value: String(count) },
      ];
    },
  },
  'word-frequency-analyzer': {
    icon: 'lucide:bar-chart-3',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'one two two three three three' }],
    compute: (v) => {
      const freq = new Map<string, number>();
      for (const w of s(v.text).toLowerCase().split(/\W+/).filter(Boolean)) freq.set(w, (freq.get(w) ?? 0) + 1);
      const top = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([w, c]) => `${w}: ${c}`).join('\n');
      return [{ label: 'Top words', value: top || 'No words', highlight: true }];
    },
  },
  'sitemap-generator-static': {
    icon: 'lucide:network',
    fields: [{ key: 'urls', label: 'One URL per line', type: 'textarea', defaultValue: 'https://example.com/\nhttps://example.com/about' }],
    compute: (v) => {
      const urls = s(v.urls).split('\n').map((x) => x.trim()).filter(Boolean);
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>`;
      return [{ label: 'sitemap.xml', value: xml, highlight: true }];
    },
  },
  'robots-txt-generator': {
    icon: 'lucide:file-text',
    fields: [{ key: 'site', label: 'Site URL', type: 'text', defaultValue: 'https://example.com' }],
    compute: (v) => [{ label: 'robots.txt', value: `User-agent: *\nAllow: /\nSitemap: ${s(v.site).replace(/\/$/, '')}/sitemap.xml`, highlight: true }],
  },
  'canonical-tag-generator': {
    icon: 'lucide:link-2',
    fields: [{ key: 'url', label: 'Canonical URL', type: 'text', defaultValue: 'https://example.com/page' }],
    compute: (v) => [{ label: 'Canonical tag', value: `<link rel="canonical" href="${s(v.url)}" />`, highlight: true }],
  },
  'daily-goal-tracker-local': {
    icon: 'lucide:check-square',
    fields: [{ key: 'goal', label: 'Today goal', type: 'text', defaultValue: 'Ship 1 feature' }],
    compute: (v) => [{ label: 'Goal', value: s(v.goal), highlight: true }, { label: 'Note', value: 'LocalStorage UI can be added in a dedicated interactive component.' }],
  },
  'habit-streak-counter': {
    icon: 'lucide:flame',
    fields: [{ key: 'done', label: 'Consecutive days done', type: 'number', defaultValue: '7' }],
    compute: (v) => [{ label: 'Current streak', value: `${n(v.done)} day(s)`, highlight: true }],
  },
  'random-decision-maker': {
    icon: 'lucide:help-circle',
    fields: [{ key: 'q', label: 'Decision prompt', type: 'text', defaultValue: 'Should I ship this today?' }],
    compute: () => [{ label: 'Decision', value: Math.random() > 0.5 ? 'Yes' : 'No', highlight: true }],
  },
  'dice-roller': {
    icon: 'lucide:dice-5',
    fields: [{ key: 'count', label: 'Number of dice', type: 'number', defaultValue: '2' }],
    compute: (v) => {
      const c = Math.min(20, Math.max(1, n(v.count)));
      const rolls = Array.from({ length: c }, () => 1 + Math.floor(Math.random() * 6));
      return [{ label: 'Rolls', value: rolls.join(', '), highlight: true }, { label: 'Total', value: String(rolls.reduce((a, b) => a + b, 0)) }];
    },
  },
  'random-picker': {
    icon: 'lucide:list-checks',
    fields: [{ key: 'items', label: 'Items (one per line)', type: 'textarea', defaultValue: 'Alice\nBob\nCharlie' }],
    compute: (v) => {
      const items = s(v.items).split('\n').map((x) => x.trim()).filter(Boolean);
      const pick = items.length ? items[Math.floor(Math.random() * items.length)] : 'No items';
      return [{ label: 'Picked', value: pick, highlight: true }];
    },
  },
  'gradient-generator': {
    icon: 'lucide:palette',
    fields: [
      { key: 'c1', label: 'Color 1', type: 'text', defaultValue: '#6366f1' },
      { key: 'c2', label: 'Color 2', type: 'text', defaultValue: '#06b6d4' },
      { key: 'deg', label: 'Angle', type: 'number', defaultValue: '135' },
    ],
    compute: (v) => [{ label: 'CSS', value: `background: linear-gradient(${n(v.deg)}deg, ${s(v.c1)}, ${s(v.c2)});`, highlight: true }],
  },
  'box-shadow-generator': {
    icon: 'lucide:shadow',
    fields: [
      { key: 'x', label: 'X offset', type: 'number', defaultValue: '0' },
      { key: 'y', label: 'Y offset', type: 'number', defaultValue: '8' },
      { key: 'b', label: 'Blur', type: 'number', defaultValue: '24' },
      { key: 'a', label: 'Alpha 0-1', type: 'number', defaultValue: '0.2', step: 0.05 },
    ],
    compute: (v) => [{ label: 'CSS', value: `box-shadow: ${n(v.x)}px ${n(v.y)}px ${n(v.b)}px rgba(0,0,0,${n(v.a)});`, highlight: true }],
  },
  'css-border-radius-generator': {
    icon: 'lucide:square-round-corner',
    fields: [
      { key: 'tl', label: 'Top-left', type: 'number', defaultValue: '12' },
      { key: 'tr', label: 'Top-right', type: 'number', defaultValue: '12' },
      { key: 'br', label: 'Bottom-right', type: 'number', defaultValue: '12' },
      { key: 'bl', label: 'Bottom-left', type: 'number', defaultValue: '12' },
    ],
    compute: (v) => [{ label: 'CSS', value: `border-radius: ${n(v.tl)}px ${n(v.tr)}px ${n(v.br)}px ${n(v.bl)}px;`, highlight: true }],
  },
  'favicon-generator': {
    icon: 'lucide:image-plus',
    fields: [{ key: 'note', label: 'Status', type: 'text', defaultValue: 'Generator UI coming next batch' }],
    compute: () => [{ label: 'Info', value: 'Dedicated favicon image uploader + .ico export planned next.', highlight: true }],
  },
};
