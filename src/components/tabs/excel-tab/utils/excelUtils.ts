
export const convertToEmbedUrl = (url: string): string => {
  try {
    // Extract the sheet ID from various Google Sheets URL formats
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      const sheetId = match[1];
      // Enhanced URL parameters to completely minimize Google Sheets navigation and UI
      return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&rm=minimal&widget=true&chrome=false&embedded=true&single=true&gid=0&headers=false&gridlines=true&fvid=0&toolbar=false&navpane=false&showtabs=false&range=A1:Z1000`;
    }
    
    return "";
  } catch (error) {
    console.error("Error converting URL:", error);
    return "";
  }
};

export const isMacOS = (): boolean => {
  // Enhanced Mac detection including various Mac platforms
  const platform = navigator.platform.toUpperCase();
  const userAgent = navigator.userAgent.toUpperCase();
  
  return platform.indexOf('MAC') >= 0 || 
         userAgent.indexOf('MAC') >= 0 || 
         userAgent.indexOf('MACINTOSH') >= 0 ||
         platform.indexOf('DARWIN') >= 0;
};

export const isWebKit = (): boolean => {
  return /webkit/i.test(navigator.userAgent);
};

export const isSafari = (): boolean => {
  const userAgent = navigator.userAgent;
  return /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
};

// Enhanced utility for Mac-specific gesture blocking
export const addMacNavigationBlocking = () => {
  if (!isMacOS()) return null;
  
  const blockingStyles = document.createElement('style');
  blockingStyles.textContent = `
    html, body {
      overscroll-behavior: none !important;
      overscroll-behavior-x: none !important;
      overscroll-behavior-y: none !important;
    }
  `;
  document.head.appendChild(blockingStyles);
  
  return () => {
    if (blockingStyles.parentNode) {
      blockingStyles.parentNode.removeChild(blockingStyles);
    }
  };
};
