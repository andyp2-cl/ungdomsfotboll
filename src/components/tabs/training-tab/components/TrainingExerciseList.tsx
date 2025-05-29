
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Play, Clock, Users } from "lucide-react";
import { TrainingExercise, TrainingCategory, TRAINING_CATEGORIES } from "@/types/training";
import { YouTubeEmbed } from "./YouTubeEmbed";

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

      {/* Övningslista */}
      <div className="grid gap-6">
        {filteredExercises.map(exercise => (
          <Card key={exercise.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{exercise.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{exercise.category}</Badge>
                    <Badge 
                      className={`text-white ${getDifficultyColor(exercise.difficulty)}`}
                    >
                      {exercise.difficulty}
                    </Badge>
                    {exercise.duration && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {exercise.duration} min
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditExercise(exercise)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteExercise(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{exercise.description}</p>
              
              {/* YouTube video */}
              {exercise.youtubeUrl && (
                <YouTubeEmbed 
                  url={exercise.youtubeUrl} 
                  title={exercise.title}
                />
              )}
              
              {/* Taggar */}
              {exercise.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {exercise.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Utrustning */}
              {exercise.equipment.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Utrustning:</p>
                  <p className="text-sm text-muted-foreground">
                    {exercise.equipment.join(', ')}
                  </p>
                </div>
              )}
              
              {/* Anteckningar */}
              {exercise.notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Anteckningar:</p>
                  <p className="text-sm text-muted-foreground">{exercise.notes}</p>
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
