
import html2canvas from 'html2canvas';

/**
 * Renderar ett DOM-element som PNG och laddar automatiskt ner det.
 * @param elementId elementets id.
 * @param filename Filnamn för nedladdning (default: "matchkort.png")
 */
export async function downloadMatchCardAsImage(elementId: string, filename = "matchkort.png"): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found for download');
      return false;
    }

    // Gör en klon för att undvika side-effects i layouten
    const clone = element.cloneNode(true) as HTMLElement;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.backgroundColor = '#fff';
    container.appendChild(clone);
    document.body.appendChild(container);

    // Vänta på bildladdning
    const images = container.getElementsByTagName('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    const canvas = await html2canvas(container, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    document.body.removeChild(container);

    // Skapa en länk och trigga nedladdning
    const url = canvas.toDataURL('image/png');
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return true;
  } catch (error) {
    console.error('Error downloading match card:', error);
    return false;
  }
}
