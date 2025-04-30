
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
  
  return new Promise<string | undefined>((resolve) => {
    img.onload = () => {
      // Set canvas dimensions to be square (for profile image)
      canvas.width = 300;
      canvas.height = 300;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate dimensions for centering the image
      const size = Math.min(img.width, img.height);
      const sourceX = (img.width - size) / 2;
      const sourceY = (img.height - size) / 2;
      
      // Calculate the area to draw based on zoom
      const zoomedSize = size / zoom;
      const offsetX = sourceX - (position.x * (size / zoom));
      const offsetY = sourceY - (position.y * (size / zoom));
      
      // Ensure we don't draw outside the image boundaries
      const safeOffsetX = Math.max(0, Math.min(img.width - zoomedSize, offsetX));
      const safeOffsetY = Math.max(0, Math.min(img.height - zoomedSize, offsetY));

      // Draw the image with zoom and position applied
      ctx.drawImage(
        img,
        safeOffsetX,
        safeOffsetY,
        zoomedSize,
        zoomedSize,
        0, 0,
        canvas.width, canvas.height
      );

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(dataUrl);
    };
    
    img.onerror = () => {
      console.error("Failed to load image");
      resolve(undefined);
    };
    
    img.src = originalImage;
  });
}
