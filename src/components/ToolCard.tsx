import React from 'react';
import {
  Minimize2,
  Crop,
  RefreshCw,
  Sliders,
  LayoutGrid,
  FileText,
  Code,
  Star,
  ArrowRight,
  FileImage,
  Layers,
  Zap,
  SlidersHorizontal,
  Maximize2,
  UserCheck,
  Share2,
  ArrowRightLeft,
  RotateCw,
  Stamp,
  Type,
  EyeOff,
  PenTool,
  Globe,
  Smile,
  Grid,
  Info,
  Pipette,
  Ruler,
} from 'lucide-react';
import { ToolMeta } from '../types';

interface ToolCardProps {
  tool: ToolMeta;
  onSelect: (slug: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (slug: string, e: React.MouseEvent) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Minimize2,
  Crop,
  RefreshCw,
  Sliders,
  LayoutGrid,
  FileText,
  Code,
  FileImage,
  Layers,
  Zap,
  SlidersHorizontal,
  Maximize2,
  UserCheck,
  Share2,
  ArrowRightLeft,
  RotateCw,
  Stamp,
  Type,
  EyeOff,
  PenTool,
  Globe,
  Smile,
  Grid,
  Info,
  Pipette,
  Ruler,
};

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onSelect,
  isFavorite,
  onToggleFavorite,
}) => {
  const IconComponent = ICON_MAP[tool.iconName] || Minimize2;

  return (
    <div
      onClick={() => onSelect(tool.slug)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Top Bar inside card */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex items-center gap-1.5">
          {tool.popular && (
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 rounded-md">
              Popular
            </span>
          )}
          <button
            onClick={(e) => onToggleFavorite(tool.slug, e)}
            className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition"
            aria-label="Favorite tool"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              className={`w-4 h-4 ${
                isFavorite ? 'fill-amber-500 text-amber-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tool Content */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {tool.name}
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {tool.shortDesc}
        </p>
      </div>

      {/* Bottom CTA Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {tool.category}
        </span>
        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Use Tool <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
