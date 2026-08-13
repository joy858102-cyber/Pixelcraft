import React from 'react';
import { Wand2, ShieldCheck, Zap, Lock, Heart, ArrowUp } from 'lucide-react';
import { TOOL_CATEGORIES, TOOLS_DATA } from '../data/toolsData';

interface FooterProps {
  onNavigateHome: () => void;
  onSelectTool: (slug: string) => void;
  onSelectCategory: (catId: string) => void;
  onNavigatePage: (page: 'privacy' | 'terms' | 'sitemap') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onSelectTool,
  onSelectCategory,
  onNavigatePage,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      {/* Top Trust Banner */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              100% Client-Side Privacy
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              Your images are processed directly inside your browser. No files are stored or transmitted to external servers.
            </p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Lightning Fast & Free
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              Instant image processing powered by Web Assembly & HTML5 Canvas. Zero download wait times or signups.
            </p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-2 font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              No Registration Required
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              Unlimited access to all 30+ tools. No paywalls, watermarks, or artificial file limits.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand Summary */}
        <div className="lg:col-span-2 space-y-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Wand2 className="w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              PixelCraft
            </span>
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
            PixelCraft is a free online image utility platform offering high-performance, browser-based tools to compress, resize, convert, edit, and optimize graphics securely without uploading photos to external servers.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigatePage('privacy')}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigatePage('terms')}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Terms of Use
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigatePage('sitemap')}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              HTML Sitemap
            </button>
          </div>
        </div>

        {/* Popular Tools Directory */}
        <div>
          <h5 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white text-[11px] mb-3">
            Popular Image Tools
          </h5>
          <ul className="space-y-2">
            {TOOLS_DATA.slice(0, 7).map((tool) => (
              <li key={tool.id}>
                <button
                  onClick={() => onSelectTool(tool.slug)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  {tool.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories Directory */}
        <div>
          <h5 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white text-[11px] mb-3">
            Tool Categories
          </h5>
          <ul className="space-y-2">
            {TOOL_CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => onSelectCategory(cat.id)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* More Tools */}
        <div>
          <h5 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white text-[11px] mb-3">
            Creative & Utilities
          </h5>
          <ul className="space-y-2">
            {TOOLS_DATA.slice(18, 25).map((tool) => (
              <li key={tool.id}>
                <button
                  onClick={() => onSelectTool(tool.slug)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  {tool.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} PixelCraft — All rights reserved. Built for performance, privacy & usability.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
