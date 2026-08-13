import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Sliders,
  FileArchive,
  ArrowRight,
  Eye,
} from 'lucide-react';
import {
  compressImage,
  formatBytes,
  createBatchZip,
  loadImageFromFile,
} from '../../lib/imageEngine';
import { ProcessedImageItem } from '../../types';

interface CompressorToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CompressorTool: React.FC<CompressorToolProps> = ({ onShowToast }) => {
  const [items, setItems] = useState<ProcessedImageItem[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [targetSizeKB, setTargetSizeKB] = useState<number | ''>('');
  const [outputFormat, setOutputFormat] = useState<'original' | 'image/jpeg' | 'image/png' | 'image/webp'>('original');
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonItem, setComparisonItem] = useState<ProcessedImageItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (validFiles.length === 0) {
      onShowToast('Please upload valid image files (JPG, PNG, WebP).', 'error');
      return;
    }

    const newItems: ProcessedImageItem[] = [];
    for (const file of validFiles) {
      try {
        const img = await loadImageFromFile(file);
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          originalSize: file.size,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          originalType: file.type,
          previewUrl: URL.createObjectURL(file),
          status: 'idle',
        });
      } catch (err) {
        console.error(err);
      }
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleCompressAll = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'processing';
      setItems([...updated]);

      try {
        const res = await compressImage(updated[i].file, {
          quality: quality / 100,
          targetSizeKB: typeof targetSizeKB === 'number' ? targetSizeKB : undefined,
          outputFormat,
        });

        updated[i].processedBlob = res.blob;
        updated[i].processedSize = res.blob.size;
        updated[i].processedWidth = res.width;
        updated[i].processedHeight = res.height;
        updated[i].processedUrl = URL.createObjectURL(res.blob);
        updated[i].status = 'done';
      } catch (err: any) {
        updated[i].status = 'error';
        updated[i].errorMessage = err?.message || 'Compression failed';
      }

      setItems([...updated]);
    }

    setIsProcessing(false);
    onShowToast(`Successfully compressed ${items.length} images!`, 'success');
  };

  const handleDownloadSingle = (item: ProcessedImageItem) => {
    if (!item.processedUrl || !item.processedBlob) return;
    const a = document.createElement('a');
    a.href = item.processedUrl;
    const ext = item.processedBlob.type.split('/')[1] || 'jpg';
    const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    a.download = `${nameWithoutExt}-compressed.${ext}`;
    a.click();
  };

  const handleDownloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.processedBlob);
    if (doneItems.length === 0) return;

    try {
      const zipFiles = doneItems.map((item) => {
        const ext = item.processedBlob!.type.split('/')[1] || 'jpg';
        const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
        return {
          name: `${nameWithoutExt}-compressed.${ext}`,
          blob: item.processedBlob!,
        };
      });

      const zipBlob = await createBatchZip(zipFiles);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PixelCraft_Compressed_Images.zip`;
      a.click();
      URL.revokeObjectURL(url);
      onShowToast('ZIP package downloaded successfully!', 'success');
    } catch (err) {
      onShowToast('Failed to create ZIP package.', 'error');
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setItems([]);
    setComparisonItem(null);
  };

  const totalOriginalSize = items.reduce((acc, i) => acc + i.originalSize, 0);
  const totalCompressedSize = items.reduce(
    (acc, i) => acc + (i.processedSize || i.originalSize),
    0
  );
  const totalSavings =
    totalOriginalSize > 0
      ? Math.max(0, Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Dropzone Container */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="relative group border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-3xl p-8 text-center bg-indigo-50/40 dark:bg-slate-900/40 hover:bg-indigo-50/80 dark:hover:bg-slate-900/80 transition-all cursor-pointer overflow-hidden"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
          className="hidden"
          onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Drag & Drop your images here
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              or click to browse from device (JPG, PNG, WebP, GIF, BMP)
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
            🔒 100% Client-Side Privacy • Infinite File Count
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      {items.length > 0 && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Compression Settings
            </h4>
            <span className="text-xs font-semibold text-slate-500">
              {items.length} Image{items.length > 1 ? 's' : ''} Loaded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quality Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span>Quality Level</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-black">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                <span>Max Compression</span>
                <span>Best Quality</span>
              </div>
            </div>

            {/* Target Size KB */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Target File Size (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={targetSizeKB}
                  onChange={(e) => setTargetSizeKB(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">
                  KB
                </span>
              </div>
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e: any) => setOutputFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="original">Keep Original Format</option>
                <option value="image/jpeg">Convert to JPG/JPEG</option>
                <option value="image/webp">Convert to WebP (Recommended)</option>
                <option value="image/png">Convert to PNG</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCompressAll}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Sliders className="w-4 h-4" /> Compress All Images
                  </>
                )}
              </button>

              {items.some((i) => i.status === 'done') && (
                <button
                  onClick={handleDownloadAllZip}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
                >
                  <FileArchive className="w-4 h-4" /> Download ZIP
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Savings Banner */}
      {items.some((i) => i.status === 'done') && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center shrink-0">
              {totalSavings}%
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Total Saved: {formatBytes(totalOriginalSize - totalCompressedSize)} ({totalSavings}%)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Original: {formatBytes(totalOriginalSize)} → Compressed: {formatBytes(totalCompressedSize)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
            >
              {/* Thumbnail & File Name */}
              <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-950"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Original: {formatBytes(item.originalSize)} ({item.originalWidth}x{item.originalHeight})
                  </p>
                </div>
              </div>

              {/* Compressed Stats */}
              {item.status === 'done' && item.processedSize && (
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center sm:text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px]">
                      -{Math.max(0, Math.round(((item.originalSize - item.processedSize) / item.originalSize) * 100))}%
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {formatBytes(item.processedSize)}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {item.status === 'done' && (
                  <>
                    <button
                      onClick={() => setComparisonItem(item)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                      title="Compare Before/After"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadSingle(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {comparisonItem && comparisonItem.processedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Visual Quality Comparison: {comparisonItem.name}
              </h3>
              <button
                onClick={() => setComparisonItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Original ({formatBytes(comparisonItem.originalSize)})
                </p>
                <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[250px]">
                  <img
                    src={comparisonItem.previewUrl}
                    alt="Original"
                    className="max-h-[350px] object-contain rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Compressed ({formatBytes(comparisonItem.processedSize || 0)})
                </p>
                <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[250px]">
                  <img
                    src={comparisonItem.processedUrl}
                    alt="Compressed"
                    className="max-h-[350px] object-contain rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleDownloadSingle(comparisonItem)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Compressed Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
