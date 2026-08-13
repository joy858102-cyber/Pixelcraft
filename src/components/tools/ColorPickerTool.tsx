import React, { useState, useRef, useEffect } from 'react';
import { Upload, Pipette, Copy, Check } from 'lucide-react';
import { loadImageFromFile } from '../../lib/imageEngine';

interface ColorPickerToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ColorPickerTool: React.FC<ColorPickerToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pickedColor, setPickedColor] = useState<string>('#6366F1');
  const [copied, setCopied] = useState<boolean>(false);
  const [palette, setPalette] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = async (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    try {
      const img = await loadImageFromFile(f);
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      // Extract dominant 6 color swatches
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const swatches: string[] = [];
      const step = Math.floor(imgData.length / 24);

      for (let i = 0; i < imgData.length && swatches.length < 6; i += step) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        if (!swatches.includes(hex)) swatches.push(hex);
      }

      setPalette(swatches);
      if (swatches.length > 0) setPickedColor(swatches[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
    setPickedColor(hex);
  };

  const handleCopyColor = (colorHex: string) => {
    navigator.clipboard.writeText(colorHex);
    setCopied(true);
    onShowToast(`Copied ${colorHex} to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2000);
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
              <Pipette className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upload Image to Pick Colors & Extract Palette
            </h3>
            <p className="text-xs text-slate-500">
              Click anywhere on the photo to sample pixel color HEX/RGB codes
            </p>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          {/* Color Display Bar */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div
                style={{ backgroundColor: pickedColor }}
                className="w-14 h-14 rounded-2xl border-2 border-white dark:border-slate-800 shadow-md"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sampled Color
                </span>
                <p className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  {pickedColor}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleCopyColor(pickedColor)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy HEX Code'}
            </button>
          </div>

          {/* Auto Palette Swatches */}
          {palette.length > 0 && (
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Dominant Color Palette:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {palette.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleCopyColor(color)}
                    style={{ backgroundColor: color }}
                    className="flex-1 min-w-[70px] h-12 rounded-xl border border-white/20 shadow-xs flex items-end justify-center pb-1 text-[10px] font-mono font-bold text-white drop-shadow-md hover:scale-105 transition"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Canvas */}
          <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="max-h-[500px] object-contain rounded-2xl cursor-crosshair shadow-xl"
            />
            <p className="text-[11px] text-slate-400 mt-3 font-medium">
              Click anywhere on the photo above to pick that exact pixel color
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
