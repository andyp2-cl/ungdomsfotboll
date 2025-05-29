
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { TrainingExercise, TrainingCategory, TRAINING_CATEGORIES, DIFFICULTY_LEVELS, VideoType, VIDEO_TYPES } from "@/types/training";

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExercise: (exercise: Omit<TrainingExercise, 'id' | 'createdAt' | 'updatedAt'> | TrainingExercise) => void;
  editingExercise?: TrainingExercise | null;
}

type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export function AddExerciseDialog({
  open,
  onOpenChange,
  onAddExercise,
  editingExercise
}: AddExerciseDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Kvadrater' as TrainingCategory,
    videoType: 'youtube' as VideoType,
    videoUrl: '',
    duration: '',
    difficulty: 'Medium' as DifficultyLevel,
    equipment: '',
    notes: '',
    tags: [] as string[]
  });
  
  const [newTag, setNewTag] = useState('');

  // Uppdatera formuläret när editingExercise ändras
  useEffect(() => {
    if (editingExercise) {
      console.log('Loading exercise for editing:', editingExercise);
      setFormData({
        title: editingExercise.title || '',
        description: editingExercise.description || '',
        category: editingExercise.category || 'Kvadrater',
        videoType: editingExercise.videoType || 'youtube',
        videoUrl: editingExercise.videoUrl || '',
        duration: editingExercise.duration?.toString() || '',
        difficulty: editingExercise.difficulty || 'Medium',
        equipment: editingExercise.equipment.join(', ') || '',
        notes: editingExercise.notes || '',
        tags: editingExercise.tags || []
      });
    } else if (open) {
      // Återställ formulär för ny övning
      setFormData({
        title: '',
        description: '',
        category: 'Kvadrater',
        videoType: 'youtube',
        videoUrl: '',
        duration: '',
        difficulty: 'Medium',
        equipment: '',
        notes: '',
        tags: []
      });
    }
  }, [editingExercise, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const exerciseData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      videoType: formData.videoUrl ? formData.videoType : undefined,
      videoUrl: formData.videoUrl || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      difficulty: formData.difficulty,
      equipment: formData.equipment ? formData.equipment.split(',').map(item => item.trim()).filter(Boolean) : [],
      notes: formData.notes || undefined,
      tags: formData.tags
    };

    if (editingExercise) {
      // Om vi redigerar, skicka med ID och timestamps
      onAddExercise({
        ...exerciseData,
        id: editingExercise.id,
        createdAt: editingExercise.createdAt,
        updatedAt: new Date().toISOString()
      } as TrainingExercise);
    } else {
      // Ny övning
      onAddExercise(exerciseData);
    }
    
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingExercise ? 'Redigera övning' : 'Lägg till träningsövning'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TrainingCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="videoType">Videotyp</Label>
              <Select 
                value={formData.videoType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, videoType: value as VideoType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Varaktighet (minuter)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Svårighetsgrad</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as DifficultyLevel }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Utrustning (separera med komma)</Label>
            <Input
              id="equipment"
              value={formData.equipment}
              onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
              placeholder="Koner, bollar, mål..."
            />
          </div>

          <div className="space-y-2">
            <Label>Taggar</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Lägg till tagg..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Lägg till
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Anteckningar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              placeholder="Ytterligare anteckningar..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit">
              {editingExercise ? 'Uppdatera' : 'Lägg till'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
