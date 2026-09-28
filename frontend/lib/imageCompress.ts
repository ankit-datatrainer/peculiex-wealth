/**
 * Compresses and resizes an image file in the browser before upload.
 * Keeps resolution high (up to maxDimension, default 1920px) while reducing file
 * size from several megabytes down to ~150-350 KB, preventing HTTP 413 (Payload Too Large)
 * errors through reverse proxies like Nginx.
 */
export async function compressImageForUpload(
  file: File,
  maxDimension = 1920,
  quality = 0.85
): Promise<string> {
  // If it's a GIF or SVG, do not process via canvas (preserves animations & vectors)
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data url if browser cannot decode into Image
        resolve(String(reader.result || ""));
      };
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(String(reader.result || ""));
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // For small PNGs (< 800KB), preserve PNG transparency.
          // For larger photos, JPEG reduces size dramatically.
          const isTransparentPng = file.type === "image/png" && file.size < 800 * 1024;
          const outputMime = isTransparentPng ? "image/png" : "image/jpeg";
          const dataUrl = canvas.toDataURL(outputMime, quality);
          resolve(dataUrl);
        } catch {
          // If canvas fails (e.g. security/taint), fallback to raw
          resolve(String(reader.result || ""));
        }
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}
