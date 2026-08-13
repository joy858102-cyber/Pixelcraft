import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Crop as CropIcon,
  Download,
  RotateCw,
  Circle,
  Square,
  Check,
} from 'lucide-react';
import { cropImage, loadImageFromFile, formatBytes } from '../../lib/imageEngine';

interface CropperToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const ASPECT_RATIOS = [
  { label: 'Free', value: 0 },
  { label: '1:1 Square', value: 1 },
  { label: '16:9 Widescreen', value: 16 / 9 },
  { label: '4:3 Standard', value: 4 / 3 },
  { label: '9:16 Story', value: 9 / 16 },
  { label: 'Passport 2x2"', value: 1 },
  { label: 'Schengen 35x45', value: 35 / 45 },
];

export const CropperTool: React.FC<CropperToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [isCircle, setIsCircle] = useState<boolean>(false);
  const [angle, setAngle] = useState<number>(0);

  // Crop selection coordinates (relative to original image pixels)
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 500,
    h: 500,
  });

  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleFileChange = async (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    try {
      const img = await loadImageFromFile(f);
      setImgElement(img);
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      setCropRect({
        x: Math.round((img.naturalWidth - minDim * 0.8) / 2),
        y: Math.round((img.naturalHeight - minDim * 0.8) / 2),
        w: Math.round(minDim * 0.8),
        h: Math.round(minDim * 0.8),
      });
      setCroppedBlob(null);
      setCroppedUrl(null);
    } catch (err) {
      onShowToast('Failed to load image.', 'error');
    }
  };

  // Draw crop preview canvas
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Scale canvas to fit container smoothly
    const containerWidth = Math.min(650, window.innerWidth - 64);
    const scale = containerWidth / imgElement.naturalWidth;
    canvas.width = containerWidth;
    canvas.height = imgElement.naturalHeight * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rotated image
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(
      imgElement,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
    ctx.restore();

    // Dark overlay mask
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop window
    const cx = cropRect.x * scale;
    const cy = cropRect.y * scale;
    const cw = cropRect.w * scale;
    const ch = cropRect.h * scale;

    ctx.save();
    if (isCircle) {
      ctx.beginPath();
      ctx.arc(cx + cw / 2, cy + ch / 2, Math.min(cw, ch) / 2, 0, Math.PI * 2);
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.rect(cx, cy, cw, ch);
      ctx.clip();
    }

    // Draw sharp image inside crop window
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(
      imgElement,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
    ctx.restore();

    // Crop border grid
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    if (isCircle) {
      ctx.beginPath();
      ctx.arc(cx + cw / 2, cy + ch / 2, Math.min(cw, ch) / 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(cx, cy, cw, ch);
      // 3x3 Grid guidelines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + cw / 3, cy); ctx.lineTo(cx + cw / 3, cy + ch);
      ctx.moveTo(cx + (2 * cw) / 3, cy); ctx.lineTo(cx + (2 * cw) / 3, cy + ch);
      ctx.moveTo(cx, cy + ch / 3); ctx.lineTo(cx + cw, cy + ch / 3);
      ctx.moveTo(cx, cy + (2 * ch) / 3); ctx.lineTo(cx + cw, cy + (2 * ch) / 3);
      ctx.stroke();
    }
  }, [imgElement, cropRect, isCircle, angle]);

  const handleApplyCrop = async () => {
    if (!file) return;
    setIsCropping(true);
    try {
      const res = await cropImage(
        file,
        {
          x: Math.max(0, Math.round(cropRect.x)),
          y: Math.max(0, Math.round(cropRect.y)),
          width: Math.round(cropRect.w),
          height: Math.round(cropRect.h),
        },
        { isCircle, format: isCircle ? 'image/png' : 'image/jpeg' }
      );
      setCroppedBlob(res.blob);
      setCroppedUrl(URL.createObjectURL(res.blob));
      onShowToast('Image cropped successfully!', 'success');
    } catch (err) {
      onShowToast('Crop operation failed.', 'error');
    }
    setIsCropping(false);
  };

  const setRatioPreset = (ratio: number) => {
    setAspectRatio(ratio);
    if (!imgElement) return;
    if (ratio === 0) return; // Free

    let w = cropRect.w;
    let h = Math.round(w / ratio);
    if (h > imgElement.naturalHeight) {
      h = imgElement.naturalHeight * 0.8;
      w = Math.round(h * ratio);
    }
    setCropRect((prev) => ({ ...prev, w, h }));
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
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
              <CropIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upload photo to crop
            </h3>
            <p className="text-xs text-slate-500">
              Supports interactive crop framing, aspect ratio presets & circular avatars
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCircle(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    !isCircle ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Square className="w-3.5 h-3.5" /> Rectangle
                </button>
                <button
                  onClick={() => setIsCircle(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isCircle ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Circle className="w-3.5 h-3.5" /> Circular Avatar
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAngle((prev) => (prev + 90) % 360)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                </button>
                <button
                  onClick={() => setFile(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-rose-600"
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* Aspect Ratio Presets */}
            {!isCircle && (
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2">Aspect Ratio Presets:</p>
                <div className="flex flex-wrap gap-2">
                  {ASPECT_RATIOS.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setRatioPreset(r.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        aspectRatio === r.value
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Canvas Interactive Area */}
          <div className="flex flex-col items-center justify-center p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
            <canvas ref={canvasRef} className="max-w-full rounded-2xl cursor-crosshair shadow-2xl" />
            <p className="text-[11px] text-slate-400 mt-3 font-medium">
              Target Dimensions: {cropRect.w} × {cropRect.h} px
            </p>
          </div>

          {/* Action Row */}
          <div className="flex justify-center">
            <button
              onClick={handleApplyCrop}
              disabled={isCropping}
              className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 flex items-center gap-2 transition"
            >
              <Check className="w-5 h-5" /> Crop Image Now
            </button>
          </div>

          {/* Cropped Output Display */}
          {croppedUrl && (
            <div className="p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Cropped Output Ready ({cropRect.w}x{cropRect.h} px)
              </h4>

              <div className="flex justify-center p-2">
                <img
                  src={croppedUrl}
                  alt="Cropped Result"
                  className="max-h-64 object-contain rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900"
                />
              </div>

              <a
                href={croppedUrl}
                download={`PixelCraft-cropped-${isCircle ? 'avatar.png' : 'image.jpg'}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition"
              >
                <Download className="w-4 h-4" /> Download Cropped Image ({formatBytes(croppedBlob?.size || 0)})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
