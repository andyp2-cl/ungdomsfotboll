
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { convertToEmbedUrl } from "../utils/excelUtils";

const STORAGE_KEY = "football-app-excel-sheet-url";

export function useExcelSheet() {
  const [sheetUrl, setSheetUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMouseOverIframe, setIsMouseOverIframe] = useState(false);
  const { toast } = useToast();

  // Load saved URL on component mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(STORAGE_KEY);
    if (savedUrl) {
      setSheetUrl(savedUrl);
      const convertedUrl = convertToEmbedUrl(savedUrl);
      if (convertedUrl) {
        setEmbedUrl(convertedUrl);
      }
    } else {
      setShowSettings(true);
    }
  }, []);

  const handleLoadSheet = () => {
    if (!sheetUrl.trim()) {
      toast({
        title: "Fel",
        description: "Vänligen ange en Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const convertedUrl = convertToEmbedUrl(sheetUrl);
    
    if (!convertedUrl) {
      toast({
        title: "Ogiltig URL",
        description: "Vänligen ange en giltig Google Sheets URL",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Save URL to localStorage
    localStorage.setItem(STORAGE_KEY, sheetUrl);
    setEmbedUrl(convertedUrl);
    setShowSettings(false);
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Framgång",
        description: "Excel-filen har laddats in",
      });
    }, 1000);
  };

  const handleClearSheet = () => {
    setSheetUrl("");
    setEmbedUrl("");
    setShowSettings(true);
    setIsMouseOverIframe(false);
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Rensad",
      description: "Excel-filen har tagits bort",
    });
  };

  const handleEditSettings = () => {
    setShowSettings(true);
  };

  return {
    sheetUrl,
    setSheetUrl,
    embedUrl,
    isLoading,
    showSettings,
    setShowSettings,
    isMouseOverIframe,
    setIsMouseOverIframe,
    handleLoadSheet,
    handleClearSheet,
    handleEditSettings,
  };
}
