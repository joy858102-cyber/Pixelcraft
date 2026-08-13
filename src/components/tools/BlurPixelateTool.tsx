import React, { useState, useRef } from 'react';
import { EyeOff, Download, Upload, Sliders } from 'lucide-react';
import { applyFilter, formatBytes } from '../../lib/imageEngine';

interface BlurPixelateToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const BlurPixelateTool: React.FC<BlurPixelateToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'blur' | 'pixelate'>('blur');
  const [amount, setAmount] = useState<number>(10);

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

  const handleApplyFilter = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await applyFilter(file, { filterType, amount });
      const url = URL.createObjectURL(res.blob);
      setProcessedUrl(url);
      setProcessedBlob(res.blob);
      onShowToast(`Applied ${filterType} filter!`, 'success');
    } catch (err) {
      onShowToast(`Failed to apply ${filterType}.`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl || !processedBlob) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    const ext = file ? file.name.split('.').pop() || 'jpg' : 'jpg';
    a.download = `censored-image.${ext}`;
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
            <EyeOff className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Upload Image to Blur or Pixelate</h3>
          <p className="text-xs text-slate-500 mt-1">Censor sensitive details or create privacy filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterType('blur')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    filterType === 'blur' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Gaussian Blur
                </button>
                <button
                  onClick={() => setFilterType('pixelate')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    filterType === 'pixelate' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Pixelate Mosaic
                </button>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-slate-500 hover:text-rose-600 font-semibold"
              >
                Change Image
              </button>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Filter Intensity</span>
                <span>{amount}</span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleApplyFilter}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                Apply Filter
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
