
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { convertToEmbedUrl } from "../utils/excelUtils";
import { getAppSetting, setAppSetting } from "@/lib/supabase/appSettings";

const EXCEL_SETTING_KEY = "excel_sheet_url";

export function useExcelSheet() {
  const [sheetUrl, setSheetUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMouseOverIframe, setIsMouseOverIframe] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  // Load global Excel URL from Supabase on component mount
  useEffect(() => {
    const loadGlobalExcelUrl = async () => {
      setIsInitializing(true);
      try {
        const savedUrl = await getAppSetting(EXCEL_SETTING_KEY);
        if (savedUrl && savedUrl.trim()) {
          setSheetUrl(savedUrl);
          const convertedUrl = convertToEmbedUrl(savedUrl);
          if (convertedUrl) {
            setEmbedUrl(convertedUrl);
          }
        } else {
          setShowSettings(true);
        }
      } catch (error) {
        console.error('Error loading global Excel URL:', error);
        setShowSettings(true);
      } finally {
        setIsInitializing(false);
      }
    };

    loadGlobalExcelUrl();
  }, []);

  const handleLoadSheet = async () => {
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

    try {
      // Save URL to Supabase global settings
      const success = await setAppSetting(EXCEL_SETTING_KEY, sheetUrl);
      
      if (!success) {
        toast({
          title: "Fel",
          description: "Kunde inte spara Excel-filen globalt",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setEmbedUrl(convertedUrl);
      setShowSettings(false);
      
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Framgång",
          description: "Excel-filen har laddats in globalt för alla användare",
        });
      }, 1000);
    } catch (error) {
      console.error('Error saving Excel URL:', error);
      toast({
        title: "Fel",
        description: "Kunde inte spara Excel-filen",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleClearSheet = async () => {
    setIsLoading(true);
    
    try {
      // Clear URL from Supabase global settings
      const success = await setAppSetting(EXCEL_SETTING_KEY, '');
      
      if (!success) {
        toast({
          title: "Fel",
          description: "Kunde inte rensa Excel-filen globalt",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setSheetUrl("");
      setEmbedUrl("");
      setShowSettings(true);
      setIsMouseOverIframe(false);
      setIsLoading(false);
      
      toast({
        title: "Rensad",
        description: "Excel-filen har tagits bort globalt för alla användare",
      });
    } catch (error) {
      console.error('Error clearing Excel URL:', error);
      toast({
        title: "Fel",
        description: "Kunde inte rensa Excel-filen",
        variant: "destructive",
      });
      setIsLoading(false);
    }
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
    isInitializing,
    handleLoadSheet,
    handleClearSheet,
    handleEditSettings,
  };
}
