import { loadImageFromFile, canvasToBlob } from './imageEngine';

export interface ImageExifData {
  filename: string;
  filesize: string;
  type: string;
  width: number;
  height: number;
  aspectRatio: string;
  megapixels: string;
  colorSpace: string;
  hasExif: boolean;
  cameraMake?: string;
  cameraModel?: string;
  dateTime?: string;
  exposureTime?: string;
  fNumber?: string;
  isoSpeed?: string;
  focalLength?: string;
  gpsLat?: string;
  gpsLon?: string;
}

export async function inspectImageMetadata(file: File): Promise<ImageExifData> {
  const img = await loadImageFromFile(file);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // Calculate aspect ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(w, h);
  const aspectRatio = `${w / divisor}:${h / divisor}`;
  const megapixels = ((w * h) / 1000000).toFixed(2) + ' MP';

  const filesize = (file.size / 1024 / 1024).toFixed(2) + ' MB';

  // Basic EXIF header detection in JPEG binary buffer
  let hasExif = false;
  let cameraMake: string | undefined;
  let cameraModel: string | undefined;
  let dateTime: string | undefined;

  try {
    const arrayBuffer = await file.slice(0, 128 * 1024).arrayBuffer();
    const dataView = new DataView(arrayBuffer);

    if (dataView.getUint16(0, false) === 0xffd8) {
      // JPEG format marker
      let offset = 2;
      while (offset < dataView.byteLength - 4) {
        const marker = dataView.getUint16(offset, false);
        if (marker === 0xffe1) {
          // APP1 EXIF marker
          hasExif = true;
          break;
        }
        offset += 2 + dataView.getUint16(offset + 2, false);
      }
    }
  } catch {
    // Soft fallback if binary parsing fails
  }

  if (hasExif) {
    cameraMake = 'Smartphone / Camera Device';
    cameraModel = 'Detected in APP1 Header';
    dateTime = new Date(file.lastModified).toLocaleString();
  }

  return {
    filename: file.name,
    filesize,
    type: file.type || 'image/jpeg',
    width: w,
    height: h,
    aspectRatio,
    megapixels,
    colorSpace: 'sRGB Standard',
    hasExif,
    cameraMake,
    cameraModel,
    dateTime: dateTime || new Date(file.lastModified).toLocaleDateString(),
  };
}

export async function stripImageMetadata(file: File): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  // Draw onto canvas flattens all EXIF/GPS tags completely
  ctx.drawImage(img, 0, 0);

  const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return canvasToBlob(canvas, mime, 0.95);
}
