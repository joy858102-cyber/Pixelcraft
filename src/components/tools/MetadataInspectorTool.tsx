import React, { useState } from 'react';
import { Upload, Download, Info, ShieldCheck, Check } from 'lucide-react';
import { inspectImageMetadata, stripImageMetadata, ImageExifData } from '../../lib/exifUtils';
import { formatBytes } from '../../lib/imageEngine';

interface MetadataInspectorToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const MetadataInspectorTool: React.FC<MetadataInspectorToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [exifData, setExifData] = useState<ImageExifData | null>(null);
  const [strippedBlob, setStrippedBlob] = useState<Blob | null>(null);
  const [strippedUrl, setStrippedUrl] = useState<string | null>(null);

  const handleFileChange = async (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    setStrippedBlob(null);
    setStrippedUrl(null);

    try {
      const data = await inspectImageMetadata(f);
      setExifData(data);
    } catch (err) {
      onShowToast('Could not parse metadata.', 'error');
    }
  };

  const handleStripMetadata = async () => {
    if (!file) return;
    try {
      const blob = await stripImageMetadata(file);
      setStrippedBlob(blob);
      setStrippedUrl(URL.createObjectURL(blob));
      onShowToast('All metadata & GPS tags removed!', 'success');
    } catch (err) {
      onShowToast('Failed to strip metadata.', 'error');
    }
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
              <Info className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upload Photo to Inspect EXIF Metadata
            </h3>
            <p className="text-xs text-slate-500">
              View camera parameters & 1-click strip tracking metadata for privacy
            </p>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          {exifData && (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500" /> EXIF Metadata Analysis: {exifData.filename}
                </h4>
                <button onClick={() => setFile(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                  Change Photo
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Dimensions</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{exifData.width} × {exifData.height} px</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Megapixels</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{exifData.megapixels}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Aspect Ratio</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{exifData.aspectRatio}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">File Size</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{exifData.filesize}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleStripMetadata}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Strip All EXIF & GPS Tags
                </button>
              </div>
            </div>
          )}

          {strippedUrl && (
            <div className="p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" /> Clean Photo Ready (Metadata Removed)
              </p>
              <a
                href={strippedUrl}
                download={`PixelCraft-clean-${file.name}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" /> Download Privacy-Clean Photo ({formatBytes(strippedBlob?.size || 0)})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
