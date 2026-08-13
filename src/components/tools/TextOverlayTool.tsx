import React, { useState, useRef } from 'react';
import { Type, Download, Upload, Sliders } from 'lucide-react';
import { applyWatermark, formatBytes } from '../../lib/imageEngine';

interface TextOverlayToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TextOverlayTool: React.FC<TextOverlayToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState<string>('Sample Caption');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [fontSize, setFontSize] = useState<number>(48);
  const [position, setPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleApplyText = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await applyWatermark(file, {
        mode: 'text',
        text,
        textColor,
        fontSize,
        opacity: 1.0,
        position,
      });
      const url = URL.createObjectURL(res.blob);
      setProcessedUrl(url);
      setProcessedBlob(res.blob);
      onShowToast('Text added to image successfully!', 'success');
    } catch (err) {
      onShowToast('Failed to add text to image.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl || !processedBlob) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    const ext = file ? file.name.split('.').pop() || 'jpg' : 'jpg';
    a.download = `captioned-image.${ext}`;
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
            <Type className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Upload Image to Add Text</h3>
          <p className="text-xs text-slate-500 mt-1">Add captions, quotes, and typography to graphics</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                Text Options
              </h4>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-slate-500 hover:text-rose-600 font-semibold"
              >
                Change Image
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-1">Text Content</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-9 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Size (px)</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Position</label>
              <select
                value={position}
                onChange={(e: any) => setPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              >
                <option value="center">Center</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleApplyText}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                Add Text
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
