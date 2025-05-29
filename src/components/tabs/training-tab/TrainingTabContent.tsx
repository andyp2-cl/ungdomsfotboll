
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrainingExerciseList } from "./components/TrainingExerciseList";
import { TrainingSessionPlanner } from "./components/TrainingSessionPlanner";
import { AddExerciseDialog } from "./components/AddExerciseDialog";
import { Button } from "@/components/ui/button";
import { Plus, PlayCircle, Calendar } from "lucide-react";
import { useTraining } from "./hooks/useTraining";

export function TrainingTabContent() {
  const [activeSubTab, setActiveSubTab] = useState("exercises");
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  
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
            onEditExercise={updateExercise}
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

      <AddExerciseDialog
        open={isAddExerciseOpen}
        onOpenChange={setIsAddExerciseOpen}
        onAddExercise={addExercise}
      />
    </div>
  );
}
