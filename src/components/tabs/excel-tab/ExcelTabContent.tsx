import React, { useState, useEffect, useRef } from "react";
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
  const [isCaptureMode, setIsCaptureMode] = useState(false);
  const { toast } = useToast();
  const iframeWrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Enhanced event handling for complete Mac trackpad isolation
  useEffect(() => {
    const wrapperElement = iframeWrapperRef.current;
    if (!wrapperElement || !embedUrl) return;

    const preventDefault = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const handleWheel = (event: WheelEvent) => {
      // Completely prevent horizontal scroll from affecting parent
      if (Math.abs(event.deltaX) > 0) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
      // Also prevent vertical scroll bubbling
      event.stopPropagation();
    };

    const handleTouchStart = (event: TouchEvent) => {
      event.stopPropagation();
      event.stopImmediatePropagation();
      setIsCaptureMode(true);
      document.body.classList.add('excel-iframe-active');
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.stopPropagation();
      event.stopImmediatePropagation();
      setTimeout(() => {
        setIsCaptureMode(false);
        document.body.classList.remove('excel-iframe-active');
      }, 100);
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const handlePointerDown = (event: PointerEvent) => {
      event.stopPropagation();
      event.stopImmediatePropagation();
      setIsCaptureMode(true);
      document.body.classList.add('excel-iframe-active');
    };

    const handlePointerUp = (event: PointerEvent) => {
      event.stopPropagation();
      event.stopImmediatePropagation();
      setTimeout(() => {
        setIsCaptureMode(false);
        document.body.classList.remove('excel-iframe-active');
      }, 100);
    };

    const handleMouseEnter = () => {
      setIsCaptureMode(true);
      document.body.classList.add('excel-iframe-active');
    };

    const handleMouseLeave = () => {
      setIsCaptureMode(false);
      document.body.classList.remove('excel-iframe-active');
    };

    // Gesture event handlers for Mac
    const handleGestureStart = preventDefault;
    const handleGestureChange = preventDefault;
    const handleGestureEnd = preventDefault;

    // Add all event listeners with aggressive prevention
    wrapperElement.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    wrapperElement.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
    wrapperElement.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });
    wrapperElement.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    wrapperElement.addEventListener('pointerdown', handlePointerDown, { passive: false, capture: true });
    wrapperElement.addEventListener('pointerup', handlePointerUp, { passive: false, capture: true });
    wrapperElement.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    wrapperElement.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    
    // Mac-specific gesture events
    wrapperElement.addEventListener('gesturestart', handleGestureStart, { passive: false, capture: true });
    wrapperElement.addEventListener('gesturechange', handleGestureChange, { passive: false, capture: true });
    wrapperElement.addEventListener('gestureend', handleGestureEnd, { passive: false, capture: true });

    // Document-level prevention when iframe is active
    const handleDocumentWheel = (event: WheelEvent) => {
      if (isCaptureMode) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleDocumentTouchMove = (event: TouchEvent) => {
      if (isCaptureMode) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('wheel', handleDocumentWheel, { passive: false });
    document.addEventListener('touchmove', handleDocumentTouchMove, { passive: false });

    // Cleanup
    return () => {
      wrapperElement.removeEventListener('wheel', handleWheel);
      wrapperElement.removeEventListener('touchstart', handleTouchStart);
      wrapperElement.removeEventListener('touchend', handleTouchEnd);
      wrapperElement.removeEventListener('touchmove', handleTouchMove);
      wrapperElement.removeEventListener('pointerdown', handlePointerDown);
      wrapperElement.removeEventListener('pointerup', handlePointerUp);
      wrapperElement.removeEventListener('mouseenter', handleMouseEnter);
      wrapperElement.removeEventListener('mouseleave', handleMouseLeave);
      wrapperElement.removeEventListener('gesturestart', handleGestureStart);
      wrapperElement.removeEventListener('gesturechange', handleGestureChange);
      wrapperElement.removeEventListener('gestureend', handleGestureEnd);
      
      document.removeEventListener('wheel', handleDocumentWheel);
      document.removeEventListener('touchmove', handleDocumentTouchMove);
      document.body.classList.remove('excel-iframe-active');
    };
  }, [embedUrl, isCaptureMode]);

  // Convert Google Sheets sharing URL to embed URL
  const convertToEmbedUrl = (url: string): string => {
    try {
      // Extract the sheet ID from various Google Sheets URL formats
      const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
      const match = url.match(regex);
      
      if (match && match[1]) {
        const sheetId = match[1];
        // Enhanced URL with better isolation parameters
        return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&rm=minimal&widget=true&chrome=false&embedded=true&single=true&gid=0`;
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
    setIsCaptureMode(false);
    localStorage.removeItem(STORAGE_KEY);
    document.body.classList.remove('excel-iframe-active');
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
      {/* Excel Sheet Display with enhanced isolation */}
      {embedUrl && (
        <Card className="flex-1">
          <CardContent className="p-2">
            <div 
              ref={iframeWrapperRef}
              className={`relative w-full excel-iframe-wrapper excel-iframe-container ${isCaptureMode ? 'capture-mode' : ''}`}
              style={{ 
                height: 'calc(100vh - 200px)', 
                minHeight: '600px',
                overflow: 'hidden',
                overscrollBehavior: 'none',
                overscrollBehaviorX: 'none',
                overscrollBehaviorY: 'none',
                touchAction: 'none'
              }}
            >
              <iframe
                ref={iframeRef}
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ 
                  border: 'none', 
                  borderRadius: '6px',
                  touchAction: 'pan-x pan-y',
                  overflowX: 'auto',
                  overflowY: 'auto',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  pointerEvents: 'auto'
                }}
                title="Google Sheets"
                allow="autoplay; camera; microphone; display-capture"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
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
