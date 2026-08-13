import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Smile, RefreshCw } from 'lucide-react';
import { loadImageFromFile, canvasToBlob, formatBytes } from '../../lib/imageEngine';

interface MemeGeneratorToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const MemeGeneratorTool: React.FC<MemeGeneratorToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [topText, setTopText] = useState<string>('WHEN THE CODE');
  const [bottomText, setBottomText] = useState<string>('WORKS ON THE FIRST TRY');
  const [fontSize, setFontSize] = useState<number>(42);
  const [uppercase, setUppercase] = useState<boolean>(true);

  const [memeBlob, setMemeBlob] = useState<Blob | null>(null);
  const [memeUrl, setMemeUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!file) return;
    renderMeme();
  }, [file, topText, bottomText, fontSize, uppercase]);

  const renderMeme = async () => {
    if (!file) return;
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;

      ctx.drawImage(img, 0, 0);

      // Meme Impact font style
      const size = Math.round((canvas.width / 500) * fontSize);
      ctx.font = `900 ${size}px Impact, sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(3, Math.round(size / 8));
      ctx.textAlign = 'center';

      // Top Text
      if (topText) {
        const text = uppercase ? topText.toUpperCase() : topText;
        ctx.strokeText(text, canvas.width / 2, size + 20);
        ctx.fillText(text, canvas.width / 2, size + 20);
      }

      // Bottom Text
      if (bottomText) {
        const text = uppercase ? bottomText.toUpperCase() : bottomText;
        ctx.strokeText(text, canvas.width / 2, canvas.height - 30);
        ctx.fillText(text, canvas.width / 2, canvas.height - 30);
      }

      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
      setMemeBlob(blob);
      setMemeUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    }
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
              <Smile className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upload Image for Meme
            </h3>
            <p className="text-xs text-slate-500">
              Add Top & Bottom text with bold Impact font & black stroke outlines
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Top Text
                </label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bottom Text
                </label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Font Size ({fontSize}px)
                </span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <button
                onClick={() => setFile(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600"
              >
                Change Image
              </button>
            </div>
          </div>

          {/* Meme Preview */}
          {memeUrl && (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-center space-y-4">
              <div className="flex justify-center">
                <img
                  src={memeUrl}
                  alt="Meme Preview"
                  className="max-h-96 object-contain rounded-2xl shadow-xl border border-slate-800"
                />
              </div>

              <a
                href={memeUrl}
                download="PixelCraft-Meme.jpg"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition"
              >
                <Download className="w-4 h-4" /> Download Meme ({formatBytes(memeBlob?.size || 0)})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
