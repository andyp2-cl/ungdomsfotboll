
import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { UserCircle, Camera, ZoomIn, ZoomOut, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ZoomableImageUploadProps {
  imagePreview: string | undefined;
  setImagePreview: (preview: string | undefined) => void;
}

export function ZoomableImageUpload({ imagePreview, setImagePreview }: ZoomableImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [originalImage, setOriginalImage] = useState<string | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setOriginalImage(result);
        setImagePreview(result);
        // Reset zoom and position when a new image is loaded
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        // Open the editor
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image click to open file selector
  const handleImageClick = () => {
    if (!imagePreview) {
      fileInputRef.current?.click();
    } else {
      setOriginalImage(imagePreview);
      setIsEditing(true);
    }
  };

  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOriginalImage(imagePreview);
    setIsEditing(true);
  };

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

  // Handle save image
  const handleSave = useCallback(() => {
    if (!canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions to be square (for profile image)
      const size = Math.min(img.width, img.height);
      canvas.width = 300;
      canvas.height = 300;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate the source area (what part of the image to draw)
      const scale = size / (zoom * 300);
      const sourceX = (img.width / 2) - (position.x * scale) - (size / 2);
      const sourceY = (img.height / 2) - (position.y * scale) - (size / 2);
      const sourceSize = size;

      // Draw the image with the current zoom and position
      ctx.drawImage(
        img,
        Math.max(0, Math.min(img.width - sourceSize, sourceX)),
        Math.max(0, Math.min(img.height - sourceSize, sourceY)),
        sourceSize,
        sourceSize,
        0, 0, canvas.width, canvas.height
      );

      // Convert canvas to data URL and update the preview
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImagePreview(dataUrl);
      setIsEditing(false);
    };
    img.src = originalImage;
  }, [originalImage, position, zoom, setImagePreview]);

  // Handle image load to get dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  // Handle remove image
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    <div className="flex flex-col items-center mb-4">
      <div className="relative mb-2">
        <div 
          className="h-24 w-24 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={handleImageClick}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Player" className="h-full w-full object-cover" />
          ) : (
            <UserCircle className="h-16 w-16 text-gray-400" />
          )}
          <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full">
            <Camera className="h-4 w-4" />
          </div>

          {imagePreview && (
            <div className="absolute bottom-0 left-0 bg-primary text-white p-1 rounded-full" onClick={handleEditClick}>
              <ZoomIn className="h-4 w-4" />
            </div>
          )}
        </div>
        {imagePreview && (
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white" 
            onClick={handleRemoveImage}
          >
            <span className="sr-only">Remove image</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="h-3 w-3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <span className="text-sm text-muted-foreground">
        {imagePreview ? "Klicka för att ändra bild" : "Klicka för att lägga till bild"}
      </span>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
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
                      cursor: dragStart ? 'grabbing' : 'grab'
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
            
            <Button className="w-full" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Spara bild
            </Button>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
