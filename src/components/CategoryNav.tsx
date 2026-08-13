import React from 'react';
import { TOOL_CATEGORIES } from '../data/toolsData';

interface CategoryNavProps {
  activeCategory: string;
  onSelectCategory: (catId: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
          activeCategory === 'all'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        All Tools (30+)
      </button>

      {TOOL_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeCategory === cat.id
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
