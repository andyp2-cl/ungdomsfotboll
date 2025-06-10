
import html2canvas from 'html2canvas';

export async function shareMatchCardAsImage(elementId: string): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found for sharing');
      return false;
    }

    // Wait a moment for any dynamic content to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get the actual rendered dimensions
    const rect = element.getBoundingClientRect();
    
    // Create canvas from the element with settings optimized for text
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Good balance between quality and file size
      useCORS: true,
      allowTaint: true,
      logging: false,
      // Use the actual element dimensions with some padding
      width: Math.ceil(rect.width) + 20,
      height: Math.ceil(rect.height) + 20,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      // Ensure we capture the full element
      foreignObjectRendering: true,
      // Add some extra space around the element
      windowWidth: Math.ceil(rect.width) + 40,
      windowHeight: Math.ceil(rect.height) + 40
    });

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          resolve(false);
          return;
        }

        try {
          // Copy to clipboard using the Clipboard API
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          
          console.log('Match card copied to clipboard as image');
          resolve(true);
        } catch (error) {
          console.error('Failed to copy to clipboard:', error);
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error sharing match card:', error);
    return false;
  }
}
