
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Trash2 } from "lucide-react";
import { TrainingExercise, TrainingSession } from "@/types/training";

interface TrainingSessionPlannerProps {
  exercises: TrainingExercise[];
  sessions: TrainingSession[];
  onAddSession: (session: Omit<TrainingSession, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSession: (session: TrainingSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function TrainingSessionPlanner({
  exercises,
  sessions,
  onAddSession,
  onUpdateSession,
  onDeleteSession
}: TrainingSessionPlannerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newSession, setNewSession] = useState({
    name: '',
    description: '',
    exercises: [] as Array<{ exerciseId: string; duration: number; notes?: string; order: number }>
  });

  const handleCreateSession = () => {
    if (!newSession.name.trim()) return;
    
    const totalDuration = newSession.exercises.reduce((sum, ex) => sum + ex.duration, 0);
    
    onAddSession({
      name: newSession.name,
      description: newSession.description || undefined,
      exercises: newSession.exercises,
      totalDuration
    });
    
    setNewSession({ name: '', description: '', exercises: [] });
    setIsCreating(false);
  };

  const addExerciseToSession = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    setNewSession(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
        exerciseId,
        duration: exercise.duration || 10,
        order: prev.exercises.length
      }]
    }));
  };

  const removeExerciseFromSession = (index: number) => {
    setNewSession(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Träningspass</h3>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Skapa nytt pass
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Skapa nytt träningspass</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionName">Namn på träningspass</Label>
              <Input
                id="sessionName"
                value={newSession.name}
                onChange={(e) => setNewSession(prev => ({ ...prev, name: e.target.value }))}
                placeholder="T.ex. Teknikträning vecka 1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionDescription">Beskrivning</Label>
              <Textarea
                id="sessionDescription"
                value={newSession.description}
                onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beskriv syftet med träningspasset..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Välj övningar</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                {exercises.map(exercise => (
                  <Button
                    key={exercise.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addExerciseToSession(exercise.id)}
                    className="justify-start"
                  >
                    {exercise.title} ({exercise.category})
                  </Button>
                ))}
              </div>
            </div>
            
            {newSession.exercises.length > 0 && (
              <div className="space-y-2">
                <Label>Valda övningar</Label>
                <div className="space-y-2">
                  {newSession.exercises.map((sessionEx, index) => {
                    const exercise = exercises.find(ex => ex.id === sessionEx.exerciseId);
                    if (!exercise) return null;
                    
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <span className="flex-1">{exercise.title}</span>
                        <Badge variant="outline">{exercise.category}</Badge>
                        <Input
                          type="number"
                          value={sessionEx.duration}
                          onChange={(e) => {
                            const newExercises = [...newSession.exercises];
                            newExercises[index].duration = parseInt(e.target.value) || 0;
                            setNewSession(prev => ({ ...prev, exercises: newExercises }));
                          }}
                          className="w-20"
                          min="1"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeExerciseFromSession(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total tid: {newSession.exercises.reduce((sum, ex) => sum + ex.duration, 0)} minuter
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleCreateSession} disabled={!newSession.name.trim()}>
                Skapa pass
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Avbryt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {sessions.map(session => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{session.name}</CardTitle>
                  {session.description && (
                    <p className="text-muted-foreground mt-1">{session.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.totalDuration} min
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteSession(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium">Övningar ({session.exercises.length})</h4>
                <div className="space-y-1">
                  {session.exercises.map((sessionEx, index) => {
                    const exercise = exercises.find(ex => ex.id === sessionEx.exerciseId);
                    if (!exercise) return null;
                    
                    return (
                      <div key={index} className="flex items-center justify-between py-1 px-2 bg-muted rounded">
                        <span>{exercise.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {sessionEx.duration} min
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && !isCreating && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Inga träningspass skapade än. Skapa ditt första pass!
          </p>
        </Card>
      )}
    </div>
  );
}
