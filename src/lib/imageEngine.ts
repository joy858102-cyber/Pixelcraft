import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

/**
 * Loads an HTMLImageElement from a File or Blob.
 */
export function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file: ' + err));
    };
    img.src = url;
  });
}

/**
 * Converts a Canvas to Blob with specified mime type and quality.
 */
export function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string = 'image/jpeg', quality: number = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas blob generation failed'));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Formats byte size into human readable string (e.g. 1.2 MB or 450 KB).
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Advanced Image Compression Algorithm with optional target size binary search.
 */
export async function compressImage(
  file: File,
  options: {
    quality?: number; // 0.1 to 1.0
    targetSizeKB?: number;
    outputFormat?: 'original' | 'image/jpeg' | 'image/png' | 'image/webp';
    maxWidth?: number;
    maxHeight?: number;
  }
): Promise<{ blob: Blob; width: number; height: number; format: string }> {
  const img = await loadImageFromFile(file);
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  // Scale down if max dimensions specified
  if (options.maxWidth && width > options.maxWidth) {
    height = Math.round((height * options.maxWidth) / width);
    width = options.maxWidth;
  }
  if (options.maxHeight && height > options.maxHeight) {
    width = Math.round((width * options.maxHeight) / height);
    height = options.maxHeight;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Determine target MIME format
  let targetMime = file.type || 'image/jpeg';
  if (options.outputFormat && options.outputFormat !== 'original') {
    targetMime = options.outputFormat;
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(targetMime)) {
    targetMime = 'image/jpeg';
  }

  // Draw background if converting transparent PNG/WebP to JPEG
  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  // If Target File Size is set, perform binary search for optimal quality
  if (options.targetSizeKB && options.targetSizeKB > 0 && targetMime !== 'image/png') {
    const targetBytes = options.targetSizeKB * 1024;
    let minQ = 0.05;
    let maxQ = 0.98;
    let bestBlob: Blob | null = null;

    for (let i = 0; i < 6; i++) {
      const midQ = (minQ + maxQ) / 2;
      const b = await canvasToBlob(canvas, targetMime, midQ);
      bestBlob = b;
      if (b.size > targetBytes) {
        maxQ = midQ;
      } else {
        minQ = midQ;
      }
    }
    return { blob: bestBlob || (await canvasToBlob(canvas, targetMime, 0.8)), width, height, format: targetMime };
  }

  const quality = options.quality ?? 0.82;
  const blob = await canvasToBlob(canvas, targetMime, quality);
  return { blob, width, height, format: targetMime };
}

/**
 * Image Resizer Engine
 */
export async function resizeImage(
  file: File,
  options: {
    width: number;
    height: number;
    format?: string;
    quality?: number;
    fillColor?: string;
  }
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext('2d')!;

  const mime = options.format || file.type || 'image/jpeg';
  if (mime === 'image/jpeg') {
    ctx.fillStyle = options.fillColor || '#FFFFFF';
    ctx.fillRect(0, 0, options.width, options.height);
  }

  // Quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, options.width, options.height);

  const blob = await canvasToBlob(canvas, mime, options.quality ?? 0.9);
  return { blob, width: options.width, height: options.height };
}

/**
 * Image Cropper Engine
 */
export async function cropImage(
  file: File,
  cropArea: { x: number; y: number; width: number; height: number },
  options: {
    isCircle?: boolean;
    format?: string;
    quality?: number;
  }
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
  const ctx = canvas.getContext('2d')!;

  const mime = options.format || (options.isCircle ? 'image/png' : file.type || 'image/jpeg');

  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, cropArea.width, cropArea.height);
  }

  if (options.isCircle) {
    ctx.beginPath();
    ctx.arc(cropArea.width / 2, cropArea.height / 2, Math.min(cropArea.width, cropArea.height) / 2, 0, Math.PI * 2);
    ctx.clip();
  }

  ctx.drawImage(
    img,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  const blob = await canvasToBlob(canvas, mime, options.quality ?? 0.92);
  return { blob, width: cropArea.width, height: cropArea.height };
}

/**
 * Rotate & Flip Engine
 */
export async function transformImage(
  file: File,
  options: {
    angle: number; // degrees
    flipH: boolean;
    flipV: boolean;
    format?: string;
    quality?: number;
  }
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const rad = (options.angle * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));

  const newWidth = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
  const newHeight = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d')!;

  const mime = options.format || file.type || 'image/jpeg';
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, newWidth, newHeight);
  }

  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(rad);
  ctx.scale(options.flipH ? -1 : 1, options.flipV ? -1 : 1);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  const blob = await canvasToBlob(canvas, mime, options.quality ?? 0.9);
  return { blob, width: newWidth, height: newHeight };
}

/**
 * Watermark & Text Overlay Engine
 */
