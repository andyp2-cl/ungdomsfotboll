
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrainingExerciseList } from "./components/TrainingExerciseList";
import { TrainingSessionPlanner } from "./components/TrainingSessionPlanner";
import { AddExerciseDialog } from "./components/AddExerciseDialog";
import { Button } from "@/components/ui/button";
import { Plus, PlayCircle, Calendar } from "lucide-react";
import { useTraining } from "./hooks/useTraining";
import { TrainingExercise } from "@/types/training";

export function TrainingTabContent() {
  const [activeSubTab, setActiveSubTab] = useState("exercises");
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<TrainingExercise | null>(null);
  
  const {
    exercises,
    sessions,
    selectedCategory,
    setSelectedCategory,
    addExercise,
    updateExercise,
    deleteExercise,
    addSession,
    updateSession,
    deleteSession
  } = useTraining();

  const handleEditExercise = (exercise: TrainingExercise) => {
    setEditingExercise(exercise);
  };

  const handleExerciseUpdate = (updatedExercise: TrainingExercise) => {
    updateExercise(updatedExercise);
    setEditingExercise(null);
  };

  const handleAddExercise = (exercise: Omit<TrainingExercise, 'id' | 'createdAt' | 'updatedAt'>) => {
    addExercise(exercise);
    setIsAddExerciseOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Träning</h2>
        <Button onClick={() => setIsAddExerciseOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Lägg till övning
        </Button>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="exercises" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            Övningar
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Träningspass
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="mt-6">
          <TrainingExerciseList
            exercises={exercises}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onEditExercise={handleEditExercise}
            onDeleteExercise={deleteExercise}
          />
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <TrainingSessionPlanner
            exercises={exercises}
            sessions={sessions}
            onAddSession={addSession}
            onUpdateSession={updateSession}
            onDeleteSession={deleteSession}
          />
        </TabsContent>
      </Tabs>

      {/* Add Exercise Dialog */}
      <AddExerciseDialog
        open={isAddExerciseOpen}
        onOpenChange={setIsAddExerciseOpen}
        onAddExercise={handleAddExercise}
      />

      {/* Edit Exercise Dialog */}
      <AddExerciseDialog
        open={editingExercise !== null}
        onOpenChange={(open) => !open && setEditingExercise(null)}
        onAddExercise={handleExerciseUpdate}
        editingExercise={editingExercise}
      />
    </div>
  );
}
