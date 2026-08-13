import React, { useState } from 'react';
import {
  Wand2,
  Search,
  Sun,
  Moon,
  Laptop,
  Star,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TOOL_CATEGORIES, TOOLS_DATA } from '../data/toolsData';
import { ThemeMode } from '../types';

interface HeaderProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenSearch: () => void;
  onNavigateHome: () => void;
  onSelectCategory: (catId: string) => void;
  onSelectTool: (slug: string) => void;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onThemeChange,
  onOpenSearch,
  onNavigateHome,
  onSelectCategory,
  onSelectTool,
  favoritesCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const popularTools = TOOLS_DATA.filter((t) => t.popular).slice(0, 8);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                PixelCraft
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md">
                100% Free
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5">
              Browser-Based Image Studio
            </p>
          </div>
        </button>

        {/* Search Trigger Button */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2 px-3.5 py-2 w-64 lg:w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 text-slate-400 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-white dark:hover:bg-slate-900 transition text-xs shadow-xs"
        >
          <Search className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="truncate">Search 30+ tools...</span>
          <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-200/60 dark:bg-slate-800 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Desktop Links & Actions */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <button
            onClick={onNavigateHome}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Home
          </button>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              onBlur={() => setTimeout(() => setCategoryDropdownOpen(false), 200)}
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Categories
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 z-50 animate-fade-in">
                {TOOL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setCategoryDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition text-xs flex flex-col"
                  >
                    <span className="font-bold">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">{cat.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onSelectCategory('all')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Popular
          </button>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search Mobile Trigger */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            aria-label="Search tools"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Favorites Button */}
          <button
            onClick={onOpenSearch}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center gap-1"
            title="Favorite tools"
          >
            <Star className="w-5 h-5 text-amber-500" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Theme Switcher Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => onThemeChange('light')}
              className={`p-1.5 rounded-lg transition ${
                currentTheme === 'light'
                  ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Light Mode"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              className={`p-1.5 rounded-lg transition ${
                currentTheme === 'dark'
                  ? 'bg-slate-700 text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Dark Mode"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4 animate-fade-in">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Categories
            </p>
            {TOOL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between"
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Popular Tools
            </p>
            <div className="grid grid-cols-2 gap-2">
              {popularTools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTool(t.slug);
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-indigo-400 truncate"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Client-Side Privacy • Zero Server Uploads</span>
          </div>
        </div>
      )}
    </header>
  );
};
