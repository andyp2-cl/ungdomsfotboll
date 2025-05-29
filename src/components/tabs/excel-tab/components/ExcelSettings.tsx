
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, Save } from "lucide-react";

interface ExcelSettingsProps {
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  isLoading: boolean;
  embedUrl: string;
  showSettings: boolean;
  onLoadSheet: () => void;
  onClearSheet: () => void;
  onCancel: () => void;
}

export function ExcelSettings({
  sheetUrl,
  setSheetUrl,
  isLoading,
  embedUrl,
  showSettings,
  onLoadSheet,
  onClearSheet,
  onCancel,
}: ExcelSettingsProps) {
  return (
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
              onClick={onLoadSheet} 
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
              <Button onClick={onClearSheet} variant="outline">
                Rensa
              </Button>
            )}
            {embedUrl && showSettings && (
              <Button onClick={onCancel} variant="outline">
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
  );
}
