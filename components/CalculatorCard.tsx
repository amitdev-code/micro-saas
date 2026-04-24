import { Icon } from '@iconify/react';

interface CalculatorCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

export default function CalculatorCard({ title, icon, children }: CalculatorCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-card">
      {/* Header */}
      <div className="bg-gray-950 dark:bg-white px-6 py-5 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/10 dark:bg-gray-900/10 rounded-lg flex items-center justify-center shrink-0">
          <Icon icon={icon} className="w-5 h-5 text-white dark:text-gray-900" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white dark:text-gray-900">{title}</h2>
          <p className="text-xs text-white/50 dark:text-gray-500">Free online calculator · Webeze</p>
        </div>
      </div>
      {/* Body */}
      <div className="p-6">{children}</div>
    </div>
  );
}
