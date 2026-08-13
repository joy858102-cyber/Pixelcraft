import React from 'react';

interface AdContainerProps {
  type: 'top-banner' | 'sidebar' | 'in-content' | 'footer-banner';
  className?: string;
}

export const AdContainer: React.FC<AdContainerProps> = ({ type, className = '' }) => {
  let dimensions = 'min-h-[90px] w-full max-w-[728px]';
  let label = 'Top Leaderboard Ad Slot (728x90 / Responsive)';

  if (type === 'sidebar') {
    dimensions = 'min-h-[250px] w-full max-w-[300px]';
    label = 'Sidebar Rectangle Ad (300x250)';
  } else if (type === 'in-content') {
    dimensions = 'min-h-[120px] w-full max-w-[800px]';
    label = 'In-Content Banner Slot (Responsive)';
  } else if (type === 'footer-banner') {
    dimensions = 'min-h-[90px] w-full max-w-[728px]';
    label = 'Bottom Page Banner Ad (Responsive)';
  }

  return (
    <div className={`my-6 flex flex-col items-center justify-center ${className}`}>
      <span className="mb-1 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
        Advertisement Space
      </span>
      <div
        className={`${dimensions} rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50 p-4 text-center transition-all flex flex-col items-center justify-center`}
      >
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
          AdSense / Network Ready • Compliant Placement
        </p>
      </div>
    </div>
  );
};
