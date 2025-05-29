
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, FileSpreadsheet, Save, Edit } from "lucide-react";

const STORAGE_KEY = "football-app-excel-sheet-url";

export function ExcelTabContent() {
  const [sheetUrl, setSheetUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  // Load saved URL on component mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(STORAGE_KEY);
    if (savedUrl) {
      setSheetUrl(savedUrl);
      const convertedUrl = convertToEmbedUrl(savedUrl);
      if (convertedUrl) {
        setEmbedUrl(convertedUrl);
        toast({
          title: "Excel-fil laddad",
          description: "Din sparade Google Sheets-fil har laddats automatiskt",
        });
      }
    } else {
      setShowSettings(true);
    }
  }, []);

  // Convert Google Sheets sharing URL to embed URL
  const convertToEmbedUrl = (url: string): string => {
    try {
      // Extract the sheet ID from various Google Sheets URL formats
      const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
      const match = url.match(regex);
      
      if (match && match[1]) {
        const sheetId = match[1];
        return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&rm=minimal&widget=true&chrome=false`;
      }
      
      return "";
    } catch (error) {
      console.error("Error converting URL:", error);
      return "";
    }
  };

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
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Rensad",
      description: "Excel-filen har tagits bort",
    });
  };

  const handleEditSettings = () => {
    setShowSettings(true);
  };

  return (
    <div className="space-y-4 h-full">
      {/* Excel Sheet Display - Now at the top when loaded */}
      {embedUrl && (
        <Card className="flex-1">
          <CardContent className="p-2">
            <div 
              className="relative w-full excel-iframe-container" 
              style={{ 
                height: 'calc(100vh - 200px)', 
                minHeight: '600px',
                overflow: 'hidden',
                overscrollBehavior: 'contain'
              }}
            >
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ 
                  border: 'none', 
                  borderRadius: '6px',
                  touchAction: 'auto',
                  overflowX: 'auto',
                  overflowY: 'auto'
                }}
                title="Google Sheets"
                allow="autoplay; camera; microphone; display-capture"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
              
              {/* Action buttons overlay */}
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditSettings}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Ändra fil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(sheetUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Öppna i ny flik
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings card - shown when no file is loaded or when editing */}
      {(showSettings || !embedUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Google Sheets Integration
            </CardTitle>
            <CardDescription>
              Ladda in en Google Sheets-fil från Google Drive för att arbeta med den direkt på sajten.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-url">Google Sheets URL</Label>
              <div className="flex gap-2">
                <Input
                  id="sheet-url"
                  placeholder="Klistra in Google Sheets länk här..."
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleLoadSheet} 
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Laddar...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Ladda in
                    </>
                  )}
                </Button>
                {embedUrl && (
                  <Button onClick={handleClearSheet} variant="outline">
                    Rensa
                  </Button>
                )}
                {embedUrl && showSettings && (
                  <Button onClick={() => setShowSettings(false)} variant="outline">
                    Avbryt
                  </Button>
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Instruktioner:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Öppna din Google Sheets-fil i Google Drive</li>
                <li>Klicka på "Dela" och sätt behörigheter till "Alla med länken kan redigera"</li>
                <li>Kopiera länken och klistra in den ovan</li>
                <li>Klicka på "Ladda in" för att visa filen här</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state - only shown when no file is loaded and settings are hidden */}
      {!embedUrl && !showSettings && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Ingen Excel-fil laddad</p>
                <p className="text-sm text-muted-foreground">
                  Ange en Google Sheets URL för att komma igång
                </p>
              </div>
              <Button onClick={() => setShowSettings(true)} variant="outline">
                Ladda in fil
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
