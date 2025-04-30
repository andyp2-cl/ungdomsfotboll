
import { useState, useRef, useCallback } from "react";
import { processImage } from "./imageUtils";

interface ImageEditorState {
  zoom: number;
  position: { x: number; y: number };
  dragStart: { x: number; y: number } | null;
  imageSize: { width: number; height: number };
  isEditing: boolean;
  originalImage: string | undefined;
}

interface UseImageEditorProps {
  imagePreview: string | undefined;
  setImagePreview: (preview: string | undefined) => void;
}

export function useImageEditor({ imagePreview, setImagePreview }: UseImageEditorProps) {
  const [state, setState] = useState<ImageEditorState>({
    zoom: 1,
    position: { x: 0, y: 0 },
    dragStart: null,
    imageSize: { width: 0, height: 0 },
    isEditing: false,
    originalImage: undefined
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Setter functions for state properties
  const setZoom = (zoom: number) => {
    setState(prev => ({ ...prev, zoom }));
  };
  
  const setPosition = (position: { x: number; y: number }) => {
    setState(prev => ({ ...prev, position }));
  };
  
  const setDragStart = (dragStart: { x: number; y: number } | null) => {
    setState(prev => ({ ...prev, dragStart }));
  };
  
  const setImageSize = (imageSize: { width: number; height: number }) => {
    setState(prev => ({ ...prev, imageSize }));
  };
  
  const setIsEditing = (isEditing: boolean) => {
    setState(prev => ({ ...prev, isEditing }));
  };
  
  const setOriginalImage = (originalImage: string | undefined) => {
    setState(prev => ({ ...prev, originalImage }));
  };
  
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
    if (!canvasRef.current || !state.originalImage) return;
  
    try {
      const dataUrl = await processImage(
        state.originalImage, 
        canvasRef.current, 
        state.zoom, 
        state.position
      );
      
      if (dataUrl) {
        setImagePreview(dataUrl);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error processing image:", error);
    }
  }, [state.originalImage, state.position, state.zoom, setImagePreview]);

  return {
    ...state,
    fileInputRef,
    canvasRef,
    setZoom,
    setPosition,
    setDragStart,
    setImageSize,
    setIsEditing,
    handleFileChange,
    handleImageClick,
    handleEditClick,
    handleRemoveImage,
    handleSave
  };
}