export async function applyWatermark(
  file: File,
  options: {
    mode: 'text' | 'image';
    text?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    opacity?: number; // 0 to 1
    position?: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right' | 'tile';
    watermarkImageFile?: File;
  }
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(img, 0, 0);

  ctx.globalAlpha = options.opacity ?? 0.5;

  if (options.mode === 'text' && options.text) {
    const fontSize = options.fontSize || Math.round(canvas.width / 20);
    ctx.font = `bold ${fontSize}px ${options.fontFamily || 'sans-serif'}`;
    ctx.fillStyle = options.textColor || '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 6;

    const metrics = ctx.measureText(options.text);
    const textWidth = metrics.width;
    const textHeight = fontSize;

    if (options.position === 'tile') {
      const stepX = textWidth * 2;
      const stepY = textHeight * 3;
      for (let y = stepY; y < canvas.height; y += stepY) {
        for (let x = stepX / 2; x < canvas.width; x += stepX) {
          ctx.fillText(options.text, x, y);
        }
      }
    } else {
      let x = canvas.width / 2 - textWidth / 2;
      let y = canvas.height / 2 + textHeight / 3;

      const pad = 30;
      if (options.position === 'top-left') { x = pad; y = pad + textHeight; }
      else if (options.position === 'top-right') { x = canvas.width - textWidth - pad; y = pad + textHeight; }
      else if (options.position === 'bottom-left') { x = pad; y = canvas.height - pad; }
      else if (options.position === 'bottom-right') { x = canvas.width - textWidth - pad; y = canvas.height - pad; }

      ctx.fillText(options.text, x, y);
    }
  } else if (options.mode === 'image' && options.watermarkImageFile) {
    const wmImg = await loadImageFromFile(options.watermarkImageFile);
    const scale = Math.min((canvas.width * 0.25) / wmImg.naturalWidth, (canvas.height * 0.25) / wmImg.naturalHeight);
    const wmW = wmImg.naturalWidth * scale;
    const wmH = wmImg.naturalHeight * scale;

    const pad = 30;
    let x = canvas.width / 2 - wmW / 2;
    let y = canvas.height / 2 - wmH / 2;

    if (options.position === 'top-left') { x = pad; y = pad; }
    else if (options.position === 'top-right') { x = canvas.width - wmW - pad; y = pad; }
    else if (options.position === 'bottom-left') { x = pad; y = canvas.height - wmH - pad; }
    else if (options.position === 'bottom-right') { x = canvas.width - wmW - pad; y = canvas.height - wmH - pad; }

    ctx.drawImage(wmImg, x, y, wmW, wmH);
  }

  const mime = file.type || 'image/jpeg';
  const blob = await canvasToBlob(canvas, mime, 0.92);
  return { blob, width: canvas.width, height: canvas.height };
}

/**
 * Filter Engine (Blur & Pixelate)
 */
export async function applyFilter(
  file: File,
  options: {
    filterType: 'blur' | 'pixelate';
    amount: number; // 1 to 50
    region?: { x: number; y: number; width: number; height: number };
  }
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(img, 0, 0);

  const reg = options.region || { x: 0, y: 0, width: canvas.width, height: canvas.height };

  if (options.filterType === 'blur') {
    ctx.save();
    ctx.beginPath();
    ctx.rect(reg.x, reg.y, reg.width, reg.height);
    ctx.clip();
    ctx.filter = `blur(${options.amount}px)`;
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  } else if (options.filterType === 'pixelate') {
    const pixelSize = Math.max(2, Math.round(options.amount));
    const offCanvas = document.createElement('canvas');
    const w = Math.max(1, Math.floor(reg.width / pixelSize));
    const h = Math.max(1, Math.floor(reg.height / pixelSize));
    offCanvas.width = w;
    offCanvas.height = h;
    const offCtx = offCanvas.getContext('2d')!;

    offCtx.imageSmoothingEnabled = false;
    offCtx.drawImage(img, reg.x, reg.y, reg.width, reg.height, 0, 0, w, h);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offCanvas, 0, 0, w, h, reg.x, reg.y, reg.width, reg.height);
  }

  const mime = file.type || 'image/jpeg';
  const blob = await canvasToBlob(canvas, mime, 0.92);
  return { blob, width: canvas.width, height: canvas.height };
}

/**
 * Social Media Resizer Engine with Smart Blur Background Padding
 */
