import html2canvas from 'html2canvas';

export async function shareMatchCardAsImage(elementId: string): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found for sharing');
      return false;
    }

    // Create a clone of the element
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Create a container for the clone
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = `${element.offsetWidth * 1.5}px`;
    container.style.height = `${element.offsetHeight}px`;
    container.style.padding = '20px';
    container.style.backgroundColor = '#ffffff';
    
    // Add the clone to the container
    container.appendChild(clone);
    document.body.appendChild(container);

    // Wait for any images to load
    const images = container.getElementsByTagName('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    // Use html2canvas to capture the element
    const canvas = await html2canvas(container, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          const computedStyle = window.getComputedStyle(element);
          clonedElement.style.cssText = computedStyle.cssText;
          
          // Ensure text elements have proper width and don't truncate
          const textElements = clonedElement.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
          textElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.whiteSpace = 'normal';
              el.style.overflow = 'visible';
              el.style.textOverflow = 'clip';
              el.style.width = 'auto';
              el.style.maxWidth = 'none';
            }
          });
        }
      }
    });

    // Remove the container
    document.body.removeChild(container);

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png', 1.0);
    });

    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ]);

    console.log('Match card copied to clipboard as image');
    return true;
  } catch (error) {
    console.error('Error sharing match card:', error);
    return false;
  }
}
