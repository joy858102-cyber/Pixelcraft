import React, { useState } from 'react';
import { Upload, Ruler } from 'lucide-react';
import { loadImageFromFile, formatBytes } from '../../lib/imageEngine';

interface DimensionsCheckerToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const DimensionsCheckerTool: React.FC<DimensionsCheckerToolProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [specs, setSpecs] = useState<{
    width: number;
    height: number;
    aspectRatio: string;
    megapixels: string;
    size: string;
    type: string;
  } | null>(null);

  const handleFileChange = async (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    try {
      const img = await loadImageFromFile(f);
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(w, h);

      setSpecs({
        width: w,
        height: h,
        aspectRatio: `${w / divisor}:${h / divisor}`,
        megapixels: ((w * h) / 1000000).toFixed(2) + ' MP',
        size: formatBytes(f.size),
        type: f.type || 'image/jpeg',
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <label className="block border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 rounded-3xl p-10 text-center bg-indigo-50/40 dark:bg-slate-900/40 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Ruler className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Drop File to Check Dimensions & Specs
            </h3>
            <p className="text-xs text-slate-500">
              Check exact pixel width, height, Megapixel resolution & aspect ratio
            </p>
          </div>
        </label>
      ) : (
        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Ruler className="w-4 h-4 text-indigo-500" /> Image Specifications: {file.name}
            </h4>
            <button onClick={() => setFile(null)} className="text-xs font-bold text-indigo-600">
              Check Another Image
            </button>
          </div>

          {specs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Width × Height</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {specs.width} × {specs.height} px
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Megapixels</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {specs.megapixels}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Aspect Ratio</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {specs.aspectRatio}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">File Size</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {specs.size}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800 sm:col-span-2">
                <span className="text-xs font-bold text-slate-400 uppercase">MIME Format</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {specs.type}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
