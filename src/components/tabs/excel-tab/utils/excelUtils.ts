
export const convertToEmbedUrl = (url: string): string => {
  try {
    // Extract the sheet ID from various Google Sheets URL formats
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      const sheetId = match[1];
      // Enhanced URL parameters to minimize Google Sheets navigation
      return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&rm=minimal&widget=true&chrome=false&embedded=true&single=true&gid=0&headers=false&gridlines=true&fvid=0`;
    }
    
    return "";
  } catch (error) {
    console.error("Error converting URL:", error);
    return "";
  }
};

export const isMacOS = (): boolean => {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};
