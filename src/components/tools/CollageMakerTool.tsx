import React, { useState, useRef } from 'react';
import { Upload, Download, LayoutGrid } from 'lucide-react';
import { loadImageFromFile, canvasToBlob, formatBytes } from '../../lib/imageEngine';

interface CollageMakerToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CollageMakerTool: React.FC<CollageMakerToolProps> = ({ onShowToast }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [layout, setLayout] = useState<'2x1' | '1x2' | '2x2' | '3x3'>('2x2');
  const [spacing, setSpacing] = useState<number>(15);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');

  const [collageBlob, setCollageBlob] = useState<Blob | null>(null);
  const [collageUrl, setCollageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = (fileList: FileList | File[]) => {
    const valid = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...valid]);
  };

  const generateCollage = async () => {
    if (files.length === 0) return;

    try {
      const canvasW = 1600;
      const canvasH = 1600;
      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasW, canvasH);

      let cols = 2, rows = 2;
      if (layout === '2x1') { cols = 2; rows = 1; }
      else if (layout === '1x2') { cols = 1; rows = 2; }
      else if (layout === '3x3') { cols = 3; rows = 3; }

      const slotW = (canvasW - spacing * (cols + 1)) / cols;
      const slotH = (canvasH - spacing * (rows + 1)) / rows;

      let fileIdx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (fileIdx >= files.length) break;
          const img = await loadImageFromFile(files[fileIdx]);

          const x = spacing + c * (slotW + spacing);
          const y = spacing + r * (slotH + spacing);

          // Draw cropped cover inside slot
          const scale = Math.max(slotW / img.naturalWidth, slotH / img.naturalHeight);
          const w = img.naturalWidth * scale;
          const h = img.naturalHeight * scale;
          const ix = x + (slotW - w) / 2;
          const iy = y + (slotH - h) / 2;

          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, slotW, slotH);
          ctx.clip();
          ctx.drawImage(img, ix, iy, w, h);
          ctx.restore();

          fileIdx++;
        }
      }

      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
      setCollageBlob(blob);
      setCollageUrl(URL.createObjectURL(blob));
      onShowToast('Photo collage generated!', 'success');
    } catch (err) {
      onShowToast('Failed to generate collage.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 rounded-3xl p-8 text-center bg-indigo-50/40 dark:bg-slate-900/40 cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            Upload multiple photos ({files.length} selected)
          </p>
          <p className="text-xs text-slate-500">
            Select grid layout, border padding spacing & background color
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Grid Layout
              </label>
              <select
                value={layout}
                onChange={(e: any) => setLayout(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
              >
                <option value="2x2">2x2 Grid (4 Photos)</option>
                <option value="2x1">2x1 Horizontal Split</option>
                <option value="1x2">1x2 Vertical Split</option>
                <option value="3x3">3x3 Grid (9 Photos)</option>
              </select>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Border Spacing ({spacing}px)
              </span>
              <input
                type="range"
                min="0"
                max="40"
                value={spacing}
                onChange={(e) => setSpacing(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Border Background Color
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-9 rounded-xl border cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => setFiles([])} className="text-xs font-bold text-slate-500">
              Clear Photos
            </button>
            <button
              onClick={generateCollage}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              Generate Collage
            </button>
          </div>
        </div>
      )}

      {collageUrl && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-center space-y-4">
          <div className="flex justify-center">
            <img src={collageUrl} alt="Collage" className="max-h-96 object-contain rounded-2xl shadow-xl" />
          </div>
          <a
            href={collageUrl}
            download="PixelCraft-Photo-Collage.jpg"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            <Download className="w-4 h-4" /> Download Collage ({formatBytes(collageBlob?.size || 0)})
          </a>
        </div>
      )}
    </div>
  );
};
