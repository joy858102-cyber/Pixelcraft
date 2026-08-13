import React, { useState, useRef } from 'react';
import { Upload, Download, Trash2, RefreshCw, FileArchive } from 'lucide-react';
import { compressImage, formatBytes, createBatchZip, loadImageFromFile } from '../../lib/imageEngine';
import { ProcessedImageItem } from '../../types';

interface GenericBatchToolProps {
  toolId: string;
  defaultOutputMime?: string;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const GenericBatchTool: React.FC<GenericBatchToolProps> = ({
  toolId,
  defaultOutputMime = 'image/jpeg',
  onShowToast,
}) => {
  const [items, setItems] = useState<ProcessedImageItem[]>([]);
  const [targetMime, setTargetMime] = useState<string>(defaultOutputMime);
  const [quality, setQuality] = useState<number>(85);
  const [fillColor, setFillColor] = useState<string>('#FFFFFF');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

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

  const handleConvertAll = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'processing';
      setItems([...updated]);

      try {
        const res = await compressImage(updated[i].file, {
          quality: quality / 100,
          outputFormat: targetMime as any,
        });

        updated[i].processedBlob = res.blob;
        updated[i].processedSize = res.blob.size;
        updated[i].processedWidth = res.width;
        updated[i].processedHeight = res.height;
        updated[i].processedUrl = URL.createObjectURL(res.blob);
        updated[i].status = 'done';
      } catch (err) {
        updated[i].status = 'error';
      }

      setItems([...updated]);
    }

    setIsProcessing(false);
    onShowToast(`Successfully converted ${items.length} files!`, 'success');
  };

  const handleDownloadSingle = (item: ProcessedImageItem) => {
    if (!item.processedUrl || !item.processedBlob) return;
    const a = document.createElement('a');
    a.href = item.processedUrl;
    const ext = item.processedBlob.type.split('/')[1] || 'jpg';
    const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    a.download = `${nameWithoutExt}-converted.${ext}`;
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
          name: `${nameWithoutExt}-converted.${ext}`,
          blob: item.processedBlob!,
        };
      });

      const zipBlob = await createBatchZip(zipFiles);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PixelCraft_Converted_Batch.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      onShowToast('Failed to create ZIP package.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 rounded-3xl p-8 text-center bg-indigo-50/40 dark:bg-slate-900/40 cursor-pointer transition"
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
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Upload images to convert
          </h3>
          <p className="text-xs text-slate-500">
            Batch convert JPG, PNG, WebP, GIF, or BMP files instantly in browser
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      {items.length > 0 && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Output Format
              </label>
              <select
                value={targetMime}
                onChange={(e) => setTargetMime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="image/jpeg">JPG / JPEG Photo</option>
                <option value="image/png">PNG Graphics (Alpha Transparent)</option>
                <option value="image/webp">WebP Modern Web Format</option>
              </select>
            </div>

            {targetMime === 'image/jpeg' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Background Fill for Transparent Pixels
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    {fillColor}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setItems([])}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Clear All
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleConvertAll}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Converting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Convert All Files
                  </>
                )}
              </button>

              {items.some((i) => i.status === 'done') && (
                <button
                  onClick={handleDownloadAllZip}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2"
                >
                  <FileArchive className="w-4 h-4" /> Download ZIP
                </button>
              )}
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
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatBytes(item.originalSize)} ({item.originalWidth}x{item.originalHeight})
                  </p>
                </div>
              </div>

              {item.status === 'done' && (
                <div className="flex items-center gap-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Converted: {formatBytes(item.processedSize || 0)}</span>
                  <button
                    onClick={() => handleDownloadSingle(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
