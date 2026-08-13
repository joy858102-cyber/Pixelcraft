import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Download, Trash2, Check, Crop } from 'lucide-react';
import { canvasToBlob, loadImageFromFile, formatBytes } from '../../lib/imageEngine';

interface SignatureMakerToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SignatureMakerTool: React.FC<SignatureMakerToolProps> = ({ onShowToast }) => {
  const [penColor, setPenColor] = useState<string>('#000000');
  const [penWidth, setPenWidth] = useState<number>(3);
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 700;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTrimmedBlob(null);
    setTrimmedUrl(null);
  };

  const handleExportSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Find bounding box around ink
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    let hasInk = false;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = imgData.data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 10) {
          hasInk = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasInk) {
      onShowToast('Please draw your signature on the pad first.', 'error');
      return;
    }

    // Add padding
    const pad = 15;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(canvas.width, maxX + pad);
    maxY = Math.min(canvas.height, maxY + pad);

    const cropW = maxX - minX;
    const cropH = maxY - minY;

    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = cropW;
    trimmedCanvas.height = cropH;
    const trimmedCtx = trimmedCanvas.getContext('2d')!;

    trimmedCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

    const blob = await canvasToBlob(trimmedCanvas, 'image/png');
    setTrimmedBlob(blob);
    setTrimmedUrl(URL.createObjectURL(blob));
    onShowToast('Transparent signature generated successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Settings Bar */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ink Color
            </span>
            <div className="flex items-center gap-1.5">
              {['#000000', '#1E3A8A', '#DC2626', '#047857'].map((c) => (
                <button
                  key={c}
                  onClick={() => setPenColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-md border transition ${
                    penColor === c ? 'scale-110 ring-2 ring-indigo-500' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pen Weight ({penWidth}px)
            </span>
            <input
              type="range"
              min="1"
              max="10"
              value={penWidth}
              onChange={(e) => setPenWidth(Number(e.target.value))}
              className="accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={handleClear}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 hover:text-rose-600 flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Signature Pad
        </button>
      </div>

      {/* Signature Pad */}
      <div className="flex flex-col items-center justify-center p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-inner">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full max-w-2xl h-60 rounded-2xl bg-white border border-dashed border-slate-300 dark:border-slate-700 cursor-crosshair shadow-sm touch-none"
        />
        <p className="text-[11px] text-slate-400 mt-2">
          Draw your signature inside the box using mouse, stylus, or touchscreen
        </p>
      </div>

      {/* Generate Action */}
      <div className="flex justify-center">
        <button
          onClick={handleExportSignature}
          className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xl shadow-indigo-500/20 flex items-center gap-2 transition"
        >
          <Crop className="w-4 h-4" /> Trim Whitespace & Export Transparent PNG
        </button>
      </div>

      {/* Export Result */}
      {trimmedUrl && (
        <div className="p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" /> Transparent E-Signature Ready
          </h4>

          <div className="flex justify-center p-4 bg-slate-200 dark:bg-slate-800 rounded-2xl inline-block mx-auto">
            <img src={trimmedUrl} alt="E-Signature" className="max-h-24 object-contain" />
          </div>

          <div>
            <a
              href={trimmedUrl}
              download="PixelCraft-E-Signature-Transparent.png"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition"
            >
              <Download className="w-4 h-4" /> Download Transparent Signature PNG ({formatBytes(trimmedBlob?.size || 0)})
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
