import React, { useState, useRef } from 'react';
import { FileText, Download, Upload, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { convertImagesToPDF, formatBytes } from '../../lib/imageEngine';

interface PdfConverterToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const PdfConverterTool: React.FC<PdfConverterToolProps> = ({ onShowToast }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [marginMm, setMarginMm] = useState<number>(10);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = (addedFiles: FileList | File[]) => {
    const valid = Array.from(addedFiles).filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) {
      onShowToast('Please upload valid image files.', 'error');
      return;
    }
    setFiles((prev) => [...prev, ...valid]);
    setPdfBlob(null);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPdfBlob(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === files.length - 1)
    ) {
      return;
    }
    const newFiles = [...files];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIdx];
    newFiles[targetIdx] = temp;
    setFiles(newFiles);
    setPdfBlob(null);
  };

  const handleGeneratePdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const blob = await convertImagesToPDF(files, { pageSize, marginMm });
      setPdfBlob(blob);
      onShowToast('PDF generated successfully!', 'success');
    } catch (err) {
      onShowToast('Failed to generate PDF document.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PixelCraft_Document.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 rounded-3xl p-8 text-center bg-indigo-50/40 dark:bg-slate-900/40 cursor-pointer transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
        />
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Convert Images to PDF</h3>
        <p className="text-xs text-slate-500 mt-1">Combine multiple photos into a single PDF document</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">PDF Options</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e: any) => setPageSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                >
                  <option value="a4">Standard A4</option>
                  <option value="letter">US Letter</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Margin (mm)</label>
                <input
                  type="number"
                  value={marginMm}
                  onChange={(e) => setMarginMm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleGeneratePdf}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                {isProcessing ? 'Generating PDF...' : 'Generate PDF'}
              </button>
              {pdfBlob && (
                <button
                  onClick={handleDownloadPdf}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> Download PDF ({formatBytes(pdfBlob.size)})
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-500 uppercase">Page Sequence ({files.length} pages)</h5>
            {files.map((f, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{f.name}</p>
                    <p className="text-[11px] text-slate-400">{formatBytes(f.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === files.length - 1}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
