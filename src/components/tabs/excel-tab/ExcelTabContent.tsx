
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, FileSpreadsheet, Save } from "lucide-react";

const STORAGE_KEY = "football-app-excel-sheet-url";

export function ExcelTabContent() {
  const [sheetUrl, setSheetUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load saved URL on component mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(STORAGE_KEY);
    if (savedUrl) {
      setSheetUrl(savedUrl);
      setEmbedUrl(convertToEmbedUrl(savedUrl));
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
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Rensad",
      description: "Excel-filen har tagits bort",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with instructions */}
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

      {/* Excel Sheet Display */}
      {embedUrl && (
        <Card className="flex-1">
          <CardContent className="p-2">
            <div className="relative w-full" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: '6px' }}
                title="Google Sheets"
                allow="autoplay; camera; microphone; display-capture"
              />
              
              {/* External link button */}
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={() => window.open(sheetUrl, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Öppna i ny flik
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!embedUrl && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Ingen Excel-fil laddad</p>
                <p className="text-sm text-muted-foreground">
                  Ange en Google Sheets URL ovan för att komma igång
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
