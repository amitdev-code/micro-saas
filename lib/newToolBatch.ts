import { calculateEMI, calculateFD, calculateSIP, formatCurrency, formatNumber } from '@/lib/calculations';
import { formatINR, taxNewRegime, taxOldRegime } from '@/lib/indiaTax';

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

/** Stamp duty + registration (very rough; verify locally before transactions). */
const STAMP_RATES: Record<string, { stampPct: number; regPct: number; label: string }> = {
  maharashtra: { stampPct: 0.05, regPct: 0.01, label: 'Maharashtra' },
  karnataka: { stampPct: 0.05, regPct: 0.01, label: 'Karnataka' },
  'delhi': { stampPct: 0.06, regPct: 0.01, label: 'Delhi' },
  'up': { stampPct: 0.07, regPct: 0.01, label: 'Uttar Pradesh' },
  'telangana': { stampPct: 0.055, regPct: 0.01, label: 'Telangana' },
  'tamil-nadu': { stampPct: 0.11, regPct: 0.01, label: 'Tamil Nadu' },
  'gujarat': { stampPct: 0.049, regPct: 0.01, label: 'Gujarat' },
  'west-bengal': { stampPct: 0.06, regPct: 0.01, label: 'West Bengal' },
  'generic': { stampPct: 0.06, regPct: 0.01, label: 'Other (approx. 6% + 1% reg.)' },
};

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.';

const NUM = (v: string | undefined) => +((v ?? '').replace(/,/g, '')) || 0;

const STR = (v: string | undefined) => (v ?? '').trim();

function fancyStyles(input: string): { label: string; value: string; highlight?: boolean }[] {
  if (!input) return [{ label: 'Styled', value: 'Enter some text', highlight: true }];
  const bold = input
    .split('')
    .map((c) => {
      const u = c.codePointAt(0) ?? 0;
      if (c === ' ' || c === '\n') return c;
      if (u >= 65 && u <= 90) return String.fromCodePoint(0x1d5d4 + (u - 65)); // A-Z sans bold
      if (u >= 97 && u <= 122) return String.fromCodePoint(0x1d5ee + (u - 97)); // a-z
      return c;
    })
    .join('');
  const circled = input
    .toUpperCase()
    .split('')
    .map((c) => (c >= 'A' && c <= 'Z' ? String.fromCodePoint(0x24b6 + (c.charCodeAt(0) - 65)) : c))
    .join('');
  let full = input;
  try {
    full = input
      .split('')
      .map((c) => {
        if (c === ' ' || c === '\n') return c === ' ' ? '　' : c;
        const u = c.codePointAt(0) ?? 0;
        if (u >= 0x21 && u <= 0x7e) return String.fromCodePoint(0xfee0 + u);
        return c;
      })
      .join('');
  } catch {
    full = input;
  }
  return [
    { label: 'Unicode bold (A–Z / a–z)', value: bold, highlight: true },
    { label: 'Circled caps', value: circled },
    { label: 'Full width (basic Latin)', value: full },
  ];
}

function loremParagraphs(n: number): string {
  const p = LOREM;
  return Array.from({ length: Math.max(1, Math.min(50, n)) }, () => p).join('\n\n');
}

export const additionalToolDefinitions: Record<
  string,
  { icon: string; fields: ToolField[]; compute: (values: Record<string, string>) => ToolResult[] }
