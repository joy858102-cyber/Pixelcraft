import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  toolName?: string;
  categoryName?: string;
  onNavigateHome: () => void;
  onNavigateCategory?: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  toolName,
  categoryName,
  onNavigateHome,
  onNavigateCategory,
}) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 py-3">
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      {categoryName && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <button
            onClick={onNavigateCategory}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium"
          >
            {categoryName}
          </button>
        </>
      )}

      {toolName && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
            {toolName}
          </span>
        </>
      )}
    </nav>
  );
};
