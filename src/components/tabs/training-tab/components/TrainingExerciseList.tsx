
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Clock } from "lucide-react";
import { TrainingExercise, TrainingCategory, TRAINING_CATEGORIES } from "@/types/training";
import { VideoEmbed } from "./VideoEmbed";

interface TrainingExerciseListProps {
  exercises: TrainingExercise[];
  selectedCategory: TrainingCategory | "alla";
  onCategoryChange: (category: TrainingCategory | "alla") => void;
  onEditExercise: (exercise: TrainingExercise) => void;
  onDeleteExercise: (exerciseId: string) => void;
}

export function TrainingExerciseList({
  exercises,
  selectedCategory,
  onCategoryChange,
  onEditExercise,
  onDeleteExercise
}: TrainingExerciseListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrera övningar baserat på kategori och sök
  const filteredExercises = exercises.filter(exercise => {
    const matchesCategory = selectedCategory === "alla" || exercise.category === selectedCategory;
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Lätt': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Svår': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter och sök */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Sök övningar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Välj kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alla">Alla kategorier</SelectItem>
            {TRAINING_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resultat */}
      <div className="text-sm text-muted-foreground">
        {filteredExercises.length} övningar
      </div>

      {/* Övningslista - Nu med 3-kolumners rutnätslayout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map(exercise => (
          <Card key={exercise.id} className="overflow-hidden flex flex-col h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2 flex-1 min-w-0">
                  <CardTitle className="text-base line-clamp-2">{exercise.title}</CardTitle>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">{exercise.category}</Badge>
                    <Badge 
                      className={`text-white text-xs ${getDifficultyColor(exercise.difficulty)}`}
                    >
                      {exercise.difficulty}
                    </Badge>
                    {exercise.duration && (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {exercise.duration} min
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditExercise(exercise)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteExercise(exercise.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 flex-1 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3">{exercise.description}</p>
              
              {/* Video - Kompaktare för rutnätet */}
              {exercise.videoUrl && exercise.videoType && (
                <div className="w-full">
                  <VideoEmbed 
                    url={exercise.videoUrl} 
                    videoType={exercise.videoType}
                    title={exercise.title}
                    className="rounded-md"
                  />
                </div>
              )}
              
              {/* Taggar - Kompaktare layout */}
              {exercise.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {exercise.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {exercise.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{exercise.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Utrustning - Kortare format */}
              {exercise.equipment.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Utrustning:</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {exercise.equipment.slice(0, 3).join(', ')}
                    {exercise.equipment.length > 3 && '...'}
                  </p>
                </div>
              )}
              
              {/* Anteckningar - Kortare format */}
              {exercise.notes && (
                <div>
                  <p className="text-xs font-medium mb-1">Anteckningar:</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{exercise.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Inga övningar hittades. Lägg till din första övning!
          </p>
        </Card>
      )}
    </div>
  );
}
