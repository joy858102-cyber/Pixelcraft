import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Lock,
  Unlock,
  Maximize2,
  FileArchive,
} from 'lucide-react';
import {
  resizeImage,
  formatBytes,
  createBatchZip,
  loadImageFromFile,
} from '../../lib/imageEngine';
import { ProcessedImageItem } from '../../types';

interface ResizerToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const PRESETS = [
  { name: 'Full HD 1080p', width: 1920, height: 1080 },
  { name: 'HD 720p', width: 1280, height: 720 },
  { name: '4K Ultra HD', width: 3840, height: 2160 },
  { name: 'Instagram Square', width: 1080, height: 1080 },
  { name: 'Instagram Story/Reel', width: 1080, height: 1920 },
  { name: 'Facebook Banner', width: 1200, height: 630 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'Twitter Header', width: 1500, height: 500 },
];

export const ResizerTool: React.FC<ResizerToolProps> = ({ onShowToast }) => {
  const [items, setItems] = useState<ProcessedImageItem[]>([]);
  const [resizeMode, setResizeMode] = useState<'pixels' | 'percentage'>('pixels');
  const [targetWidth, setTargetWidth] = useState<number>(1280);
  const [targetHeight, setTargetHeight] = useState<number>(720);
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [percentage, setPercentage] = useState<number>(50);
  const [outputFormat, setOutputFormat] = useState<string>('image/jpeg');
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

    if (newItems.length > 0 && items.length === 0) {
      setTargetWidth(newItems[0].originalWidth);
      setTargetHeight(newItems[0].originalHeight);
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockRatio && items.length > 0) {
      const aspect = items[0].originalWidth / items[0].originalHeight;
      setTargetHeight(Math.round(w / aspect));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockRatio && items.length > 0) {
      const aspect = items[0].originalWidth / items[0].originalHeight;
      setTargetWidth(Math.round(h * aspect));
    }
  };

  const applyPreset = (presetW: number, presetH: number) => {
    setTargetWidth(presetW);
    setTargetHeight(presetH);
    setResizeMode('pixels');
  };

  const handleResizeAll = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'processing';
      setItems([...updated]);

      try {
        let finalW = targetWidth;
        let finalH = targetHeight;

        if (resizeMode === 'percentage') {
          finalW = Math.round((updated[i].originalWidth * percentage) / 100);
          finalH = Math.round((updated[i].originalHeight * percentage) / 100);
        }

        const res = await resizeImage(updated[i].file, {
          width: finalW,
          height: finalH,
          format: outputFormat,
        });

        updated[i].processedBlob = res.blob;
        updated[i].processedSize = res.blob.size;
        updated[i].processedWidth = res.width;
        updated[i].processedHeight = res.height;
        updated[i].processedUrl = URL.createObjectURL(res.blob);
        updated[i].status = 'done';
      } catch (err: any) {
        updated[i].status = 'error';
      }

      setItems([...updated]);
    }

    setIsProcessing(false);
    onShowToast(`Successfully resized ${items.length} images!`, 'success');
  };

  const handleDownloadSingle = (item: ProcessedImageItem) => {
    if (!item.processedUrl || !item.processedBlob) return;
    const a = document.createElement('a');
    a.href = item.processedUrl;
    const ext = item.processedBlob.type.split('/')[1] || 'jpg';
    const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    a.download = `${nameWithoutExt}-resized.${ext}`;
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
          name: `${nameWithoutExt}-resized.${ext}`,
          blob: item.processedBlob!,
        };
      });

      const zipBlob = await createBatchZip(zipFiles);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PixelCraft_Resized_Images.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      onShowToast('Failed to generate ZIP file.', 'error');
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
            <Maximize2 className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white">
            Upload images to resize
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set exact pixel dimensions, scaling percentage, or resolution presets
          </p>
        </div>
      </div>

      {/* Resize Controls */}
      {items.length > 0 && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-sm">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <button
              onClick={() => setResizeMode('pixels')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                resizeMode === 'pixels'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Exact Pixels (px)
            </button>
            <button
              onClick={() => setResizeMode('percentage')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                resizeMode === 'percentage'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Percentage Scale (%)
            </button>
          </div>

          {/* Pixels Mode Controls */}
          {resizeMode === 'pixels' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLockRatio(!lockRatio)}
                    className={`p-2.5 rounded-xl border mt-5 transition ${
                      lockRatio
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-400'
                        : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                    }`}
                    title={lockRatio ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'}
                  >
                    {lockRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>

                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Presets List */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2">Popular Presets:</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p.width, p.height)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-indigo-500 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition"
                    >
                      {p.name} ({p.width}x{p.height})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Percentage Mode Controls */
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span>Scale Ratio</span>
                <span className="text-indigo-600 dark:text-indigo-400">{percentage}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                <span>10% (Smaller)</span>
                <span>100% (Original)</span>
                <span>200% (Enlarge)</span>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setItems([])}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Clear All
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResizeAll}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Resizing...
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" /> Resize All Images
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
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4"
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
                    Original: {item.originalWidth}x{item.originalHeight} px ({formatBytes(item.originalSize)})
                  </p>
                </div>
              </div>

              {item.status === 'done' && (
                <div className="flex items-center gap-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>
                    New: {item.processedWidth}x{item.processedHeight} px ({formatBytes(item.processedSize || 0)})
                  </span>
                  <button
                    onClick={() => handleDownloadSingle(item)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1"
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
