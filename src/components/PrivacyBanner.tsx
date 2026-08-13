import React from 'react';
import { ShieldCheck, Lock, Zap } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="w-full my-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
            <span>Client-Side Processing Guarantee</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">
              Zero Server Uploads
            </span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Your photos are processed locally inside your web browser. PixelCraft never uploads, stores, or sees your images.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
        <span className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-emerald-500" /> Private
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant
        </span>
      </div>
    </div>
  );
};
