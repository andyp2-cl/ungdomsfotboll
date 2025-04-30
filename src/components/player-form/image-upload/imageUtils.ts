
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
      
      // Calculate dimensions for centering and cropping
      const size = Math.min(img.width, img.height);
      const sourceX = (img.width - size) / 2;
      const sourceY = (img.height - size) / 2;
      
      // Calculate position based on zoom factor
      // When zoom is higher, we're looking at a smaller portion of the original image
      const scaleFactor = 1 / zoom;
      const zoomedSize = size * scaleFactor;
      
      // Center the zoomed area by default
      const centeredOffsetX = sourceX + (size - zoomedSize) / 2;
      const centeredOffsetY = sourceY + (size - zoomedSize) / 2;
      
      // Apply user position adjustments - position is scaled relative to the view size
      const adjustedX = centeredOffsetX - position.x * scaleFactor * size / canvas.width;
      const adjustedY = centeredOffsetY - position.y * scaleFactor * size / canvas.height;
      
      // Ensure we don't draw outside the image boundaries
      const finalX = Math.max(0, Math.min(img.width - zoomedSize, adjustedX));
      const finalY = Math.max(0, Math.min(img.height - zoomedSize, adjustedY));
      
      // Draw the image with zoom and position applied
      ctx.drawImage(
        img,
        finalX,
        finalY,
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
