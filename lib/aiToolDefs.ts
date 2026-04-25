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

const s = (v: string | undefined) => (v ?? '').trim();
const n = (v: string | undefined) => +((v ?? '').replace(/,/g, '')) || 0;

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)] ?? arr[0];
}

function splitSentences(text: string) {
  return s(text).split(/(?<=[.!?])\s+/).filter(Boolean);
}

export const aiToolDefinitions: Record<
  string,
  { icon: string; fields: ToolField[]; compute: (values: Record<string, string>) => ToolResult[] }
> = {
  'essay-generator-class-topic': {
    icon: 'lucide:file-text',
    fields: [
      { key: 'topic', label: 'Topic', type: 'text', defaultValue: 'Climate Change' },
      { key: 'class', label: 'Class', type: 'number', defaultValue: '8' },
      { key: 'words', label: 'Word count', type: 'number', defaultValue: '250' },
    ],
    compute: (v) => {
      const topic = s(v.topic) || 'My Topic';
      const cls = n(v.class) || 8;
      const words = Math.max(120, n(v.words) || 250);
      const para = [
        `Introduction: ${topic} is an important subject for students of class ${cls}.`,
        `Body: ${topic} affects our daily life, environment, and future opportunities. We should understand causes, effects, and practical solutions.`,
        `Examples: Schools, families, and communities can contribute through awareness and responsible actions.`,
        `Conclusion: In summary, ${topic} teaches us responsibility and helps us become better citizens.`,
      ].join('\n\n');
      return [{ label: `Essay draft (~${words} words)`, value: para, highlight: true }];
    },
  },
  'essay-rewriter': {
    icon: 'lucide:refresh-cw',
    fields: [{ key: 'text', label: 'Essay / paragraph', type: 'textarea', defaultValue: 'The rapid advancement of technology has transformed the modern educational ecosystem.' }],
    compute: (v) => [{ label: 'Simplified rewrite', value: s(v.text).replace(/rapid advancement/gi, 'fast growth').replace(/transformed/gi, 'changed').replace(/ecosystem/gi, 'system'), highlight: true }],
  },
  'paragraph-expander-ai': {
    icon: 'lucide:expand',
    fields: [{ key: 'text', label: 'Short text', type: 'text', defaultValue: 'Reading is important.' }],
    compute: (v) => {
      const t = s(v.text) || 'Learning is important.';
      return [{ label: 'Expanded paragraph', value: `${t} It improves knowledge, builds vocabulary, and sharpens thinking skills. Students who read daily understand concepts better and express ideas more confidently. Reading also develops imagination and concentration, which helps in exams and life.`, highlight: true }];
    },
  },
  'paragraph-summarizer-ai': {
    icon: 'lucide:scroll-text',
    fields: [{ key: 'text', label: 'Long text', type: 'textarea', defaultValue: 'Paste a long paragraph here. This tool returns a shorter summary with key points. It keeps the core meaning and removes repetition.' }],
    compute: (v) => {
      const ss = splitSentences(v.text ?? '');
      return [{ label: 'Short summary', value: ss.slice(0, 2).join(' ') || 'Enter text to summarize.', highlight: true }];
    },
  },
  'grammar-fixer-ai': {
    icon: 'lucide:spell-check',
    fields: [{ key: 'text', label: 'Sentence', type: 'text', defaultValue: 'he go to school everyday and do not studies.' }],
    compute: (v) => {
      let out = s(v.text);
      out = out.replace(/\bhe\b/g, 'He').replace(/\beveryday\b/gi, 'every day').replace(/\bdo not studies\b/gi, 'does not study').replace(/\bgo to\b/gi, 'goes to');
      return [{ label: 'Corrected sentence', value: out, highlight: true }];
    },
  },
  'sentence-simplifier-ai': {
    icon: 'lucide:shrink',
    fields: [{ key: 'text', label: 'Complex sentence', type: 'textarea', defaultValue: 'Although the project encountered multiple obstacles, the team managed to deliver a satisfactory outcome by coordinating efficiently.' }],
    compute: (v) => [{ label: 'Easy version', value: s(v.text).replace(/although/gi, '').replace(/encountered multiple obstacles/gi, 'had many problems').replace(/managed to deliver a satisfactory outcome/gi, 'still delivered good results').replace(/coordinating efficiently/gi, 'working well together'), highlight: true }],
  },
  'story-generator-kids-students': {
    icon: 'lucide:book-open',
    fields: [{ key: 'theme', label: 'Theme', type: 'text', defaultValue: 'Friendship and honesty' }],
    compute: (v) => {
      const t = s(v.theme) || 'Courage';
      return [{ label: 'Story draft', value: `Once in a small school, two friends learned a lesson about ${t}. When a mistake happened, they chose to tell the truth instead of hiding it. Their teacher appreciated their honesty, and the class learned that character is more important than marks.`, highlight: true }];
    },
  },
  'letter-generator-ai': {
    icon: 'lucide:mail',
    fields: [
      { key: 'type', label: 'Type', type: 'select', defaultValue: 'formal', options: [{ label: 'Formal', value: 'formal' }, { label: 'Informal', value: 'informal' }] },
      { key: 'topic', label: 'Topic', type: 'text', defaultValue: 'Leave application' },
    ],
    compute: (v) => {
      const topic = s(v.topic) || 'Request';
      if (v.type === 'informal') return [{ label: 'Letter', value: `Dear Friend,\nI hope you are doing well. I am writing to share about ${topic}. It has been an important event for me.\nYours lovingly,\n[Your Name]`, highlight: true }];
      return [{ label: 'Letter', value: `From: [Your Address]\nDate: [DD/MM/YYYY]\nTo: [Receiver]\nSubject: ${topic}\nRespected Sir/Madam,\nI request you to kindly consider my application regarding ${topic}.\nThank you.\nYours faithfully,\n[Your Name]`, highlight: true }];
    },
  },
  'speech-generator-school-topics': {
    icon: 'lucide:mic',
    fields: [{ key: 'topic', label: 'School topic', type: 'text', defaultValue: 'Importance of Discipline' }],
    compute: (v) => {
      const t = s(v.topic) || 'Education';
      return [{ label: 'Speech draft', value: `Good morning everyone.\nToday I will speak on ${t}.\n${t} helps students become responsible and focused. Small daily habits create long-term success.\nLet us practice it from today.\nThank you.`, highlight: true }];
    },
  },
  'debate-arguments-generator': {
    icon: 'lucide:messages-square',
    fields: [{ key: 'topic', label: 'Debate topic', type: 'text', defaultValue: 'Should homework be reduced?' }],
    compute: (v) => {
      const t = s(v.topic) || 'Debate topic';
      return [{ label: 'For / Against points', value: `Topic: ${t}\n\nFor:\n1. Reduces student stress.\n2. Allows time for sports and creativity.\n3. Better balance improves learning.\n\nAgainst:\n1. Homework reinforces class concepts.\n2. Builds discipline and self-study habit.\n3. Helps teachers track understanding.`, highlight: true }];
    },
  },
  'math-word-problem-generator': {
    icon: 'lucide:circle-help',
    fields: [{ key: 'topic', label: 'Math topic', type: 'text', defaultValue: 'Percentages' }],
    compute: (v) => {
      const t = s(v.topic).toLowerCase() || 'percentages';
      if (t.includes('ratio')) return [{ label: 'Questions + Answers', value: `1) Simplify 24:36. Answer: 2:3\n2) Divide ₹500 in ratio 2:3. Answer: ₹200 and ₹300`, highlight: true }];
      return [{ label: 'Questions + Answers', value: `1) 25% of 360 = ? Answer: 90\n2) A price drops by 20% from ₹1500. New price? Answer: ₹1200`, highlight: true }];
    },
  },
  'quiz-generator-mcqs': {
    icon: 'lucide:help-circle',
    fields: [{ key: 'subject', label: 'Subject', type: 'text', defaultValue: 'Science' }],
    compute: (v) => {
      const sub = s(v.subject) || 'General';
      return [{ label: `${sub} MCQs`, value: `1) Which gas do plants absorb?\nA) Oxygen B) Carbon dioxide C) Nitrogen D) Helium\nAnswer: B\n\n2) Water boils at?\nA) 90°C B) 95°C C) 100°C D) 110°C\nAnswer: C`, highlight: true }];
    },
  },
  'flashcard-generator-ai': {
    icon: 'lucide:bookmark',
    fields: [{ key: 'topic', label: 'Topic', type: 'text', defaultValue: 'Photosynthesis' }],
    compute: (v) => {
      const t = s(v.topic) || 'Topic';
      return [{ label: 'Q/A Flashcards', value: `Q1: What is ${t}?\nA1: [Simple definition]\n\nQ2: Why is ${t} important?\nA2: [Key reason]\n\nQ3: One real-life example of ${t}?\nA3: [Example]`, highlight: true }];
    },
  },
  'definition-explainer': {
    icon: 'lucide:book-a',
    fields: [{ key: 'term', label: 'Word / topic', type: 'text', defaultValue: 'Democracy' }],
    compute: (v) => [{ label: 'Simple explanation', value: `${s(v.term) || 'Concept'} means a system where people choose their leaders by voting and have a say in governance.`, highlight: true }],
  },
  'concept-simplifier': {
    icon: 'lucide:lightbulb',
    fields: [{ key: 'concept', label: 'Concept', type: 'text', defaultValue: 'Photosynthesis' }],
    compute: (v) => [{ label: 'Easy explanation', value: `${s(v.concept) || 'Concept'} can be understood as: input + process + output. Learn it with one simple real-life example and one diagram.`, highlight: true }],
  },
  'homework-helper-limited': {
    icon: 'lucide:notebook',
    fields: [{ key: 'question', label: 'Homework question', type: 'textarea', defaultValue: 'Explain why plants are called producers.' }],
    compute: (v) => [{ label: 'Guided answer outline', value: `1) Define the main term.\n2) Explain the process.\n3) Add one example.\n4) Conclude in one line.\n\nTopic: ${s(v.question)}`, highlight: true }],
  },
  'instagram-caption-generator': {
    icon: 'lucide:instagram',
    fields: [{ key: 'topic', label: 'Post topic', type: 'text', defaultValue: 'Exam preparation tips' }],
    compute: (v) => [{ label: 'Caption ideas', value: `${s(v.topic)} in 3 simple steps ✍️📚\nConsistency > intensity. Save this for revision time!`, highlight: true }],
  },
  'hashtag-generator-ai': {
    icon: 'lucide:hash',
    fields: [{ key: 'topic', label: 'Topic', type: 'text', defaultValue: 'study motivation' }],
    compute: (v) => {
      const t = s(v.topic).toLowerCase().replace(/\s+/g, '');
      return [{ label: 'Hashtags', value: `#${t} #study #students #motivation #learning #examprep #schoollife`, highlight: true }];
    },
  },
  'bio-generator-students-creators': {
    icon: 'lucide:user-round',
    fields: [{ key: 'profile', label: 'Profile type', type: 'select', defaultValue: 'student', options: [{ label: 'Student', value: 'student' }, { label: 'Creator', value: 'creator' }] }],
    compute: (v) => [{ label: 'Bio options', value: v.profile === 'creator' ? 'Creator | Learning daily | Sharing simple insights ✨' : 'Student | Dreaming big, studying smart 📚 | Progress every day', highlight: true }],
  },
  'youtube-description-generator': {
    icon: 'lucide:tv',
    fields: [{ key: 'topic', label: 'Video topic', type: 'text', defaultValue: 'Quadratic Equation Tricks' }],
    compute: (v) => [{ label: 'Description', value: `In this video, we cover ${s(v.topic)} in a simple step-by-step way.\n\nTimestamps:\n00:00 Intro\n01:10 Concept\n04:30 Practice Questions\n\nLike, share, and subscribe for more student-friendly learning content.`, highlight: true }],
  },
  'youtube-script-generator': {
    icon: 'lucide:clapperboard',
    fields: [{ key: 'topic', label: 'Script topic', type: 'text', defaultValue: 'How to score better in maths' }],
    compute: (v) => [{ label: 'Script outline', value: `Hook (10s): Why this topic matters\nIntro (30s): ${s(v.topic)}\nMain points (3-5 mins): Tip 1, Tip 2, Tip 3\nExample/demo\nCTA: Subscribe + comment your doubt`, highlight: true }],
  },
  'tweet-generator': {
    icon: 'lucide:bird',
    fields: [{ key: 'topic', label: 'Tweet topic', type: 'text', defaultValue: 'Student productivity' }],
    compute: (v) => [{ label: 'Tweet ideas', value: `Small daily progress > random big efforts.\n${s(v.topic)} is about consistency, not perfection. #students #learning`, highlight: true }],
  },
  'resume-bullet-generator': {
    icon: 'lucide:file-badge',
    fields: [{ key: 'role', label: 'Role / activity', type: 'text', defaultValue: 'School project leader' }],
    compute: (v) => [{ label: 'Bullet points', value: `• Led a team to complete ${s(v.role)} within deadline.\n• Improved coordination and communication among members.\n• Presented results to teachers with clear documentation.`, highlight: true }],
  },
  'cover-letter-generator': {
    icon: 'lucide:file-signature',
    fields: [{ key: 'position', label: 'Position / internship', type: 'text', defaultValue: 'Student Intern' }],
    compute: (v) => [{ label: 'Cover letter draft', value: `Dear Hiring Manager,\nI am writing to apply for the ${s(v.position)} role. I am eager to learn, quick to adapt, and committed to delivering quality work.\nThank you for your consideration.\nSincerely,\n[Your Name]`, highlight: true }],
  },
  'sop-generator-students': {
    icon: 'lucide:graduation-cap',
    fields: [{ key: 'course', label: 'Course / program', type: 'text', defaultValue: 'MS in Data Science' }],
    compute: (v) => [{ label: 'SOP structure', value: `1) Academic background\n2) Why ${s(v.course)}\n3) Projects/experience\n4) Career goals\n5) Why this university`, highlight: true }],
  },
  'linkedin-summary-generator': {
    icon: 'lucide:linkedin',
    fields: [{ key: 'profile', label: 'Profile highlights', type: 'text', defaultValue: 'Student, projects in AI and web development' }],
    compute: (v) => [{ label: 'LinkedIn summary', value: `I am a motivated student with strong interest in technology and problem solving. ${s(v.profile)}. I enjoy building practical projects and continuously learning new skills.`, highlight: true }],
  },
  'career-objective-generator': {
    icon: 'lucide:compass',
    fields: [{ key: 'goal', label: 'Career goal', type: 'text', defaultValue: 'Software Engineer' }],
    compute: (v) => [{ label: 'Career objective', value: `To secure an opportunity as a ${s(v.goal)} where I can apply my skills, learn from mentors, and contribute to meaningful projects.`, highlight: true }],
  },
  'ai-joke-generator': {
    icon: 'lucide:laugh',
    fields: [{ key: 'topic', label: 'Topic', type: 'text', defaultValue: 'Math class' }],
    compute: (v) => [{ label: 'Joke', value: pick([`Why did the ${s(v.topic)} notebook look sad? It had too many problems!`, `My ${s(v.topic)} teacher said “be rational”… so I stopped talking to irrational numbers.`]), highlight: true }],
  },
  'riddle-generator': {
    icon: 'lucide:puzzle',
    fields: [{ key: 'difficulty', label: 'Difficulty', type: 'select', defaultValue: 'easy', options: [{ label: 'Easy', value: 'easy' }, { label: 'Medium', value: 'medium' }] }],
    compute: (v) => [{ label: 'Riddle', value: v.difficulty === 'medium' ? 'I speak without a mouth and hear without ears. What am I? (Echo)' : 'What has keys but can’t open locks? (Keyboard)', highlight: true }],
  },
  'tongue-twister-generator': {
    icon: 'lucide:audio-lines',
    fields: [{ key: 'level', label: 'Level', type: 'select', defaultValue: 'easy', options: [{ label: 'Easy', value: 'easy' }, { label: 'Hard', value: 'hard' }] }],
    compute: (v) => [{ label: 'Tongue twister', value: v.level === 'hard' ? 'Lesser leather never weathered wetter weather better.' : 'She sells sea shells by the sea shore.', highlight: true }],
  },
  'random-fun-fact-generator': {
    icon: 'lucide:sparkles',
    fields: [],
    compute: () => [{ label: 'Fun fact', value: pick(['Octopuses have three hearts.', 'Honey never spoils.', 'Bananas are berries, but strawberries are not.']), highlight: true }],
  },
  'pickup-line-generator': {
    icon: 'lucide:heart-handshake',
    fields: [{ key: 'tone', label: 'Tone', type: 'select', defaultValue: 'cute', options: [{ label: 'Cute', value: 'cute' }, { label: 'Funny', value: 'funny' }] }],
    compute: (v) => [{ label: 'Line', value: v.tone === 'funny' ? 'Are you a Wi-Fi signal? Because I feel a strong connection.' : 'Your smile is my favorite notification.', highlight: true }],
  },
  'translate-to-simple-english': {
    icon: 'lucide:languages',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'The aforementioned policy shall be implemented with immediate effect.' }],
    compute: (v) => [{ label: 'Simple English', value: s(v.text).replace(/aforementioned/gi, 'this').replace(/shall be implemented with immediate effect/gi, 'will start now'), highlight: true }],
  },
  'convert-english-to-formal-tone': {
    icon: 'lucide:briefcase',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'Can you send me the file quickly?' }],
    compute: (v) => [{ label: 'Formal tone', value: s(v.text).replace(/can you/gi, 'Could you please').replace(/quickly/gi, 'at your earliest convenience'), highlight: true }],
  },
  'convert-english-to-casual-tone': {
    icon: 'lucide:coffee',
    fields: [{ key: 'text', label: 'Text', type: 'textarea', defaultValue: 'Could you please provide the document at your earliest convenience?' }],
    compute: (v) => [{ label: 'Casual tone', value: s(v.text).replace(/Could you please/gi, 'Can you').replace(/at your earliest convenience/gi, 'when you get time'), highlight: true }],
  },
  'word-meaning-simple-terms': {
    icon: 'lucide:book-open-text',
    fields: [{ key: 'word', label: 'Word', type: 'text', defaultValue: 'ecosystem' }],
    compute: (v) => [{ label: 'Simple meaning', value: `${s(v.word)} means how living things and their surroundings work together.`, highlight: true }],
  },
  'sentence-tone-detector': {
    icon: 'lucide:scan-face',
    fields: [{ key: 'text', label: 'Sentence', type: 'text', defaultValue: 'I am really excited to join this project!' }],
    compute: (v) => {
      const t = s(v.text).toLowerCase();
      let tone = 'Neutral';
      if (/!|excited|great|happy|love/.test(t)) tone = 'Positive';
      if (/angry|bad|hate|worst|sad/.test(t)) tone = 'Negative';
      if (/please|kindly|regards/.test(t)) tone = 'Formal';
      return [{ label: 'Detected tone', value: tone, highlight: true }];
    },
  },
  'todo-list-generator-ai': {
    icon: 'lucide:list-todo',
    fields: [{ key: 'goal', label: 'Goal', type: 'text', defaultValue: 'Prepare for math test' }],
    compute: (v) => [{ label: 'To-do list', value: `1) Define your target for ${s(v.goal)}\n2) Collect notes and formulas\n3) Practice 20 questions\n4) Revise weak areas\n5) Mock test + review mistakes`, highlight: true }],
  },
  'study-plan-generator-ai': {
    icon: 'lucide:calendar-check-2',
    fields: [{ key: 'exam', label: 'Exam name', type: 'text', defaultValue: 'Class 10 Finals' }, { key: 'days', label: 'Days left', type: 'number', defaultValue: '30' }],
    compute: (v) => {
      const d = Math.max(1, n(v.days));
      return [{ label: 'Study plan', value: `Exam: ${s(v.exam)}\nDays 1-${Math.ceil(d * 0.4)}: Concept revision\nDays ${Math.ceil(d * 0.4) + 1}-${Math.ceil(d * 0.75)}: Practice sets\nDays ${Math.ceil(d * 0.75) + 1}-${d}: Mock tests + error log`, highlight: true }];
    },
  },
  'daily-routine-generator-ai': {
    icon: 'lucide:sun-moon',
    fields: [{ key: 'focus', label: 'Main focus', type: 'text', defaultValue: 'Study + fitness balance' }],
    compute: (v) => [{ label: 'Routine draft', value: `6:30 Wake up\n7:00 Exercise\n8:00 School/Work prep\n17:00 Focus block (${s(v.focus)})\n20:00 Revision + planning\n22:30 Sleep`, highlight: true }],
  },
};
