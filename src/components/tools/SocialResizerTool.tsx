import React, { useState, useRef } from 'react';
import { Upload, Download, Share2, Check } from 'lucide-react';
import { processSocialResize, formatBytes } from '../../lib/imageEngine';

interface SocialResizerToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const SOCIAL_PRESETS = [
  { name: 'Instagram Square Post (1080 x 1080 px)', w: 1080, h: 1080 },
  { name: 'Instagram Portrait Post (1080 x 1350 px)', w: 1080, h: 1350 },
  { name: 'Instagram Story / Reel (1080 x 1920 px)', w: 1080, h: 1920 },
  { name: 'YouTube Thumbnail (1280 x 720 px)', w: 1280, h: 720 },
  { name: 'Facebook Event Cover (1200 x 628 px)', w: 1200, h: 628 },
  { name: 'Twitter Header (1500 x 500 px)', w: 1500, h: 500 },
  { name: 'TikTok Cover (1080 x 1920 px)', w: 1080, h: 1920 },
  { name: 'LinkedIn Banner (1584 x 396 px)', w: 1584, h: 396 },
];

export const SocialResizerTool: React.FC<SocialResizerToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [presetIndex, setPresetIndex] = useState<number>(0);
  const [paddingMode, setPaddingMode] = useState<'blur' | 'color' | 'crop'>('blur');
  const [bgColor, setBgColor] = useState<string>('#1E293B');

  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const p = SOCIAL_PRESETS[presetIndex];
      const res = await processSocialResize(file, p.w, p.h, paddingMode, bgColor);
      setProcessedBlob(res.blob);
      setProcessedUrl(URL.createObjectURL(res.blob));
      onShowToast('Social media graphic generated!', 'success');
    } catch (err) {
      onShowToast('Failed to resize graphic.', 'error');
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 rounded-3xl p-10 text-center bg-indigo-50/40 dark:bg-slate-900/40 cursor-pointer"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Share2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upload Graphic for Social Media
            </h3>
            <p className="text-xs text-slate-500">
              Resize for Instagram, YouTube, Facebook, Twitter, TikTok & LinkedIn with smart padding
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Social Platform Spec
                </label>
                <select
                  value={presetIndex}
                  onChange={(e) => setPresetIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                >
                  {SOCIAL_PRESETS.map((p, i) => (
                    <option key={p.name} value={i}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Background Style
                </label>
                <select
                  value={paddingMode}
                  onChange={(e: any) => setPaddingMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                >
                  <option value="blur">Smart Gaussian Blur Padding (Recommended)</option>
                  <option value="crop">Full Canvas Cover Crop</option>
                  <option value="color">Solid Background Color Fill</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button onClick={() => setFile(null)} className="text-xs font-bold text-slate-500">
                Change Image
              </button>
              <button
                onClick={handleProcess}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Generate Social Graphic
              </button>
            </div>
          </div>

          {processedUrl && (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-center space-y-4">
              <div className="flex justify-center">
                <img src={processedUrl} alt="Social Graphic" className="max-h-96 object-contain rounded-2xl shadow-xl" />
              </div>
              <a
                href={processedUrl}
                download="PixelCraft-Social-Graphic.jpg"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                <Download className="w-4 h-4" /> Download Graphic ({formatBytes(processedBlob?.size || 0)})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
