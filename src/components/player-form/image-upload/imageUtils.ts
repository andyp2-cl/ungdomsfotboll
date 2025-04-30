
export function processImage(
  originalImage: string | undefined,
  canvas: HTMLCanvasElement,
  zoom: number,
  position: { x: number; y: number }
): string | undefined {
  if (!canvas || !originalImage) return undefined;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  const img = new Image();
  
  return new Promise<string>((resolve) => {
    img.onload = () => {
      // Set canvas dimensions to be square (for profile image)
      const size = Math.min(img.width, img.height);
      canvas.width = 300;
      canvas.height = 300;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate the source area (what part of the image to draw)
      const scale = size / (zoom * 300);
      const sourceX = (img.width / 2) - (position.x * scale) - (size / 2);
      const sourceY = (img.height / 2) - (position.y * scale) - (size / 2);
      const sourceSize = size;

      // Draw the image with the current zoom and position
      ctx.drawImage(
        img,
        Math.max(0, Math.min(img.width - sourceSize, sourceX)),
        Math.max(0, Math.min(img.height - sourceSize, sourceY)),
        sourceSize,
        sourceSize,
        0, 0, canvas.width, canvas.height
      );

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(dataUrl);
    };
    img.src = originalImage;
  });
}
