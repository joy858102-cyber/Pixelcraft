import React, { useState, useRef } from 'react';
import { Upload, Download, Grid, FileArchive } from 'lucide-react';
import { splitImageGrid, formatBytes } from '../../lib/imageEngine';

interface ImageSplitterToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ImageSplitterTool: React.FC<ImageSplitterToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [tileCount, setTileCount] = useState<number>(0);
  const [isSplitting, setIsSplitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setZipBlob(null);
  };

  const handleSplitGrid = async () => {
    if (!file) return;
    setIsSplitting(true);
    try {
      const res = await splitImageGrid(file, rows, cols);
      setZipBlob(res.zipBlob);
      setTileCount(res.tiles.length);
      onShowToast(`Image sliced into ${res.tiles.length} grid tiles!`, 'success');
    } catch (err) {
      onShowToast('Failed to slice image.', 'error');
    }
    setIsSplitting(false);
  };

  const handleDownloadZip = () => {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PixelCraft_Grid_Split_${rows}x${cols}.zip`;
    a.click();
    URL.revokeObjectURL(url);
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
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Grid className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upload Image to Slice into Tiles
            </h3>
            <p className="text-xs text-slate-500">
              Split into 3x3 Instagram Grid Banners, panoramic carousels or puzzle tiles
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rows (Vertical Slices)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Columns (Horizontal Slices)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button onClick={() => setFile(null)} className="text-xs font-bold text-slate-500">
                Change Image
              </button>

              <button
                onClick={handleSplitGrid}
                disabled={isSplitting}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Split into {rows * cols} Tiles
              </button>
            </div>
          </div>

          {zipBlob && (
            <div className="p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-4">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                ✓ Generated {tileCount} Image Tiles in ZIP Package
              </p>
              <button
                onClick={handleDownloadZip}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                <FileArchive className="w-4 h-4" /> Download Tiles ZIP ({formatBytes(zipBlob.size)})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
