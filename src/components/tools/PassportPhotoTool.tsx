import React, { useState, useRef } from 'react';
import { Upload, Download, Check, UserCheck, Grid } from 'lucide-react';
import { loadImageFromFile, canvasToBlob, createPassportSheet, formatBytes } from '../../lib/imageEngine';

interface PassportPhotoToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const PASSPORT_PRESETS = [
  { name: 'US Passport / Visa (2x2 inches)', widthPx: 600, heightPx: 600 },
  { name: 'UK / Schengen / EU (35x45 mm)', widthPx: 413, heightPx: 531 },
  { name: 'India Passport / OCI (35x45 mm)', widthPx: 413, heightPx: 531 },
  { name: 'China Visa (33x48 mm)', widthPx: 390, heightPx: 567 },
  { name: 'Canada Passport (50x70 mm)', widthPx: 591, heightPx: 827 },
];

export const PassportPhotoTool: React.FC<PassportPhotoToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [presetIndex, setPresetIndex] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [sheetType, setSheetType] = useState<'single' | '4x6' | 'A4'>('4x6');
  const [scale, setScale] = useState<number>(1);
  const [offsetY, setOffsetY] = useState<number>(0);

  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    setProcessedBlob(null);
    setProcessedUrl(null);
  };

  const handleGeneratePassport = async () => {
    if (!file) return;
    setIsGenerating(true);

    try {
      const preset = PASSPORT_PRESETS[presetIndex];
      const img = await loadImageFromFile(file);

      const canvas = document.createElement('canvas');
      canvas.width = preset.widthPx;
      canvas.height = preset.heightPx;
      const ctx = canvas.getContext('2d')!;

      // Solid Passport Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center portrait head with scale and offset
      const imgRatio = img.naturalWidth / img.naturalHeight;
      let drawH = canvas.height * scale;
      let drawW = drawH * imgRatio;

      const drawX = (canvas.width - drawW) / 2;
      const drawY = (canvas.height - drawH) / 2 + offsetY;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      const singleBlob = await canvasToBlob(canvas, 'image/jpeg', 0.95);

      // Create Sheet
      const sheetRes = await createPassportSheet(
        singleBlob,
        preset.widthPx,
        preset.heightPx,
        sheetType,
        '#FFFFFF'
      );

      setProcessedBlob(sheetRes.blob);
      setPhotoCount(sheetRes.count);
      setProcessedUrl(URL.createObjectURL(sheetRes.blob));
      onShowToast(`Generated ${sheetRes.count} passport photo(s)!`, 'success');
    } catch (err) {
      onShowToast('Failed to create passport photos.', 'error');
    }

    setIsGenerating(false);
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
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <UserCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upload Front-Facing Portrait Photo
            </h3>
            <p className="text-xs text-slate-500">
              Select country passport specifications & background color for 4x6" print sheet
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Preset Spec */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Country / Specification
                </label>
                <select
                  value={presetIndex}
                  onChange={(e) => setPresetIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {PASSPORT_PRESETS.map((p, i) => (
                    <option key={p.name} value={i}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  {['#FFFFFF', '#F0F4F8', '#1E40AF', '#DC2626'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBgColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-lg border-2 transition ${
                        bgColor === color ? 'border-indigo-600 scale-110' : 'border-slate-300'
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Print Layout */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Print Sheet Layout
                </label>
                <select
                  value={sheetType}
                  onChange={(e: any) => setSheetType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="4x6">4x6 inch Photo Paper Sheet (Multi-Copy)</option>
                  <option value="A4">A4 Full Page Sheet (Max Copies)</option>
                  <option value="single">Single Photo Cutout</option>
                </select>
              </div>
            </div>

            {/* Adjust Head Size & Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Head Zoom Level ({Math.round(scale * 100)}%)
                </span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer mt-1"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Vertical Shift Position
                </span>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  value={offsetY}
                  onChange={(e) => setOffsetY(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer mt-1"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setFile(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Change Photo
              </button>

              <button
                onClick={handleGeneratePassport}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2"
              >
                <Grid className="w-4 h-4" /> Generate Passport Photos
              </button>
            </div>
          </div>

          {/* Generated Result */}
          {processedUrl && (
            <div className="p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Printable Passport Sheet Ready ({photoCount} Photos)
              </h4>

              <div className="flex justify-center">
                <img
                  src={processedUrl}
                  alt="Passport Sheet"
                  className="max-h-80 object-contain rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg bg-white"
                />
              </div>

              <a
                href={processedUrl}
                download={`PixelCraft-Passport-Photos-${sheetType}.jpg`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition"
              >
                <Download className="w-4 h-4" /> Download Printable Sheet ({formatBytes(processedBlob?.size || 0)})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
