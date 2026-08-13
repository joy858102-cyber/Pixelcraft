import React, { useState } from 'react';
import { Upload, Copy, Check, Code } from 'lucide-react';

interface Base64ConverterToolProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const Base64ConverterTool: React.FC<Base64ConverterToolProps> = ({ onShowToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [base64String, setBase64String] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileChange = (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      setBase64String(reader.result as string);
      onShowToast('Converted to Base64 string!', 'success');
    };
    reader.readAsDataURL(f);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(base64String);
    setCopied(true);
    onShowToast('Base64 string copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
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
              <Code className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upload Image to Convert to Base64 Data URI
            </h3>
            <p className="text-xs text-slate-500">
              Generates clean data:image Base64 strings for CSS/HTML inline embeds
            </p>
          </div>
        </label>
      ) : (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-500" /> Base64 Data String
            </h4>
            <button onClick={() => setFile(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
              Change File
            </button>
          </div>

          <textarea
            readOnly
            value={base64String}
            rows={8}
            className="w-full p-4 rounded-2xl bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800 focus:outline-none"
          />

          <div className="flex justify-end">
            <button
              onClick={handleCopy}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Base64 Code'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