> = {
  'old-vs-new-tax-regime-calculator': {
    icon: 'lucide:scale',
    fields: [
      { key: 'gross', label: 'Annual gross salary (₹)', type: 'number', defaultValue: '1200000', prefix: '₹' },
      { key: 'std', label: 'Standard deduction (salaried)', type: 'number', defaultValue: '50000', prefix: '₹' },
      { key: 'ch6', label: 'Chapter VI-A (80C+80D+other, est.)', type: 'number', defaultValue: '150000', prefix: '₹' },
    ],
    compute: (v) => {
      const g = NUM(v.gross);
      const std = NUM(v.std);
      const ch = NUM(v.ch6);
      const oldTaxable = Math.max(0, g - std - ch);
      const newTaxable = g; // new regime: fewer deductions; illustrative compare on gross
      const oldT = taxOldRegime(oldTaxable);
      const newT = taxNewRegime(newTaxable);
      const best = oldT <= newT ? 'Old regime (lower here)' : 'New regime (lower here)';
      return [
        { label: 'Old regime tax (incl. cess, est.)', value: formatINR(Math.round(oldT)), highlight: true },
        { label: 'New regime tax (incl. cess, est.)', value: formatINR(Math.round(newT)) },
        { label: 'Old taxable (after std + Ch VI est.)', value: formatINR(Math.round(oldTaxable)) },
        { label: 'Simpler pick', value: best },
        { label: 'Note', value: 'Illustrative; real liability depends on regime items, HRA, etc.' },
      ];
    },
  },
  'take-home-salary-calculator-india': {
    icon: 'lucide:wallet',
    fields: [
      { key: 'ctc', label: 'Annual CTC (₹)', type: 'number', defaultValue: '1200000', prefix: '₹' },
      { key: 'bonus', label: 'Annual bonus (₹)', type: 'number', defaultValue: '100000', prefix: '₹' },
      { key: 'epf', label: 'Your EPF (employee) per year (₹)', type: 'number', defaultValue: '72000', prefix: '₹' },
      { key: 'tax', label: 'Income tax TDS (annual, ₹)', type: 'number', defaultValue: '80000', prefix: '₹' },
      { key: 'other', label: 'Other annual deductions (₹)', type: 'number', defaultValue: '12000', prefix: '₹' },
    ],
    compute: (v) => {
      const ctc = NUM(v.ctc) + NUM(v.bonus);
      const take = ctc - NUM(v.epf) - NUM(v.tax) - NUM(v.other);
      const m = take / 12;
      return [
        { label: 'Annual in-hand (est.)', value: formatCurrency(take), highlight: true },
        { label: 'Monthly in-hand (÷12)', value: formatCurrency(m) },
        { label: 'Total deductions', value: formatCurrency(NUM(v.epf) + NUM(v.tax) + NUM(v.other)) },
      ];
    },
  },
  'epf-calculator': {
    icon: 'lucide:landmark',
    fields: [
      { key: 'basic', label: 'Basic + DA (monthly, ₹)', type: 'number', defaultValue: '30000', prefix: '₹' },
      { key: 'years', label: 'Years', type: 'number', defaultValue: '20' },
      { key: 'rate', label: 'Annual interest (%)', type: 'number', defaultValue: '8.25', suffix: '%' },
    ],
    compute: (v) => {
      const b = NUM(v.basic);
      const y = Math.min(50, Math.max(0, NUM(v.years)));
      const r = (NUM(v.rate) / 100) / 12;
      const cap = 15000;
      const wage = Math.min(cap, b);
      const epm = wage * 0.12; // employee
      const erm = Math.min(wage, b) * 0.12; // employer; simplified
      let bal = 0;
      for (let m = 0; m < y * 12; m += 1) {
        const contrib = epm + erm;
        bal = (bal + contrib) * (1 + r);
      }
      const pr = epm * 12 * y;
      return [
        { label: 'EPF balance (simplified, est.)', value: formatCurrency(bal), highlight: true },
        { label: 'Employee contribution (total)', value: formatCurrency(pr) },
        { label: 'Interest vs principal (approx.)', value: formatCurrency(Math.max(0, bal - pr * 0.5)) },
      ];
    },
  },
  'esic-calculator': {
    icon: 'lucide:heart-pulse',
    fields: [{ key: 'gross', label: 'Monthly gross (₹)', type: 'number', defaultValue: '20000', prefix: '₹' }],
    compute: (v) => {
      const g = NUM(v.gross);
      if (g > 21000) {
        return [
          { label: 'ESIC', value: 'Not applicable (gross above ₹21,000/mo ceiling)', highlight: true },
        ];
      }
      const e = (g * 0.75) / 100;
      const r = (g * 3.25) / 100;
      return [
        { label: 'Employee contribution (0.75%)', value: formatCurrency(e), highlight: true },
        { label: 'Employer contribution (3.25%)', value: formatCurrency(r) },
        { label: 'Total (both)', value: formatCurrency(e + r) },
      ];
    },
  },
  'leave-encashment-calculator': {
    icon: 'lucide:calendar-x',
    fields: [
      { key: 'basic', label: 'Basic + DA (monthly, ₹)', type: 'number', defaultValue: '50000', prefix: '₹' },
      { key: 'days', label: 'Encashment days', type: 'number', defaultValue: '15' },
    ],
    compute: (v) => {
      const daily = (NUM(v.basic) * 12) / 365;
      const amt = daily * NUM(v.days);
      return [
        { label: 'Encashment (basic/365×days, est.)', value: formatCurrency(amt), highlight: true },
        { label: 'Per-day rate', value: formatCurrency(daily) },
        { label: 'Note', value: 'Employer rules, tax, and 26/30 day bases vary.' },
      ];
    },
  },
  'overtime-pay-calculator': {
    icon: 'lucide:clock',
    fields: [
      { key: 'hr', label: 'Hourly wage (₹)', type: 'number', defaultValue: '200', prefix: '₹' },
      { key: 'ot', label: 'Overtime hours', type: 'number', defaultValue: '10' },
      { key: 'mult', label: 'Multiplier (e.g. 2 = double)', type: 'number', defaultValue: '2' },
    ],
    compute: (v) => {
      const pay = NUM(v.hr) * NUM(v.ot) * NUM(v.mult);
      return [{ label: 'Overtime pay', value: formatCurrency(pay), highlight: true }];
    },
  },
  'salary-hike-calculator': {
    icon: 'lucide:trending-up',
    fields: [
      { key: 'cur', label: 'Current annual salary (₹)', type: 'number', defaultValue: '800000', prefix: '₹' },
      { key: 'hike', label: 'Hike (%)', type: 'number', defaultValue: '15', suffix: '%' },
      {
        key: 'view',
        label: 'View',
        type: 'select',
        defaultValue: 'yearly',
        options: [
          { label: 'Yearly', value: 'yearly' },
          { label: 'Monthly', value: 'monthly' },
        ],
      },
    ],
    compute: (v) => {
      const c = NUM(v.cur);
      const h = (NUM(v.hike) / 100) * c;
      const n = c + h;
      if (v.view === 'monthly') {
        return [
          { label: 'New monthly (approx.)', value: formatCurrency(n / 12), highlight: true },
          { label: 'Raise per month', value: formatCurrency(h / 12) },
        ];
      }
      return [
        { label: 'New annual', value: formatCurrency(n), highlight: true },
        { label: 'Raise amount', value: formatCurrency(h) },
      ];
    },
  },
  'bonus-calculator': {
    icon: 'lucide:gift',
    fields: [
      { key: 'sal', label: 'Salary (annual, ₹)', type: 'number', defaultValue: '1000000', prefix: '₹' },
      { key: 'pct', label: 'Bonus (%)', type: 'number', defaultValue: '20', suffix: '%' },
    ],
    compute: (v) => {
      const b = (NUM(v.pct) / 100) * NUM(v.sal);
      return [
        { label: 'Bonus', value: formatCurrency(b), highlight: true },
        { label: 'Total comp (sal + bonus)', value: formatCurrency(NUM(v.sal) + b) },
      ];
    },
  },
  'rent-vs-buy-calculator': {
    icon: 'lucide:home',
    fields: [
      { key: 'rent', label: 'Monthly rent (₹)', type: 'number', defaultValue: '25000', prefix: '₹' },
      { key: 'price', label: 'Home price (₹)', type: 'number', defaultValue: '8000000', prefix: '₹' },
      { key: 'down', label: 'Down payment (₹)', type: 'number', defaultValue: '2000000', prefix: '₹' },
      { key: 'rate', label: 'Loan interest (% p.a.)', type: 'number', defaultValue: '8.5', suffix: '%' },
      { key: 'years', label: 'Loan tenure (years)', type: 'number', defaultValue: '20' },
    ],
    compute: (v) => {
      const y = Math.max(1, NUM(v.years));
      const months = y * 12;
      const loan = Math.max(0, NUM(v.price) - NUM(v.down));
      const emi = loan > 0 ? calculateEMI(loan, NUM(v.rate), months).emi : 0;
      const buyOutflow = emi * months + NUM(v.down);
      const rentOutflow = NUM(v.rent) * 12 * y;
      const rec = buyOutflow < rentOutflow ? 'Lower cash outflow: buying (this model)' : 'Lower cash outflow: renting (this model)';
      return [
        { label: '20y rent paid (if unchanged)', value: formatCurrency(rentOutflow), highlight: true },
        { label: 'EMI + down (simplified home cost)', value: formatCurrency(buyOutflow) },
        { label: 'Monthly EMI (est.)', value: formatCurrency(emi) },
        { label: 'Illustration', value: rec },
        { label: 'Note', value: 'Ignores property appreciation, tax benefit, repair costs.' },
      ];
    },
  },
  'home-loan-affordability-calculator': {
    icon: 'lucide:banknote',
    fields: [
      { key: 'income', label: 'Net monthly income (₹)', type: 'number', defaultValue: '100000', prefix: '₹' },
      { key: 'exp', label: 'Other monthly obligations (₹)', type: 'number', defaultValue: '15000', prefix: '₹' },
      { key: 'rate', label: 'Interest % p.a.', type: 'number', defaultValue: '8.5', suffix: '%' },
      { key: 'y', label: 'Tenure (years)', type: 'number', defaultValue: '20' },
    ],
    compute: (v) => {
      const e = Math.max(0, NUM(v.income) * 0.4 - NUM(v.exp));
      const m = +v.y * 12;
      const r = (NUM(v.rate) / 12) / 100;
      const p = r > 0 ? (e * (1 - Math.pow(1 + r, -m))) / r : e * m;
      return [
        { label: 'Max affordable EMI (40% net − obligations, est.)', value: formatCurrency(e), highlight: true },
        { label: 'Approx. max loan', value: formatCurrency(p) },
      ];
    },
  },
  'stamp-duty-calculator': {
    icon: 'lucide:file-signature',
    fields: [
      { key: 'val', label: 'Property value (₹)', type: 'number', defaultValue: '10000000', prefix: '₹' },
      {
        key: 'state',
        label: 'State (approx. rates)',
        type: 'select',
        defaultValue: 'karnataka',
        options: Object.entries(STAMP_RATES).map(([k, x]) => ({ value: k, label: x.label })),
      },
    ],
    compute: (v) => {
      const p = STAMP_RATES[v.state] ?? STAMP_RATES.generic!;
      const v0 = NUM(v.val);
      const s = v0 * p.stampPct;
      const reg = v0 * p.regPct;
      return [
        { label: 'Stamp duty (approx.)', value: formatCurrency(s), highlight: true },
        { label: 'Registration (approx.)', value: formatCurrency(reg) },
        { label: 'Total', value: formatCurrency(s + reg) },
        { label: 'Disclaimer', value: 'Rates vary; verify with your state e-registration portal.' },
      ];
    },
  },
  'paint-cost-calculator': {
    icon: 'lucide:brush',
    fields: [
      { key: 'area', label: 'Wall area (sq ft)', type: 'number', defaultValue: '1200' },
      { key: 'rate', label: 'Paint+labour (₹/sq ft)', type: 'number', defaultValue: '15', prefix: '₹' },
    ],
    compute: (v) => {
      const t = NUM(v.area) * NUM(v.rate);
      return [{ label: 'Estimated total', value: formatCurrency(t), highlight: true }];
    },
  },
  'sip-vs-fd-calculator': {
    icon: 'lucide:git-compare',
    fields: [
      { key: 'amt', label: 'Monthly investment / lump for FD (₹)', type: 'number', defaultValue: '10000', prefix: '₹' },
      { key: 'y', label: 'Years', type: 'number', defaultValue: '10' },
      { key: 'sipR', label: 'SIP return (% p.a.)', type: 'number', defaultValue: '12', suffix: '%' },
      { key: 'fdR', label: 'FD return (% p.a.)', type: 'number', defaultValue: '7', suffix: '%' },
    ],
    compute: (v) => {
      const a = NUM(v.amt);
      const y = NUM(v.y);
      const sip = calculateSIP(a, NUM(v.sipR), y);
      const l = a * 12 * y; // for FD, treat monthly sum as not ideal—compare SIP vs FD with same **monthly** amount banked in FD as recurring - simplified: lump a*y*12 in FD
      const fd = calculateFD(a * 12 * y, NUM(v.fdR), y, 4);
      return [
        { label: 'SIP future value (est.)', value: formatCurrency(sip.futureValue), highlight: true },
        { label: 'FD (lump = monthly×12×y at start)', value: formatCurrency(fd.maturityAmount) },
        { label: 'SIP total invested', value: formatCurrency(sip.totalInvestment) },
      ];
    },
  },
  'lump-sum-vs-sip-calculator': {
    icon: 'lucide:split',
    fields: [
      { key: 'lump', label: 'Lump sum (₹)', type: 'number', defaultValue: '500000', prefix: '₹' },
      { key: 'm', label: 'SIP (monthly, ₹)', type: 'number', defaultValue: '10000', prefix: '₹' },
      { key: 'y', label: 'Years', type: 'number', defaultValue: '10' },
      { key: 'r', label: 'Return % p.a.', type: 'number', defaultValue: '12', suffix: '%' },
    ],
    compute: (v) => {
      const r = (NUM(v.r) / 100) as number;
      const y = NUM(v.y);
      const l = calculateFD(NUM(v.lump), r * 100, y, 1);
      const s = calculateSIP(NUM(v.m), r * 100, y);
      return [
        { label: 'Lump FV (annual compound)', value: formatCurrency(l.maturityAmount), highlight: true },
        { label: 'SIP FV (same years)', value: formatCurrency(s.futureValue) },
        { label: 'SIP total invested', value: formatCurrency(s.totalInvestment) },
      ];
    },
  },
  'emi-vs-rent-calculator': {
    icon: 'lucide:scale',
    fields: [
      { key: 'emi', label: 'Monthly EMI (₹)', type: 'number', defaultValue: '40000', prefix: '₹' },
      { key: 'rent', label: 'Monthly rent (₹)', type: 'number', defaultValue: '25000', prefix: '₹' },
    ],
    compute: (v) => {
      const d = (NUM(v.emi) - NUM(v.rent)) * 12;
      return [
        { label: 'Annual diff (EMI − rent)', value: formatCurrency(d), highlight: true },
        { label: 'If EMI higher', value: d > 0 ? 'EMI costs more per year' : 'Rent costs more (or same)' },
      ];
    },
  },
  'marks-percentage-calculator': {
    icon: 'lucide:graduation-cap',
    fields: [{ key: 'lines', label: 'Marks per line (e.g. 18/20 or 18)', type: 'textarea', defaultValue: '18/20\n16/20\n20/20' }],
    compute: (v) => {
      const lines = STR(v.lines)
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      let o = 0;
      let m = 0;
      for (const l of lines) {
        if (l.includes('/')) {
          const [a, b] = l.split('/').map((x) => +x);
          o += a || 0;
          m += b || 0;
        } else o += +l || 0;
      }
      const pct = m > 0 ? ((o / m) * 100).toFixed(2) : '0';
      return [
        { label: 'Obtained / Total', value: `${o} / ${m || '—'}` },
        { label: 'Percentage', value: `${pct}%`, highlight: true },
      ];
    },
  },
  'marks-needed-calculator': {
    icon: 'lucide:target',
    fields: [
      { key: 'obt', label: 'Marks obtained so far', type: 'number', defaultValue: '120' },
      { key: 'maxT', label: 'Total maximum marks (course)', type: 'number', defaultValue: '200' },
      { key: 'rem', label: 'Remaining max marks in finals', type: 'number', defaultValue: '100' },
      { key: 'tgt', label: 'Target %', type: 'number', defaultValue: '75', suffix: '%' },
    ],
    compute: (v) => {
      const need = (NUM(v.tgt) / 100) * NUM(v.maxT) - NUM(v.obt);
      const needClamped = Math.max(0, need);
      const p = `Need ${formatNumber(needClamped)} of ${NUM(v.rem)} in remaining.`;
      return [
        { label: 'Marks needed (course-wide)', value: formatNumber(need), highlight: true },
        { label: 'Check', value: need > NUM(v.rem) ? 'Target not reachable with this remaining max' : p },
      ];
    },
  },
  'attendance-calculator': {
    icon: 'lucide:user-check',
    fields: [
      { key: 'a', label: 'Classes attended', type: 'number', defaultValue: '42' },
      { key: 't', label: 'Total so far', type: 'number', defaultValue: '50' },
      { key: 'tgt', label: 'Target %', type: 'number', defaultValue: '75', suffix: '%' },
    ],
    compute: (v) => {
      const a = NUM(v.a);
      const tot = Math.max(1, NUM(v.t));
      const p = (a / tot) * 100;
      const T = Math.min(99.9, Math.max(0, NUM(v.tgt)));
      const x = (T * tot - 100 * a) / (100 - T);
      return [
        { label: 'Current %', value: `${p.toFixed(2)}%`, highlight: true },
        {
          label: 'Extra 100% attended classes to hit target',
          value: T >= 100 || T <= p || x <= 0 ? (T <= p ? 'Target already met' : 'N/A') : formatNumber(Math.ceil(x)),
        },
      ];
    },
  },
  'study-planner': {
    icon: 'lucide:book-open',
    fields: [
      { key: 'sub', label: 'Subjects (one per line)', type: 'textarea', defaultValue: 'Math\nPhysics\nChemistry' },
      { key: 'd', label: 'Days until exam', type: 'number', defaultValue: '30' },
    ],
    compute: (v) => {
      const subs = STR(v.sub)
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const n = subs.length || 1;
      const day = Math.max(1, Math.floor(NUM(v.d) / n));
      const lines = subs.map((s, i) => `${i + 1}. ${s} — plan ~${day} day(s) block (rotate)`).join('\n');
      return [
        { label: 'Rough rotation', value: lines, highlight: true },
        { label: 'Subjects', value: String(n) },
      ];
    },
  },
  'fancy-text-generator': {
    icon: 'lucide:sparkles',
    fields: [{ key: 't', label: 'Text', type: 'text', defaultValue: 'Webeze' }],
    compute: (v) => fancyStyles(STR(v.t)),
  },
  'remove-line-breaks-tool': {
    icon: 'lucide:wrap-text',
    fields: [{ key: 't', label: 'Text', type: 'textarea', defaultValue: 'Line1\n\nLine2' }],
    compute: (v) => [
      { label: 'One line', value: STR(v.t).replace(/\s+/g, ' ').trim(), highlight: true },
    ],
  },
  'add-line-numbers': {
    icon: 'lucide:list-ordered',
    fields: [{ key: 't', label: 'Text', type: 'textarea', defaultValue: 'first\nsecond' }],
    compute: (v) => [
      {
        label: 'Numbered',
        value: STR(v.t)
          .split('\n')
          .map((l, i) => `${i + 1}. ${l}`)
          .join('\n'),
        highlight: true,
      },
    ],
  },
  'sentence-case-converter': {
    icon: 'lucide:case-sensitive',
    fields: [{ key: 't', label: 'Text', type: 'textarea', defaultValue: 'hELLO wORLD. tEST' }],
    compute: (v) => {
      const s = STR(v.t).toLowerCase();
      const out = s.replace(/(^\s*\w)|([.!?]\s+\w)/g, (a) => a.toUpperCase());
      return [{ label: 'Sentence case', value: out, highlight: true }];
    },
  },
  'youtube-title-generator': {
    icon: 'lucide:tv',
    fields: [{ key: 'topic', label: 'Topic / keyword', type: 'text', defaultValue: 'SIP investment tips' }],
    compute: (v) => {
      const t = STR(v.topic) || 'Your topic';
      return [
        { label: 'Idea 1', value: `${t} (explained in 5 minutes)` },
        { label: 'Idea 2', value: `The truth about ${t} — for beginners` },
        { label: 'Idea 3', value: `${t} | India 2025 | Full guide` },
        { label: 'Idea 4', value: `Stop doing THIS with ${t}` },
        { label: 'Idea 5', value: `Why ${t} matters in 2025` },
      ];
    },
  },
  'youtube-tags-generator': {
    icon: 'lucide:tags',
    fields: [{ key: 'topic', label: 'Topic', type: 'text', defaultValue: 'EMI calculator' }],
    compute: (v) => {
      const t = STR(v.topic).replace(/\s+/g, ' ').toLowerCase() || 'topic';
      return [
        { label: 'Tags (copy)', value: `${t}, ${t} india, ${t} 2025, webeze, tutorial, how to, hindi, english, finance`, highlight: true },
      ];
    },
  },
  'color-converter-hex-rgb': {
    icon: 'lucide:palette',
    fields: [{ key: 'c', label: 'HEX or rgb(r,g,b)', type: 'text', defaultValue: '#3B82F6' }],
    compute: (v) => {
      const s = STR(v.c);
      let h = s.replace(/^#/, '');
      if (h.length === 3) h = h.split('').map((x) => x + x).join('');
      if (/^[0-9a-fA-F]{6}$/.test(h)) {
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return [
          { label: 'RGB', value: `rgb(${r}, ${g}, ${b})`, highlight: true },
          { label: 'HEX', value: `#${h.toLowerCase()}` },
        ];
      }
      const m = s.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
      if (m) {
        const r = +m[1]!;
        const g = +m[2]!;
        const b = +m[3]!;
        const to = (n: number) => n.toString(16).padStart(2, '0');
        return [{ label: 'HEX', value: `#${to(r)}${to(g)}${to(b)}`, highlight: true }, { label: 'RGB', value: s }];
      }
      return [{ label: 'Error', value: 'Enter #RRGGBB or rgb(r,g,b)' }];
    },
  },
  'lorem-ipsum-generator': {
    icon: 'lucide:file-text',
    fields: [{ key: 'n', label: 'Paragraphs', type: 'number', defaultValue: '3' }],
    compute: (v) => [
      { label: 'Lorem', value: loremParagraphs(NUM(v.n)), highlight: true },
    ],
  },
  'meta-tag-generator': {
    icon: 'lucide:code',
    fields: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: 'Webeze — Free online tools' },
      { key: 'desc', label: 'Description', type: 'textarea', defaultValue: 'Calculators, converters, and utilities. Fast and free.' },
    ],
    compute: (v) => {
      const t = STR(v.title).replace(/</g, '');
      const d = STR(v.desc).replace(/</g, '');
      return [
        {
          label: 'HTML',
          value: `<title>${t}</title>\n<meta name="description" content="${d}">\n<meta name="robots" content="index, follow">`,
          highlight: true,
        },
      ];
    },
  },
  'open-graph-preview-tool': {
    icon: 'lucide:share-2',
    fields: [
      { key: 't', label: 'Title', type: 'text', defaultValue: 'Webeze' },
      { key: 'd', label: 'Description', type: 'textarea', defaultValue: 'Free online calculators' },
    ],
    compute: (v) => [
      { label: 'og:title', value: STR(v.t) },
      { label: 'og:description', value: STR(v.d) },
      {
        label: 'Snippet (paste into head)',
        value: `<meta property="og:title" content="${STR(v.t)}" />\n<meta property="og:description" content="${STR(v.d)}" />`,
        highlight: true,
      },
    ],
  },
  'emoji-picker-tool': {
    icon: 'lucide:smile',
    fields: [{ key: 'q', label: 'Search (optional)', type: 'text', defaultValue: 'star' }],
    compute: (v) => {
      const q = STR(v.q).toLowerCase();
      const pool = ['⭐', '✨', '🔥', '💡', '✅', '❤️', '🎉', '📱', '💻', '🇮🇳', '🧮', '📈'];
      return [{ label: 'Pick / copy from list', value: pool.join(' '), highlight: true }, { label: 'Search', value: q || '—' }];
    },
  },
};
