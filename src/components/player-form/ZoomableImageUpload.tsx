
import React, { useState, useRef, useCallback } from "react";
import { ImagePreview } from "./image-upload/ImagePreview";
import { ImageEditorDialog } from "./image-upload/ImageEditorDialog";
import { processImage } from "./image-upload/imageUtils";

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

  // Handle remove image
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle save image
  const handleSave = useCallback(async () => {
    if (!canvasRef.current || !originalImage) return;
  
    try {
      const dataUrl = await processImage(originalImage, canvasRef.current, zoom, position);
      if (dataUrl) {
        setImagePreview(dataUrl);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error processing image:", error);
    }
  }, [originalImage, position, zoom, setImagePreview]);

  return (
    <div className="flex flex-col items-center mb-4">
      <ImagePreview
        imagePreview={imagePreview}
        onImageClick={handleImageClick}
        onEditClick={handleEditClick}
        onRemoveImage={handleRemoveImage}
      />
      
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

      <ImageEditorDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        originalImage={originalImage}
        onSave={handleSave}
        zoom={zoom}
        setZoom={setZoom}
        position={position}
        setPosition={setPosition}
        dragStart={dragStart}
        setDragStart={setDragStart}
        imageSize={imageSize}
        setImageSize={setImageSize}
        canvasRef={canvasRef}
      />
    </div>
  );
}
