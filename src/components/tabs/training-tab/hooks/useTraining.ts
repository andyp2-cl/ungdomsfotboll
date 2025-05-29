
import { useState, useEffect } from "react";
import { TrainingExercise, TrainingSession, TrainingCategory } from "@/types/training";
import { useToast } from "@/hooks/use-toast";

const TRAINING_STORAGE_KEY = "football-training-data";
const SESSIONS_STORAGE_KEY = "football-training-sessions";

export function useTraining() {
  const [exercises, setExercises] = useState<TrainingExercise[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | "alla">("alla");
  const { toast } = useToast();

  // Ladda data från localStorage
  useEffect(() => {
    try {
      const savedExercises = localStorage.getItem(TRAINING_STORAGE_KEY);
      const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      
      if (savedExercises) {
        setExercises(JSON.parse(savedExercises));
      }
      
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      }
    } catch (error) {
      console.error("Error loading training data:", error);
    }
  }, []);

  // Spara övningar till localStorage
  const saveExercises = (newExercises: TrainingExercise[]) => {
    try {
      localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(newExercises));
      setExercises(newExercises);
    } catch (error) {
      console.error("Error saving exercises:", error);
      toast({
        title: "Fel vid sparning",
        description: "Kunde inte spara övningen.",
        variant: "destructive"
      });
    }
  };

  // Spara sessioner till localStorage
  const saveSessions = (newSessions: TrainingSession[]) => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(newSessions));
      setSessions(newSessions);
    } catch (error) {
      console.error("Error saving sessions:", error);
      toast({
        title: "Fel vid sparning",
        description: "Kunde inte spara träningspasset.",
        variant: "destructive"
      });
    }
  };

  const addExercise = (exercise: Omit<TrainingExercise, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExercise: TrainingExercise = {
      ...exercise,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const newExercises = [...exercises, newExercise];
    saveExercises(newExercises);
    
    toast({
      title: "Övning tillagd",
      description: `${exercise.title} har lagts till.`
    });
  };

  const updateExercise = (updatedExercise: TrainingExercise) => {
    const newExercises = exercises.map(ex => 
      ex.id === updatedExercise.id 
        ? { ...updatedExercise, updatedAt: new Date().toISOString() }
        : ex
    );
    saveExercises(newExercises);
    
    toast({
      title: "Övning uppdaterad",
      description: `${updatedExercise.title} har uppdaterats.`
    });
  };

  const deleteExercise = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const newExercises = exercises.filter(ex => ex.id !== exerciseId);
    saveExercises(newExercises);
    
    toast({
      title: "Övning borttagen",
      description: `${exercise?.title} har tagits bort.`
    });
  };

  const addSession = (session: Omit<TrainingSession, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSession: TrainingSession = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const newSessions = [...sessions, newSession];
    saveSessions(newSessions);
    
    toast({
      title: "Träningspass skapat",
      description: `${session.name} har skapats.`
    });
  };

  const updateSession = (updatedSession: TrainingSession) => {
    const newSessions = sessions.map(session => 
      session.id === updatedSession.id 
        ? { ...updatedSession, updatedAt: new Date().toISOString() }
        : session
    );
    saveSessions(newSessions);
    
    toast({
      title: "Träningspass uppdaterat",
      description: `${updatedSession.name} har uppdaterats.`
    });
  };

  const deleteSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    const newSessions = sessions.filter(s => s.id !== sessionId);
    saveSessions(newSessions);
    
    toast({
      title: "Träningspass borttaget",
      description: `${session?.name} har tagits bort.`
    });
  };

  return {
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
  };
}
