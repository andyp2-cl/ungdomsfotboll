
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Save } from "lucide-react";

interface ImageEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalImage: string | undefined;
  onSave: () => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
  dragStart: { x: number; y: number } | null;
  setDragStart: (dragStart: { x: number; y: number } | null) => void;
  imageSize: { width: number; height: number };
  setImageSize: (size: { width: number; height: number }) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function ImageEditorDialog({
  open,
  onOpenChange,
  originalImage,
  onSave,
  zoom,
  setZoom,
  position,
  setPosition,
  dragStart,
  setDragStart,
  imageSize,
  setImageSize,
  canvasRef,
}: ImageEditorDialogProps) {
  // Handle zoom change
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  // Handle image drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  // Handle image load to get dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };
  
  // Handle zoom in button click
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 3));
  };
  
  // Handle zoom out button click
  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Justera bild</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          <div 
            className="relative w-64 h-64 overflow-hidden border rounded-lg"
            onMouseDown={handleMouseDown}
            onMouseMove={dragStart ? handleMouseMove : undefined}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: dragStart ? 'grabbing' : 'grab' }}
          >
            {originalImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={originalImage} 
                  alt="Edit preview" 
                  style={{
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transformOrigin: 'center',
                    maxWidth: 'none',
                  }}
                  onLoad={handleImageLoad}
                  draggable="false"
                />
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none border-2 border-white rounded-full m-4"></div>
          </div>
          
          <div className="flex items-center justify-between w-full px-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 mx-2">
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={handleZoomChange}
              />
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="w-full flex flex-col gap-2">
            <Button className="w-full" onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Spara bild
            </Button>
            <div className="text-xs text-center text-muted-foreground">
              Zoom: {zoom.toFixed(1)}x | Dra för att placera bilden
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" width="300" height="300" />
      </DialogContent>
    </Dialog>
  );
}
