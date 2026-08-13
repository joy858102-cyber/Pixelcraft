import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Star, Clock, ArrowRight } from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';
import { ToolMeta } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (slug: string) => void;
  favorites: string[];
  recentSlugs: string[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  favorites,
  recentSlugs,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTools = TOOLS_DATA.filter((tool) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.shortDesc.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const recentTools = TOOLS_DATA.filter((t) => recentSlugs.includes(t.slug));
  const favoriteTools = TOOLS_DATA.filter((t) => favorites.includes(t.slug));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 30+ image tools (e.g. compress, passport, crop, webp, pdf)..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1">
          {/* Default Quick Sections if query empty */}
          {!query && (
            <>
              {favoriteTools.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    Favorites
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {favoriteTools.map((tool) => (
                      <ToolListItem key={tool.id} tool={tool} onSelect={onSelectTool} onClose={onClose} />
                    ))}
                  </div>
                </div>
              )}

              {recentTools.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    Recently Used
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recentTools.map((tool) => (
                      <ToolListItem key={tool.id} tool={tool} onSelect={onSelectTool} onClose={onClose} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Popular Tools
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TOOLS_DATA.filter((t) => t.popular)
                    .slice(0, 6)
                    .map((tool) => (
                      <ToolListItem key={tool.id} tool={tool} onSelect={onSelectTool} onClose={onClose} />
                    ))}
                </div>
              </div>
            </>
          )}

          {/* Filtered Search Results */}
          {query && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                Found {filteredTools.length} matching tool{filteredTools.length === 1 ? '' : 's'}
              </p>
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredTools.map((tool) => (
                    <ToolListItem key={tool.id} tool={tool} onSelect={onSelectTool} onClose={onClose} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    No matching tools found for "{query}"
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try searching for keywords like "compress", "resize", "crop", "passport", "pdf", or "webp".
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ToolListItem: React.FC<{
  tool: ToolMeta;
  onSelect: (slug: string) => void;
  onClose: () => void;
}> = ({ tool, onSelect, onClose }) => {
  return (
    <button
      onClick={() => {
        onSelect(tool.slug);
        onClose();
      }}
      className="w-full flex items-center justify-between p-3 text-left rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs group-hover:scale-105 transition">
          {tool.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            {tool.name}
          </p>
          <p className="text-[11px] text-slate-400 truncate">{tool.shortDesc}</p>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 ml-2 group-hover:translate-x-0.5 transition" />
    </button>
  );
};
