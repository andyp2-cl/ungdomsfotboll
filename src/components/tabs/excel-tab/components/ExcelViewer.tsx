
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
  const isMac = isMacOS();

  // Global navigation lock for Mac
  useEffect(() => {
    if (!embedUrl || !isMac) return;

    // Add Mac body class for CSS targeting
    document.body.classList.add('excel-active-mac');
    
    // Create invisible overlay for gesture blocking
    const overlay = document.createElement('div');
    overlay.className = 'excel-navigation-blocker';
    overlay.id = 'excel-nav-blocker';
    document.body.appendChild(overlay);

    // Aggressive global event blocking
    const blockNavigation = (event: Event) => {
      // Block all horizontal scroll events globally
      if (event instanceof WheelEvent && Math.abs(event.deltaX) > 0) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
      
      // Block all gesture events
      if (event.type.includes('gesture')) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
      
      // Block specific Mac navigation events
      if (event instanceof KeyboardEvent) {
        if ((event.metaKey || event.ctrlKey) && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
      }
    };

    const globalEvents = [
      'wheel',
      'gesturestart',
      'gesturechange', 
      'gestureend',
      'touchstart',
      'touchmove',
      'touchend',
      'keydown',
      'swipeleft',
      'swiperight'
    ];

    // Add global listeners with highest priority
    globalEvents.forEach(eventType => {
      window.addEventListener(eventType, blockNavigation, { 
        passive: false, 
        capture: true 
      });
      document.addEventListener(eventType, blockNavigation, { 
        passive: false, 
        capture: true 
      });
    });

    // Cleanup
    return () => {
      document.body.classList.remove('excel-active-mac');
      const existingOverlay = document.getElementById('excel-nav-blocker');
      if (existingOverlay) {
        existingOverlay.remove();
      }
      
      globalEvents.forEach(eventType => {
        window.removeEventListener(eventType, blockNavigation);
        document.removeEventListener(eventType, blockNavigation);
      });
    };
  }, [embedUrl, isMac]);

  // Enhanced iframe area event handling with lock mode
  useEffect(() => {
    const wrapperElement = iframeWrapperRef.current;
    if (!wrapperElement || !embedUrl) return;

    const handleMouseEnter = () => {
      setIsMouseOverIframe(true);
      
      // Activate navigation blocker overlay
      const overlay = document.getElementById('excel-nav-blocker');
      if (overlay) {
        overlay.classList.add('active');
      }

      // Lock body scrolling completely on Mac
      if (isMac) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.documentElement.style.overscrollBehavior = 'none';
      }
    };

    const handleMouseLeave = () => {
      setIsMouseOverIframe(false);
      
      // Deactivate navigation blocker overlay
      const overlay = document.getElementById('excel-nav-blocker');
      if (overlay) {
        overlay.classList.remove('active');
      }

      // Unlock body scrolling on Mac
      if (isMac) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.documentElement.style.overscrollBehavior = '';
      }
    };

    // Ultra-aggressive event blocking for wrapper
    const blockAllNavigation = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    };

    const wrapperEvents = [
      'wheel',
      'scroll',
      'touchstart',
      'touchmove', 
      'touchend',
      'gesturestart',
      'gesturechange',
      'gestureend',
      'swipeleft',
      'swiperight',
      'dragstart',
      'drag',
      'dragend'
    ];

    // Add all event listeners to wrapper
    wrapperElement.addEventListener('mouseenter', handleMouseEnter);
    wrapperElement.addEventListener('mouseleave', handleMouseLeave);
    
    wrapperEvents.forEach(eventType => {
      wrapperElement.addEventListener(eventType, blockAllNavigation, { 
        passive: false, 
        capture: true 
      });
    });

    // Cleanup
    return () => {
      wrapperElement.removeEventListener('mouseenter', handleMouseEnter);
      wrapperElement.removeEventListener('mouseleave', handleMouseLeave);
      
      wrapperEvents.forEach(eventType => {
        wrapperElement.removeEventListener(eventType, blockAllNavigation);
      });
    };
  }, [embedUrl, setIsMouseOverIframe, isMac]);

  // Enhanced Google Sheets URL with more parameters to minimize navigation
  const enhancedEmbedUrl = `${embedUrl}&rm=minimal&widget=true&chrome=false&embedded=true&single=true&gid=0&headers=false&gridlines=true&fvid=0&toolbar=false&navpane=false&showtabs=false`;

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
            touchAction: 'none',
            pointerEvents: 'auto'
          }}
        >
          <iframe
            ref={iframeRef}
            src={enhancedEmbedUrl}
            width="100%"
            height="100%"
            scrolling="no"
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

          {/* Mac fallback warning */}
          {isMac && (
            <div className="absolute bottom-2 left-2 bg-amber-50 border border-amber-200 rounded-md p-2 text-xs text-amber-800 max-w-sm">
              <p className="font-medium">Mac-tips:</p>
              <p>Om horisontell scrolling ändå navigerar, använd "Öppna i ny flik" för bästa upplevelse.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
