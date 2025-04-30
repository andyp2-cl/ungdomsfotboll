
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
      const canvasSize = 300;
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Log image and zoom info for debugging
      console.log(`Processing image: ${img.width}x${img.height}, zoom: ${zoom}, position: ${JSON.stringify(position)}`);
      
      // Calculate the size of the area we want to use from the source image
      // The higher the zoom, the smaller the area we take from the source
      const sourceSize = Math.min(img.width, img.height) / zoom;
      
      // Find the center of the image
      const sourceCenterX = img.width / 2;
      const sourceCenterY = img.height / 2;
      
      // Calculate source position adjusted by user's position offset
      // Divide position offset by zoom factor to get correct movement amount
      const sourceX = sourceCenterX - (sourceSize / 2) + position.x;
      const sourceY = sourceCenterY - (sourceSize / 2) + position.y;
      
      // Make sure we don't try to access pixels outside the source image
      const safeSourceX = Math.max(0, Math.min(img.width - sourceSize, sourceX));
      const safeSourceY = Math.max(0, Math.min(img.height - sourceSize, sourceY));

      console.log(`Drawing from source: x=${safeSourceX}, y=${safeSourceY}, size=${sourceSize}`);
      
      // Draw the image to the canvas with the zoomed area
      ctx.drawImage(
        img,
        safeSourceX,
        safeSourceY,
        sourceSize,
        sourceSize,
        0, // destination x - always 0 for full canvas
        0, // destination y - always 0 for full canvas
        canvasSize, // destination width - full canvas width
        canvasSize  // destination height - full canvas height
      );

      // Convert canvas to data URL with high quality
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      console.log(`Image processed. Output size: ${dataUrl.length} chars`);
      resolve(dataUrl);
    };
    
    // Set the source image
    img.src = originalImage;
    
    // Handle load errors
    img.onerror = () => {
      console.error("Failed to load image for processing");
      resolve(undefined);
    };
  });
}