export async function processSocialResize(
  file: File,
  targetWidth: number,
  targetHeight: number,
  paddingMode: 'blur' | 'color' | 'crop',
  bgColor: string = '#FFFFFF'
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  if (paddingMode === 'crop') {
    // Fill completely (cover)
    const scale = Math.max(targetWidth / img.naturalWidth, targetHeight / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (targetWidth - w) / 2;
    const y = (targetHeight - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  } else if (paddingMode === 'blur') {
    // Draw blurred background stretched
    ctx.save();
    ctx.filter = 'blur(30px) brightness(0.8)';
    ctx.drawImage(img, -20, -20, targetWidth + 40, targetHeight + 40);
    ctx.restore();

    // Draw contained image centered
    const scale = Math.min(targetWidth / img.naturalWidth, targetHeight / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (targetWidth - w) / 2;
    const y = (targetHeight - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  } else {
    // Color padding
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const scale = Math.min(targetWidth / img.naturalWidth, targetHeight / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (targetWidth - w) / 2;
    const y = (targetHeight - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  }

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  return { blob, width: targetWidth, height: targetHeight };
}

/**
 * Passport Photo Printable Layout Sheet Generator
 */
export async function createPassportSheet(
  singleBlob: Blob,
  photoWidthPx: number,
  photoHeightPx: number,
  sheetType: '4x6' | 'A4' | 'single',
  bgColor: string = '#FFFFFF'
): Promise<{ blob: Blob; count: number }> {
  if (sheetType === 'single') {
    return { blob: singleBlob, count: 1 };
  }

  const singleImg = await loadImageFromFile(singleBlob);

  // 300 DPI calculations
  let canvasW = 1200; // 4x6 inches at 200 DPI
  let canvasH = 1800;

  if (sheetType === 'A4') {
    canvasW = 2480; // A4 at 300 DPI
    canvasH = 3508;
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Grid spacing
  const gap = 30;
  const padX = 60;
  const padY = 60;

  const pW = photoWidthPx;
  const pH = photoHeightPx;

  const cols = Math.floor((canvasW - padX * 2 + gap) / (pW + gap));
  const rows = Math.floor((canvasH - padY * 2 + gap) / (pH + gap));

  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padX + c * (pW + gap);
      const y = padY + r * (pH + gap);
      ctx.drawImage(singleImg, x, y, pW, pH);

      // Light cutting outline
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, pW, pH);
      count++;
    }
  }

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
  return { blob, count };
}

/**
 * Multi-Image to PDF Document Generator using jsPDF
 */
export async function convertImagesToPDF(
  files: File[],
  options: {
    pageSize?: 'a4' | 'letter';
    orientation?: 'auto' | 'portrait' | 'landscape';
    marginMm?: number;
  }
): Promise<Blob> {
  const pageSize = options.pageSize || 'a4';
  const marginMm = options.marginMm ?? 10;

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: pageSize
  });

  for (let i = 0; i < files.length; i++) {
    if (i > 0) doc.addPage();

    const img = await loadImageFromFile(files[i]);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    const availableW = pdfWidth - marginMm * 2;
    const availableH = pdfHeight - marginMm * 2;

    const imgRatio = img.naturalWidth / img.naturalHeight;

    let printW = availableW;
    let printH = printW / imgRatio;

    if (printH > availableH) {
      printH = availableH;
      printW = printH * imgRatio;
    }

    const x = (pdfWidth - printW) / 2;
    const y = (pdfHeight - printH) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    doc.addImage(dataUrl, 'JPEG', x, y, printW, printH);
  }

  return doc.output('blob');
}

/**
 * Favicon Package Generator (.zip with 16x16, 32x32, 48x48, 180x180 PNGs and HTML code snippet)
 */
export async function generateFaviconZip(file: File): Promise<{ zipBlob: Blob; htmlCode: string }> {
  const img = await loadImageFromFile(file);
  const zip = new JSZip();

  const sizes = [16, 32, 48, 180, 512];
  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, size, size);

    const blob = await canvasToBlob(canvas, 'image/png');
    const filename = size === 180 ? 'apple-touch-icon.png' : size === 512 ? 'android-chrome-512x512.png' : `favicon-${size}x${size}.png`;
    zip.file(filename, blob);
  }

  const htmlCode = `<!-- PixelCraft Favicon Tags -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

  zip.file('README_FAVICON.txt', `How to install PixelCraft Favicons:\n1. Extract all images to your root web directory.\n2. Paste the following HTML into your <head> section:\n\n${htmlCode}`);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return { zipBlob, htmlCode };
}

/**
 * Image Splitter NxM Grid Generator
 */
export async function splitImageGrid(
  file: File,
  rows: number,
  cols: number
): Promise<{ zipBlob: Blob; tiles: { blob: Blob; filename: string }[] }> {
  const img = await loadImageFromFile(file);
  const tileW = Math.floor(img.naturalWidth / cols);
  const tileH = Math.floor(img.naturalHeight / rows);

  const zip = new JSZip();
  const tiles: { blob: Blob; filename: string }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const canvas = document.createElement('canvas');
      canvas.width = tileW;
      canvas.height = tileH;
      const ctx = canvas.getContext('2d')!;

      ctx.drawImage(img, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH);
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
      const filename = `tile_row${r + 1}_col${c + 1}.jpg`;

      zip.file(filename, blob);
      tiles.push({ blob, filename });
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return { zipBlob, tiles };
}

/**
 * Batch Helper to package multiple blobs into a single ZIP file.
 */
export async function createBatchZip(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const zip = new JSZip();
  files.forEach((f) => zip.file(f.name, f.blob));
  return zip.generateAsync({ type: 'blob' });
}
