
export function processImage(
  originalImage: string | undefined,
  canvas: HTMLCanvasElement,
  zoom: number,
  position: { x: number; y: number }
): Promise<string | undefined> {
  if (!canvas || !originalImage) return Promise.resolve(undefined);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(undefined);

  const img = new Image();
  
  return new Promise<string>((resolve) => {
    img.onload = () => {
      // Set canvas dimensions to be square (for profile image)
      canvas.width = 300;
      canvas.height = 300;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate the center of the image and canvas
      const canvasCenter = canvas.width / 2;
      
      // Calculate the source area based on zoom and position
      const sourceSize = Math.min(img.width, img.height) / zoom;
      const centerX = img.width / 2;
      const centerY = img.height / 2;
      
      // Adjust source position based on user's position offset
      const sourceX = centerX - (sourceSize / 2) + (position.x / zoom);
      const sourceY = centerY - (sourceSize / 2) + (position.y / zoom);
      
      // Make sure we don't try to draw outside the source image
      const clampedSourceX = Math.max(0, Math.min(img.width - sourceSize, sourceX));
      const clampedSourceY = Math.max(0, Math.min(img.height - sourceSize, sourceY));

      // Draw the image with the current zoom and position
      ctx.drawImage(
        img,
        clampedSourceX,
        clampedSourceY,
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
