export type ToolCategory =
  | 'compress'
  | 'resize'
  | 'convert'
  | 'edit'
  | 'create'
  | 'pdf'
  | 'utilities';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ToolMeta {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  category: ToolCategory;
  iconName: string;
  popular?: boolean;
  featured?: boolean;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  h1Title: string;
  aboutText: string;
  steps: string[];
  faqs: FAQItem[];
  relatedToolIds: string[];
}

export interface ProcessedImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalType: string;
  previewUrl: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  processedSize?: number;
  processedWidth?: number;
  processedHeight?: number;
  processedUrl?: string;
  processedBlob?: Blob;
  errorMessage?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
