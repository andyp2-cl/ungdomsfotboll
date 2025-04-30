
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
      
      // Calculate the scaled dimensions based on zoom
      const scaledWidth = img.width * zoom;
      const scaledHeight = img.height * zoom;
      
      // Calculate center offsets
      const centerOffsetX = (scaledWidth - canvas.width) / 2;
      const centerOffsetY = (scaledHeight - canvas.height) / 2;
      
      // Apply user position adjustments (inverted because we're moving the image under a fixed viewport)
      const drawX = -centerOffsetX - position.x * zoom;
      const drawY = -centerOffsetY - position.y * zoom;
      
      // Draw the image with appropriate scaling and positioning
      ctx.drawImage(
        img,
        drawX,
        drawY,
        scaledWidth,
        scaledHeight
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
