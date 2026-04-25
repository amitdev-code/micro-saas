import { formatNumber } from '@/lib/calculations';

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

function words(text: string) {
  return text.toLowerCase().split(/\W+/).filter(Boolean);
}

function ratioReduce(a: number, b: number) {
  const g = gcd(a, b) || 1;
  return [a / g, b / g];
}

function gradeFromPct(p: number) {
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B';
  if (p >= 60) return 'C';
  if (p >= 50) return 'D';
  return 'F';
}

function pctFromGrade(g: string) {
  const map: Record<string, string> = { 'A+': '90-100', A: '80-89', B: '70-79', C: '60-69', D: '50-59', F: '<50' };
  return map[g.toUpperCase()] ?? 'Unknown';
}

function shuffled<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const studentToolDefinitions: Record<
  string,
  { icon: string; fields: ToolField[]; compute: (values: Record<string, string>) => ToolResult[] }
> = {
  'algebra-equation-solver': {
    icon: 'lucide:sigma',
    fields: [{ key: 'eq', label: 'Equation ax+b=c', type: 'text', defaultValue: '2x+3=11' }],
    compute: (v) => {
      const m = s(v.eq).replace(/\s+/g, '').match(/^([+-]?\d*)x([+-]\d+)?=([+-]?\d+)$/i);
      if (!m) return [{ label: 'Result', value: 'Enter like 2x+3=11', highlight: true }];
      const a = m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : +m[1];
      const b = m[2] ? +m[2] : 0;
      const c = +m[3];
      const x = (c - b) / a;
      return [
        { label: 'x', value: String(x), highlight: true },
        { label: 'Steps', value: `${a}x + (${b}) = ${c}\n${a}x = ${c - b}\nx = (${c - b})/${a}` },
      ];
    },
  },
  'quadratic-equation-solver-steps': {
    icon: 'lucide:function-square',
    fields: [
      { key: 'a', label: 'a', type: 'number', defaultValue: '1' },
      { key: 'b', label: 'b', type: 'number', defaultValue: '-5' },
      { key: 'c', label: 'c', type: 'number', defaultValue: '6' },
    ],
    compute: (v) => {
      const a = n(v.a), b = n(v.b), c = n(v.c);
      const d = b * b - 4 * a * c;
      if (!a) return [{ label: 'Error', value: 'a cannot be 0', highlight: true }];
      if (d < 0) return [{ label: 'Roots', value: 'Complex roots', highlight: true }, { label: 'Steps', value: `D=b²-4ac=${d}` }];
      const r1 = (-b + Math.sqrt(d)) / (2 * a);
      const r2 = (-b - Math.sqrt(d)) / (2 * a);
      return [
        { label: 'Root 1', value: r1.toFixed(4), highlight: true },
        { label: 'Root 2', value: r2.toFixed(4) },
        { label: 'Steps', value: `D=b²-4ac=${d}\nx=(-b±√D)/2a` },
      ];
    },
  },
  'percentage-word-problem-solver': {
    icon: 'lucide:message-circle-question',
    fields: [
      { key: 'part', label: 'Part value', type: 'number', defaultValue: '45' },
      { key: 'whole', label: 'Whole value', type: 'number', defaultValue: '60' },
    ],
    compute: (v) => {
      const p = n(v.part), w = Math.max(1, n(v.whole));
      const pct = (p / w) * 100;
      return [{ label: 'Answer', value: `${pct.toFixed(2)}%`, highlight: true }, { label: 'Explanation', value: `Percentage = (part/whole)×100 = (${p}/${w})×100` }];
    },
  },
  'ratio-simplifier': {
    icon: 'lucide:scaling',
    fields: [{ key: 'ratio', label: 'Ratio a:b', type: 'text', defaultValue: '24:36' }],
    compute: (v) => {
      const [a, b] = s(v.ratio).split(':').map((x) => +x);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return [{ label: 'Error', value: 'Use a:b format', highlight: true }];
      const [x, y] = ratioReduce(a, b);
      return [{ label: 'Simplified ratio', value: `${x}:${y}`, highlight: true }];
    },
  },
  'fraction-simplifier': {
    icon: 'lucide:divide',
    fields: [{ key: 'frac', label: 'Fraction a/b', type: 'text', defaultValue: '42/56' }],
    compute: (v) => {
      const [a, b] = s(v.frac).split('/').map((x) => +x);
      if (!b) return [{ label: 'Error', value: 'Invalid fraction', highlight: true }];
      const g = gcd(a, b);
      return [{ label: 'Reduced fraction', value: `${a / g}/${b / g}`, highlight: true }];
    },
  },
  'fraction-to-decimal-converter': {
    icon: 'lucide:arrow-right-left',
    fields: [{ key: 'frac', label: 'Fraction a/b', type: 'text', defaultValue: '3/8' }],
    compute: (v) => {
      const [a, b] = s(v.frac).split('/').map((x) => +x);
      return [{ label: 'Decimal', value: b ? (a / b).toString() : 'Invalid', highlight: true }];
    },
  },
  'decimal-to-fraction-converter': {
    icon: 'lucide:arrow-right-left',
    fields: [{ key: 'dec', label: 'Decimal', type: 'text', defaultValue: '0.625' }],
    compute: (v) => {
      const x = Number(s(v.dec));
      if (!Number.isFinite(x)) return [{ label: 'Fraction', value: 'Invalid decimal', highlight: true }];
      const str = s(v.dec);
      const places = (str.split('.')[1] ?? '').length;
      const den = Math.pow(10, places);
      const num = Math.round(x * den);
      const g = gcd(num, den);
      return [{ label: 'Fraction', value: `${num / g}/${den / g}`, highlight: true }];
    },
  },
  'square-root-calculator-steps': {
    icon: 'lucide:radical',
    fields: [{ key: 'x', label: 'Number', type: 'number', defaultValue: '144' }],
    compute: (v) => {
      const x = n(v.x);
      return [{ label: 'Square root', value: x >= 0 ? Math.sqrt(x).toString() : 'NaN', highlight: true }, { label: 'Step', value: `Find number y where y²=${x}` }];
    },
  },
  'cube-root-calculator': {
    icon: 'lucide:box',
    fields: [{ key: 'x', label: 'Number', type: 'number', defaultValue: '27' }],
    compute: (v) => [{ label: 'Cube root', value: Math.cbrt(n(v.x)).toString(), highlight: true }],
  },
  'power-calculator': {
    icon: 'lucide:superscript',
    fields: [{ key: 'x', label: 'Base x', type: 'number', defaultValue: '2' }, { key: 'y', label: 'Power y', type: 'number', defaultValue: '10' }],
    compute: (v) => [{ label: 'x^y', value: Math.pow(n(v.x), n(v.y)).toString(), highlight: true }],
  },
  'triangle-solver-basic': {
    icon: 'lucide:triangle',
    fields: [{ key: 'a', label: 'Side a', type: 'number', defaultValue: '3' }, { key: 'b', label: 'Side b', type: 'number', defaultValue: '4' }, { key: 'c', label: 'Side c', type: 'number', defaultValue: '5' }],
    compute: (v) => {
      const a = n(v.a), b = n(v.b), c = n(v.c);
      const p = a + b + c;
      const s2 = p / 2;
      const area = Math.sqrt(Math.max(0, s2 * (s2 - a) * (s2 - b) * (s2 - c)));
      return [{ label: 'Perimeter', value: p.toString(), highlight: true }, { label: 'Area (Heron)', value: area.toFixed(4) }];
    },
  },
  'circle-calculator': {
    icon: 'lucide:circle',
    fields: [{ key: 'r', label: 'Radius', type: 'number', defaultValue: '7' }],
    compute: (v) => {
      const r = n(v.r);
      return [{ label: 'Area', value: (Math.PI * r * r).toFixed(4), highlight: true }, { label: 'Circumference', value: (2 * Math.PI * r).toFixed(4) }];
    },
  },
  'area-calculator-multi-shapes': {
    icon: 'lucide:shapes',
    fields: [{ key: 'shape', label: 'Shape', type: 'select', defaultValue: 'rectangle', options: [{ label: 'Rectangle (l×w)', value: 'rectangle' }, { label: 'Triangle (1/2 bh)', value: 'triangle' }, { label: 'Circle (πr²)', value: 'circle' }] }, { key: 'x', label: 'Value 1', type: 'number', defaultValue: '10' }, { key: 'y', label: 'Value 2', type: 'number', defaultValue: '5' }],
    compute: (v) => {
      const x = n(v.x), y = n(v.y);
      const area = v.shape === 'triangle' ? 0.5 * x * y : v.shape === 'circle' ? Math.PI * x * x : x * y;
      return [{ label: 'Area', value: area.toFixed(4), highlight: true }];
    },
  },
  'volume-calculator-3d-shapes': {
    icon: 'lucide:cuboid',
    fields: [{ key: 'shape', label: 'Shape', type: 'select', defaultValue: 'cuboid', options: [{ label: 'Cuboid (l×w×h)', value: 'cuboid' }, { label: 'Cylinder (πr²h)', value: 'cylinder' }, { label: 'Sphere (4/3 πr³)', value: 'sphere' }] }, { key: 'a', label: 'a/r', type: 'number', defaultValue: '3' }, { key: 'b', label: 'b/h', type: 'number', defaultValue: '4' }, { key: 'c', label: 'c (cuboid only)', type: 'number', defaultValue: '5' }],
    compute: (v) => {
      const a = n(v.a), b = n(v.b), c = n(v.c);
      const vol = v.shape === 'sphere' ? (4 / 3) * Math.PI * Math.pow(a, 3) : v.shape === 'cylinder' ? Math.PI * a * a * b : a * b * c;
      return [{ label: 'Volume', value: vol.toFixed(4), highlight: true }];
    },
  },
  'pythagorean-theorem-solver': {
    icon: 'lucide:triangle-right',
    fields: [{ key: 'a', label: 'a', type: 'number', defaultValue: '3' }, { key: 'b', label: 'b', type: 'number', defaultValue: '4' }],
    compute: (v) => {
      const a = n(v.a), b = n(v.b), c = Math.sqrt(a * a + b * b);
      return [{ label: 'Hypotenuse c', value: c.toFixed(4), highlight: true }, { label: 'Step', value: `c²=a²+b²=${a * a}+${b * b}` }];
    },
  },
  'angle-converter-deg-rad': {
    icon: 'lucide:rotate-3d',
    fields: [{ key: 'deg', label: 'Degrees', type: 'number', defaultValue: '180' }],
    compute: (v) => {
      const d = n(v.deg);
      return [{ label: 'Radians', value: (d * Math.PI / 180).toFixed(6), highlight: true }, { label: 'Back to degrees', value: ((d * Math.PI / 180) * 180 / Math.PI).toFixed(2) }];
    },
  },
  'multiplication-table-generator': {
    icon: 'lucide:grid-2x2',
    fields: [{ key: 'n', label: 'Table of', type: 'number', defaultValue: '17' }, { key: 'till', label: 'Till', type: 'number', defaultValue: '20' }],
    compute: (v) => {
      const x = n(v.n), till = Math.max(1, Math.min(100, n(v.till)));
      const out = Array.from({ length: till }, (_, i) => `${x} × ${i + 1} = ${x * (i + 1)}`).join('\n');
      return [{ label: 'Table', value: out, highlight: true }];
    },
  },
  'random-math-quiz-generator': {
    icon: 'lucide:brain',
    fields: [{ key: 'count', label: 'Questions', type: 'number', defaultValue: '5' }],
    compute: (v) => {
      const count = Math.max(1, Math.min(30, n(v.count)));
      const q = Array.from({ length: count }, () => {
        const a = 1 + Math.floor(Math.random() * 20);
        const b = 1 + Math.floor(Math.random() * 20);
        const op = ['+', '-', '×'][Math.floor(Math.random() * 3)]!;
        return `${a} ${op} ${b} = ?`;
      }).join('\n');
      return [{ label: 'Practice questions', value: q, highlight: true }];
    },
  },
  'mental-math-trainer': {
    icon: 'lucide:zap',
    fields: [{ key: 'level', label: 'Level', type: 'select', defaultValue: 'easy', options: [{ label: 'Easy', value: 'easy' }, { label: 'Medium', value: 'med' }, { label: 'Hard', value: 'hard' }] }],
    compute: (v) => {
      const max = v.level === 'hard' ? 999 : v.level === 'med' ? 99 : 20;
      const a = 1 + Math.floor(Math.random() * max);
      const b = 1 + Math.floor(Math.random() * max);
      return [{ label: 'Question', value: `${a} + ${b} = ?`, highlight: true }, { label: 'Practice more', value: 'Recalculate for a new question.' }];
    },
  },
  'math-flashcards-generator': {
    icon: 'lucide:book-open',
    fields: [{ key: 'topic', label: 'Topic', type: 'select', defaultValue: 'times', options: [{ label: 'Multiplication', value: 'times' }, { label: 'Fractions', value: 'fractions' }] }],
    compute: (v) => {
      if (v.topic === 'fractions') return [{ label: 'Flashcards', value: '1/2 + 1/4 = ?\n3/5 × 2/3 = ?\nReduce 24/36', highlight: true }];
      return [{ label: 'Flashcards', value: '7×8=?\n9×6=?\n12×12=?', highlight: true }];
    },
  },
  'arithmetic-sequence-calculator': {
    icon: 'lucide:list',
    fields: [{ key: 'a1', label: 'First term a1', type: 'number', defaultValue: '2' }, { key: 'd', label: 'Difference d', type: 'number', defaultValue: '3' }, { key: 'n', label: 'Term number n', type: 'number', defaultValue: '10' }],
    compute: (v) => {
      const a1 = n(v.a1), d = n(v.d), k = n(v.n);
      const an = a1 + (k - 1) * d;
      const sum = (k / 2) * (2 * a1 + (k - 1) * d);
      return [{ label: 'n-th term', value: String(an), highlight: true }, { label: 'Sum of first n', value: String(sum) }];
    },
  },
  'geometric-sequence-calculator': {
    icon: 'lucide:git-branch',
    fields: [{ key: 'a1', label: 'First term a1', type: 'number', defaultValue: '3' }, { key: 'r', label: 'Ratio r', type: 'number', defaultValue: '2' }, { key: 'n', label: 'Term number n', type: 'number', defaultValue: '8' }],
    compute: (v) => {
      const a1 = n(v.a1), r = n(v.r), k = n(v.n);
      const an = a1 * Math.pow(r, k - 1);
      const sum = r === 1 ? a1 * k : a1 * (1 - Math.pow(r, k)) / (1 - r);
      return [{ label: 'n-th term', value: String(an), highlight: true }, { label: 'Sum of first n', value: String(sum) }];
    },
  },
  'formula-sheet-generator-classwise': {
    icon: 'lucide:notebook-pen',
    fields: [{ key: 'class', label: 'Class', type: 'select', defaultValue: '8', options: [{ label: 'Class 6', value: '6' }, { label: 'Class 7', value: '7' }, { label: 'Class 8', value: '8' }, { label: 'Class 9', value: '9' }, { label: 'Class 10', value: '10' }] }],
    compute: (v) => [{ label: `Formula sheet class ${v.class}`, value: 'Area formulas\nSimple interest\nPercentage formulas\nAlgebra identities', highlight: true }],
  },
  'marks-to-grade-converter': {
    icon: 'lucide:badge-check',
    fields: [{ key: 'pct', label: 'Percentage', type: 'number', defaultValue: '84' }],
    compute: (v) => [{ label: 'Grade', value: gradeFromPct(n(v.pct)), highlight: true }],
  },
  'grade-to-percentage-converter': {
    icon: 'lucide:badge-plus',
    fields: [{ key: 'grade', label: 'Grade', type: 'select', defaultValue: 'A', options: ['A+', 'A', 'B', 'C', 'D', 'F'].map((g) => ({ label: g, value: g })) }],
    compute: (v) => [{ label: 'Estimated percentage range', value: pctFromGrade(v.grade ?? ''), highlight: true }],
  },
  'exam-score-predictor': {
    icon: 'lucide:target',
    fields: [{ key: 'current', label: 'Current average %', type: 'number', defaultValue: '72' }, { key: 'improve', label: 'Expected improvement %', type: 'number', defaultValue: '8' }],
    compute: (v) => [{ label: 'Predicted exam %', value: `${(n(v.current) + n(v.improve)).toFixed(2)}%`, highlight: true }],
  },
  'study-time-calculator': {
    icon: 'lucide:timer',
    fields: [{ key: 'subjects', label: 'Subjects count', type: 'number', defaultValue: '5' }, { key: 'days', label: 'Days left', type: 'number', defaultValue: '30' }, { key: 'hours', label: 'Hours/day available', type: 'number', defaultValue: '3' }],
    compute: (v) => {
      const total = n(v.days) * n(v.hours);
      const per = n(v.subjects) > 0 ? total / n(v.subjects) : 0;
      return [{ label: 'Total study hours left', value: formatNumber(total), highlight: true }, { label: 'Hours per subject (equal split)', value: per.toFixed(2) }];
    },
  },
  'grammar-checker-basic-rules': {
    icon: 'lucide:spell-check',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'i has a apple. this are test sentence' }],
    compute: (v) => {
      const text = s(v.text);
      const fixes = [];
      if (/\bi\b/.test(text)) fixes.push('Use "I" capitalized.');
      if (/\ba apple\b/i.test(text)) fixes.push('Use "an apple".');
      if (/\bthis are\b/i.test(text)) fixes.push('Use "this is".');
      return [{ label: 'Suggestions', value: fixes.length ? fixes.join('\n') : 'No basic rule issue found.', highlight: true }];
    },
  },
  'sentence-rewriter-simple': {
    icon: 'lucide:refresh-cw',
    fields: [{ key: 'text', label: 'Sentence', type: 'textarea', defaultValue: 'Due to the fact that it was raining, we stayed at home.' }],
    compute: (v) => [{ label: 'Rewritten', value: s(v.text).replace(/due to the fact that/gi, 'because').replace(/\s+/g, ' '), highlight: true }],
  },
  'passive-to-active-converter': {
    icon: 'lucide:repeat',
    fields: [{ key: 'text', label: 'Passive sentence', type: 'text', defaultValue: 'The ball was kicked by John.' }],
    compute: (v) => [{ label: 'Active (basic)', value: s(v.text).replace(/was (.+) by (.+)\.?$/i, '$2 $1.'), highlight: true }],
  },
  'active-to-passive-converter': {
    icon: 'lucide:repeat-2',
    fields: [{ key: 'text', label: 'Active sentence', type: 'text', defaultValue: 'John kicked the ball.' }],
    compute: (v) => [{ label: 'Passive (basic)', value: s(v.text).replace(/^(.+?)\s+(\w+)\s+(.+)\.?$/i, '$3 was $2 by $1.'), highlight: true }],
  },
  'sentence-expander-tool': {
    icon: 'lucide:expand',
    fields: [{ key: 'text', label: 'Short sentence', type: 'text', defaultValue: 'The sun rises.' }],
    compute: (v) => [{ label: 'Expanded sentence', value: `${s(v.text)} It brings light, warmth, and energy to start the day.`, highlight: true }],
  },
  'sentence-shortener-tool': {
    icon: 'lucide:shrink',
    fields: [{ key: 'text', label: 'Long sentence', type: 'textarea', defaultValue: 'In order to achieve better scores, students should regularly revise, practice questions, and manage time effectively.' }],
    compute: (v) => [{ label: 'Shortened sentence', value: s(v.text).replace(/in order to/gi, 'to').split(',').slice(0, 2).join(',') + '.', highlight: true }],
  },
  'synonym-finder-basic': {
    icon: 'lucide:book-text',
    fields: [{ key: 'word', label: 'Word', type: 'text', defaultValue: 'happy' }],
    compute: (v) => {
      const db: Record<string, string[]> = { happy: ['joyful', 'cheerful', 'glad'], big: ['large', 'huge', 'massive'], smart: ['clever', 'intelligent', 'bright'] };
      const w = s(v.word).toLowerCase();
      return [{ label: 'Synonyms', value: (db[w] ?? ['No match in basic dataset']).join(', '), highlight: true }];
    },
  },
  'antonym-finder-basic': {
    icon: 'lucide:book-minus',
    fields: [{ key: 'word', label: 'Word', type: 'text', defaultValue: 'happy' }],
    compute: (v) => {
      const db: Record<string, string[]> = { happy: ['sad', 'unhappy'], big: ['small', 'tiny'], smart: ['dull', 'slow'] };
      const w = s(v.word).toLowerCase();
      return [{ label: 'Antonyms', value: (db[w] ?? ['No match in basic dataset']).join(', '), highlight: true }];
    },
  },
  'word-definition-lookup-static': {
    icon: 'lucide:library',
    fields: [{ key: 'word', label: 'Word', type: 'text', defaultValue: 'photosynthesis' }],
    compute: (v) => {
      const db: Record<string, string> = { photosynthesis: 'Process by which green plants make food using sunlight.', velocity: 'Speed in a given direction.', ecosystem: 'Community of living organisms and environment.' };
      const w = s(v.word).toLowerCase();
      return [{ label: 'Definition', value: db[w] ?? 'Definition not found in static set.', highlight: true }];
    },
  },
  'word-of-the-day-generator': {
    icon: 'lucide:sun',
    fields: [],
    compute: () => {
      const bank = [
        { word: 'Resilient', meaning: 'Able to recover quickly.' },
        { word: 'Meticulous', meaning: 'Very careful and precise.' },
        { word: 'Curious', meaning: 'Eager to know or learn.' },
      ];
      const i = new Date().getDate() % bank.length;
      return [{ label: bank[i]!.word, value: bank[i]!.meaning, highlight: true }];
    },
  },
  'vocabulary-quiz-generator': {
    icon: 'lucide:help-circle',
    fields: [{ key: 'level', label: 'Level', type: 'select', defaultValue: 'easy', options: [{ label: 'Easy', value: 'easy' }, { label: 'Medium', value: 'medium' }] }],
    compute: (v) => [{ label: 'Quiz', value: v.level === 'medium' ? 'Choose synonym of "meticulous":\nA) careless B) precise C) noisy' : 'Choose antonym of "happy":\nA) sad B) cheerful C) joyful', highlight: true }],
  },
  'essay-topic-generator': {
    icon: 'lucide:file-pen-line',
    fields: [{ key: 'class', label: 'Class', type: 'number', defaultValue: '8' }],
    compute: (v) => {
      const topics = shuffled(['Importance of time', 'My dream career', 'Digital learning', 'Clean environment', 'A day without internet']).slice(0, 5);
      return [{ label: `Essay topics (class ${n(v.class)})`, value: topics.map((t, i) => `${i + 1}. ${t}`).join('\n'), highlight: true }];
    },
  },
  'paragraph-generator-structured': {
    icon: 'lucide:pilcrow',
    fields: [{ key: 'topic', label: 'Topic', type: 'text', defaultValue: 'Discipline' }],
    compute: (v) => {
      const t = s(v.topic) || 'Topic';
      return [{ label: 'Structured paragraph', value: `${t} is important in student life. It helps us build regular habits and focus on goals. With discipline, we can manage time and reduce stress. Therefore, discipline leads to consistent success.`, highlight: true }];
    },
  },
  'story-starter-generator': {
    icon: 'lucide:book-open-check',
    fields: [{ key: 'genre', label: 'Genre', type: 'select', defaultValue: 'mystery', options: [{ label: 'Mystery', value: 'mystery' }, { label: 'Fantasy', value: 'fantasy' }, { label: 'School', value: 'school' }] }],
    compute: (v) => {
      const map: Record<string, string> = {
        mystery: 'The old clock in the hallway stopped exactly at midnight, and then the letters began to appear.',
        fantasy: 'When Tara opened her notebook, a tiny map glowed and whispered, "Follow the silver river."',
        school: 'On exam day, Rahul found a note in his pencil box that changed everything.',
      };
      return [{ label: 'Story starter', value: map[v.genre ?? 'mystery'] ?? map.mystery!, highlight: true }];
    },
  },
  'letter-format-generator': {
    icon: 'lucide:mail',
    fields: [{ key: 'type', label: 'Type', type: 'select', defaultValue: 'formal', options: [{ label: 'Formal', value: 'formal' }, { label: 'Informal', value: 'informal' }] }],
    compute: (v) => {
      if (v.type === 'informal') return [{ label: 'Informal format', value: 'Address\nDate\nDear [Name],\nBody\nYours lovingly,\n[Name]', highlight: true }];
      return [{ label: 'Formal format', value: 'Sender Address\nDate\nReceiver Address\nSubject\nRespected Sir/Madam,\nBody\nThank you.\nYours faithfully,\n[Name]', highlight: true }];
    },
  },
  'speech-draft-generator': {
    icon: 'lucide:mic',
    fields: [{ key: 'topic', label: 'Topic', type: 'text', defaultValue: 'Importance of Reading' }],
    compute: (v) => {
      const t = s(v.topic) || 'Topic';
      return [{ label: 'Speech draft', value: `Good morning everyone.\nToday I will speak on ${t}.\n${t} helps us learn, grow, and think clearly.\nLet us practice this daily.\nThank you.`, highlight: true }];
    },
  },
  'reading-time-calculator-student': {
    icon: 'lucide:clock-3',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'Paste text here...' }],
    compute: (v) => {
      const wc = words(s(v.text)).length;
      const mins = Math.max(1, Math.ceil(wc / 200));
      return [{ label: 'Reading time', value: `${mins} min`, highlight: true }, { label: 'Word count', value: formatNumber(wc) }];
    },
  },
  'text-complexity-analyzer': {
    icon: 'lucide:bar-chart',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'This is a simple sentence. This is another one.' }],
    compute: (v) => {
      const txt = s(v.text);
      const ws = words(txt).length;
      const sent = Math.max(1, txt.split(/[.!?]+/).filter(Boolean).length);
      const avg = ws / sent;
      const level = avg < 12 ? 'Easy' : avg < 20 ? 'Medium' : 'Hard';
      return [{ label: 'Avg words/sentence', value: avg.toFixed(2), highlight: true }, { label: 'Complexity', value: level }];
    },
  },
  'keyword-extractor-simple': {
    icon: 'lucide:key',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'Science helps students learn science with practical science experiments.' }],
    compute: (v) => {
      const stop = new Set(['the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'is', 'with', 'for', 'on', 'this', 'that']);
      const freq = new Map<string, number>();
      for (const w of words(s(v.text))) if (!stop.has(w) && w.length > 2) freq.set(w, (freq.get(w) ?? 0) + 1);
      const top = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, c]) => `${k} (${c})`).join(', ');
      return [{ label: 'Keywords', value: top || 'No keywords', highlight: true }];
    },
  },
  'summary-generator-basic': {
    icon: 'lucide:scroll-text',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'Paragraph 1.\nParagraph 2.\nParagraph 3.' }],
    compute: (v) => {
      const sentences = s(v.text).split(/(?<=[.!?])\s+/).filter(Boolean);
      const out = sentences.slice(0, 2).join(' ');
      return [{ label: 'Basic summary', value: out || 'Enter text', highlight: true }];
    },
  },
  'word-scramble-generator': {
    icon: 'lucide:shuffle',
    fields: [{ key: 'word', label: 'Word', type: 'text', defaultValue: 'education' }],
    compute: (v) => {
      const arr = s(v.word).split('');
      const mixed = shuffled(arr).join('');
      return [{ label: 'Scrambled', value: mixed, highlight: true }];
    },
  },
  'crossword-generator-basic-grid': {
    icon: 'lucide:grid-3x3',
    fields: [{ key: 'words', label: 'Words (comma)', type: 'text', defaultValue: 'math,angle,ratio,area' }],
    compute: (v) => {
      const w = s(v.words).split(',').map((x) => x.trim().toUpperCase()).filter(Boolean);
      const grid = w.slice(0, 4).map((x, i) => `${i + 1}. ${x}`).join('\n');
      return [{ label: 'Basic crossword word bank', value: grid, highlight: true }, { label: 'Note', value: 'Full intersecting grid can be added in dedicated component.' }];
    },
  },
  'fill-in-the-blanks-generator': {
    icon: 'lucide:pen-square',
    fields: [{ key: 'text', label: 'Sentence', type: 'text', defaultValue: 'Plants make food using sunlight.' }],
    compute: (v) => {
      const ws = s(v.text).split(' ').filter(Boolean);
      if (ws.length < 3) return [{ label: 'Blank sentence', value: s(v.text), highlight: true }];
      const idx = Math.floor(ws.length / 2);
      const ans = ws[idx]!;
      ws[idx] = '_____';
      return [{ label: 'Practice sentence', value: ws.join(' '), highlight: true }, { label: 'Answer', value: ans }];
    },
  },
};
