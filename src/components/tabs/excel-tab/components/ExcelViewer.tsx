
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Edit } from "lucide-react";
import { isMacOS } from "../utils/excelUtils";

interface ExcelViewerProps {
  embedUrl: string;
  sheetUrl: string;
  isMouseOverIframe: boolean;
  setIsMouseOverIframe: (value: boolean) => void;
  onEditSettings: () => void;
}

export function ExcelViewer({ 
  embedUrl, 
  sheetUrl, 
  isMouseOverIframe, 
  setIsMouseOverIframe, 
  onEditSettings 
}: ExcelViewerProps) {
  const iframeWrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Detect if user is on Mac
  const isMac = isMacOS();

  // Global document-level event blocking for Mac trackpad navigation
  useEffect(() => {
    if (!embedUrl || !isMac) return;

    const handleGlobalWheel = (event: WheelEvent) => {
      // Only block when mouse is over iframe area
      if (isMouseOverIframe && Math.abs(event.deltaX) > 0) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    };

    const handleGlobalGesture = (event: Event) => {
      if (isMouseOverIframe) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    };

    // Add global event listeners with highest priority
    document.addEventListener('wheel', handleGlobalWheel, { 
      passive: false, 
      capture: true 
    });
    
    // Mac-specific gesture events
    document.addEventListener('gesturestart', handleGlobalGesture, { 
      passive: false, 
      capture: true 
    });
    document.addEventListener('gesturechange', handleGlobalGesture, { 
      passive: false, 
      capture: true 
    });
    document.addEventListener('gestureend', handleGlobalGesture, { 
      passive: false, 
      capture: true 
    });

    return () => {
      document.removeEventListener('wheel', handleGlobalWheel);
      document.removeEventListener('gesturestart', handleGlobalGesture);
      document.removeEventListener('gesturechange', handleGlobalGesture);
      document.removeEventListener('gestureend', handleGlobalGesture);
    };
  }, [embedUrl, isMouseOverIframe, isMac]);

  // Enhanced iframe area event handling
  useEffect(() => {
    const wrapperElement = iframeWrapperRef.current;
    if (!wrapperElement || !embedUrl) return;

    const handleMouseEnter = () => {
      setIsMouseOverIframe(true);
    };

    const handleMouseLeave = () => {
      setIsMouseOverIframe(false);
    };

    const handleWheel = (event: WheelEvent) => {
      // Aggressively block all horizontal scrolling
      if (Math.abs(event.deltaX) > 0) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      event.stopPropagation();
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.stopPropagation();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.stopPropagation();
    };

    // Aggressive gesture prevention
    const preventDefault = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    // Add all event listeners
    wrapperElement.addEventListener('mouseenter', handleMouseEnter);
    wrapperElement.addEventListener('mouseleave', handleMouseLeave);
    wrapperElement.addEventListener('wheel', handleWheel, { 
      passive: false, 
      capture: true 
    });
    wrapperElement.addEventListener('touchstart', handleTouchStart, { 
      passive: false, 
      capture: true 
    });
    wrapperElement.addEventListener('touchmove', handleTouchMove, { 
      passive: false, 
      capture: true 
    });
    wrapperElement.addEventListener('touchend', handleTouchEnd, { 
      passive: false, 
      capture: true 
    });
    
    // Mac gesture events
    wrapperElement.addEventListener('gesturestart', preventDefault, { 
      passive: false, 
      capture: true 
    });
    wrapperElement.addEventListener('gesturechange', preventDefault, { 
      passive: false, 
      capture: true 
    });
    wrapperElement.addEventListener('gestureend', preventDefault, { 
      passive: false, 
      capture: true 
    });

    // Cleanup
    return () => {
      wrapperElement.removeEventListener('mouseenter', handleMouseEnter);
      wrapperElement.removeEventListener('mouseleave', handleMouseLeave);
      wrapperElement.removeEventListener('wheel', handleWheel);
      wrapperElement.removeEventListener('touchstart', handleTouchStart);
      wrapperElement.removeEventListener('touchmove', handleTouchMove);
      wrapperElement.removeEventListener('touchend', handleTouchEnd);
      wrapperElement.removeEventListener('gesturestart', preventDefault);
      wrapperElement.removeEventListener('gesturechange', preventDefault);
      wrapperElement.removeEventListener('gestureend', preventDefault);
    };
  }, [embedUrl, setIsMouseOverIframe]);

  return (
    <Card className="flex-1">
      <CardContent className="p-2">
        <div 
          ref={iframeWrapperRef}
          className="relative w-full excel-iframe-wrapper excel-iframe-container"
          style={{ 
            height: 'calc(100vh - 200px)', 
            minHeight: '600px',
            overflow: 'hidden',
            overscrollBehavior: 'none',
            pointerEvents: 'auto'
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
              pointerEvents: 'auto'
            }}
            title="Google Sheets"
            allow="autoplay; camera; microphone; display-capture"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
          />
          
          {/* Action buttons overlay */}
          <div className="absolute top-2 right-2 z-10 flex gap-2" style={{ pointerEvents: 'auto' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={onEditSettings}
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
  );
}
