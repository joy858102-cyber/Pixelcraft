import React, { useState, useRef } from 'react';
import { Upload, Download, Globe, Copy, Check, FileArchive } from 'lucide-react';
import { generateFaviconZip, formatBytes } from '../../lib/imageEngine';

interface FaviconGeneratorToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const FaviconGeneratorTool: React.FC<FaviconGeneratorToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [htmlSnippet, setHtmlSnippet] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));

    setIsGenerating(true);
    try {
      const res = await generateFaviconZip(f);
      setZipBlob(res.zipBlob);
      setHtmlSnippet(res.htmlCode);
      onShowToast('Favicon package generated!', 'success');
    } catch (err) {
      onShowToast('Failed to generate favicon package.', 'error');
    }
    setIsGenerating(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopied(true);
    onShowToast('HTML tags copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favicon-package.zip';
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
              <Globe className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upload Square Logo or Icon
            </h3>
            <p className="text-xs text-slate-500">
              Generates 16x16, 32x32, 180x180 Apple Touch Icons & Ready HTML Code
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Browser Mock Preview */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Browser Tab Live Mock Preview:
            </h4>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-w-sm">
              <img src={previewUrl!} alt="Favicon preview" className="w-4 h-4 object-contain rounded-xs" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                My Website — Google AI Studio
              </span>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => setFile(null)}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600"
              >
                Change Logo
              </button>

              <button
                onClick={handleDownloadZip}
                disabled={!zipBlob}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2"
              >
                <FileArchive className="w-4 h-4" /> Download Complete Favicon ZIP ({formatBytes(zipBlob?.size || 0)})
              </button>
            </div>
          </div>

          {/* HTML Code Snippet */}
          {htmlSnippet && (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400">
                  HTML &lt;head&gt; Snippet
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                {htmlSnippet}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
