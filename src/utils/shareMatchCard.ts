
import html2canvas from 'html2canvas';

export async function shareMatchCardAsImage(elementId: string): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found for sharing');
      return false;
    }

    // Create canvas from the element
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true
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
