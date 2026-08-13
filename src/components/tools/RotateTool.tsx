import React, { useState, useRef } from 'react';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Download, Upload, Sliders } from 'lucide-react';
import { transformImage, formatBytes, loadImageFromFile } from '../../lib/imageEngine';

interface RotateToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const RotateTool: React.FC<RotateToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [angle, setAngle] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      onShowToast('Please select a valid image file.', 'error');
      return;
    }
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setProcessedUrl(null);
    setProcessedBlob(null);
    setAngle(0);
    setFlipH(false);
    setFlipV(false);
  };

  const handleApplyTransform = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await transformImage(file, { angle, flipH, flipV });
      const url = URL.createObjectURL(res.blob);
      setProcessedUrl(url);
      setProcessedBlob(res.blob);
      onShowToast('Transformation applied successfully!', 'success');
    } catch (err) {
      onShowToast('Failed to rotate/flip image.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl || !processedBlob) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    const ext = file ? file.name.split('.').pop() || 'jpg' : 'jpg';
    a.download = `rotated-image.${ext}`;
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
            <RotateCw className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Upload Image to Rotate or Flip</h3>
          <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WebP, GIF</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                Rotation & Flip Controls
              </h4>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-slate-500 hover:text-rose-600 font-semibold"
              >
                Change Image
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setAngle((prev) => (prev - 90) % 360)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-indigo-600" /> -90° Left
              </button>
              <button
                onClick={() => setAngle((prev) => (prev + 90) % 360)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4 text-indigo-600" /> +90° Right
              </button>
              <button
                onClick={() => setFlipH((prev) => !prev)}
                className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                  flipH ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-800'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" /> Flip Horizontal
              </button>
              <button
                onClick={() => setFlipV((prev) => !prev)}
                className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                  flipV ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-800'
                }`}
              >
                <FlipVertical className="w-4 h-4" /> Flip Vertical
              </button>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Custom Rotation Angle</span>
                <span className="text-indigo-600">{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={(angle + 360) % 360}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleApplyTransform}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                Apply Transformation
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
              style={{
                transform: processedUrl ? 'none' : `rotate(${angle}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                transition: 'transform 0.2s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
