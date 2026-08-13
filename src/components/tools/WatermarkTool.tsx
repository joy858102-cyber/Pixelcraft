import React, { useState, useRef } from 'react';
import { Stamp, Download, Upload, Sliders, Type, Image as ImageIcon } from 'lucide-react';
import { applyWatermark, formatBytes } from '../../lib/imageEngine';

interface WatermarkToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const WatermarkTool: React.FC<WatermarkToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [text, setText] = useState<string>('© PixelCraft Watermark');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [fontSize, setFontSize] = useState<number>(36);
  const [opacity, setOpacity] = useState<number>(0.6);
  const [position, setPosition] = useState<'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right' | 'tile'>('bottom-right');
  const [watermarkImageFile, setWatermarkImageFile] = useState<File | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wmImageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      onShowToast('Please select a valid image file.', 'error');
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setProcessedUrl(null);
    setProcessedBlob(null);
  };

  const handleApplyWatermark = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await applyWatermark(file, {
        mode,
        text,
        textColor,
        fontSize,
        opacity,
        position,
        watermarkImageFile: watermarkImageFile || undefined,
      });
      const url = URL.createObjectURL(res.blob);
      setProcessedUrl(url);
      setProcessedBlob(res.blob);
      onShowToast('Watermark applied successfully!', 'success');
    } catch (err) {
      onShowToast('Failed to apply watermark.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl || !processedBlob) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    const ext = file ? file.name.split('.').pop() || 'jpg' : 'jpg';
    a.download = `watermarked-image.${ext}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 rounded-3xl p-8 text-center bg-indigo-50/40 dark:bg-slate-900/40 cursor-pointer transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Stamp className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Upload Image to Watermark</h3>
          <p className="text-xs text-slate-500 mt-1">Protect your copyright with text or logo overlays</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode('text')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    mode === 'text' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Type className="w-4 h-4" /> Text Watermark
                </button>
                <button
                  onClick={() => setMode('image')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    mode === 'image' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" /> Logo/Image Watermark
                </button>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-slate-500 hover:text-rose-600 font-semibold"
              >
                Change Image
              </button>
            </div>

            {mode === 'text' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Watermark Text</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-9 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Font Size (px)</label>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold mb-1">Upload Watermark Logo (PNG Recommended)</label>
                <input
                  ref={wmImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setWatermarkImageFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Opacity</span>
                  <span>{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Position</label>
                <select
                  value={position}
                  onChange={(e: any) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                  <option value="center">Center</option>
                  <option value="tile">Full Page Tiled Pattern</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleApplyWatermark}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                Apply Watermark
              </button>
              {processedUrl && (
                <button
                  onClick={handleDownload}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> Download Image
                </button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-center items-center min-h-[300px]">
            <img
              src={processedUrl || previewUrl || ''}
              alt="Preview"
              className="max-h-[450px] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
