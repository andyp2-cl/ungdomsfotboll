import { useState, useEffect } from "react";
import { TrainingExercise, TrainingSession, TrainingCategory } from "@/types/training";
import { useToast } from "@/hooks/use-toast";

const TRAINING_STORAGE_KEY = "football-training-data";
const SESSIONS_STORAGE_KEY = "football-training-sessions";

// Backup data in case localStorage gets corrupted
const getDefaultExercises = (): TrainingExercise[] => [
  {
    id: "default-1",
    title: "Passningsövning",
    description: "Grundläggande passningsövning i par",
    category: "Teknik",
    duration: 15,
    equipment: ["Bollar", "Koner"],
    tags: ["pass", "teknik"],
    difficulty: "Lätt",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function useTraining() {
  const [exercises, setExercises] = useState<TrainingExercise[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | "alla">("alla");
  const { toast } = useToast();

  // Ladda data från localStorage
  useEffect(() => {
    try {
      console.log('=== TRAINING DATA RECOVERY ATTEMPT ===');
      console.log('Available localStorage keys:', Object.keys(localStorage));
      
      // Check for alternative storage keys that might exist
      const allKeys = Object.keys(localStorage);
      const potentialExerciseKeys = allKeys.filter(key => 
        key.toLowerCase().includes('training') || 
        key.toLowerCase().includes('exercise')
      );
      
      console.log('Potential training-related keys found:', potentialExerciseKeys);
      
      // Try to load from primary key
      const savedExercises = localStorage.getItem(TRAINING_STORAGE_KEY);
      const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      
      console.log('Primary storage key data:', {
        exercises: savedExercises ? savedExercises.substring(0, 100) + '...' : 'null',
        sessions: savedSessions ? savedSessions.substring(0, 100) + '...' : 'null'
      });
      
      // Try to recover exercises
      let recoveredExercises: TrainingExercise[] = [];
      
      if (savedExercises && savedExercises !== 'undefined' && savedExercises !== 'null') {
        try {
          const parsedExercises = JSON.parse(savedExercises);
          if (Array.isArray(parsedExercises) && parsedExercises.length > 0) {
            console.log('Successfully recovered', parsedExercises.length, 'exercises from primary storage');
            recoveredExercises = parsedExercises;
          }
        } catch (parseError) {
          console.error('Failed to parse exercises from primary storage:', parseError);
        }
      }
      
      // If no exercises found in primary storage, try alternative keys
      if (recoveredExercises.length === 0) {
        console.log('No exercises in primary storage, checking alternative keys...');
        
        for (const key of potentialExerciseKeys) {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);
              if (Array.isArray(parsed) && parsed.length > 0) {
                // Check if this looks like exercise data
                const firstItem = parsed[0];
                if (firstItem && (firstItem.title || firstItem.category || firstItem.duration)) {
                  console.log(`Found potential exercise data in key "${key}":`, parsed.length, 'items');
                  recoveredExercises = parsed;
                  
                  // Restore to primary key
                  localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(parsed));
                  console.log('Restored exercises to primary storage key');
                  break;
                }
              }
            }
          } catch (error) {
            console.log(`Failed to parse data from key "${key}":`, error);
          }
        }
      }
      
      // If still no exercises, check if we should provide defaults
      if (recoveredExercises.length === 0) {
        console.log('No exercises found anywhere. Using default exercises.');
        recoveredExercises = getDefaultExercises();
        localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(recoveredExercises));
      }
      
      setExercises(recoveredExercises);
      
      // Try to recover sessions
      let recoveredSessions: TrainingSession[] = [];
      
      if (savedSessions && savedSessions !== 'undefined' && savedSessions !== 'null') {
        try {
          const parsedSessions = JSON.parse(savedSessions);
          if (Array.isArray(parsedSessions)) {
            console.log('Recovered', parsedSessions.length, 'sessions');
            recoveredSessions = parsedSessions;
          }
        } catch (parseError) {
          console.error('Failed to parse sessions:', parseError);
        }
      }
      
      setSessions(recoveredSessions);
      
      console.log('=== RECOVERY COMPLETE ===');
      console.log('Final state:', {
        exercises: recoveredExercises.length,
        sessions: recoveredSessions.length
      });
      
    } catch (error) {
      console.error("Critical error during training data recovery:", error);
      toast({
        title: "Fel vid laddning",
        description: "Kunde inte ladda träningsdata. Kontrollera konsolen för mer information.",
        variant: "destructive"
      });
      
      // Ensure we have some exercises
      const defaultExercises = getDefaultExercises();
      setExercises(defaultExercises);
      setSessions([]);
    }
  }, [toast]);

  // Spara övningar till localStorage
  const saveExercises = (newExercises: TrainingExercise[]) => {
    try {
      console.log('Saving exercises to localStorage:', newExercises.length, 'items');
      console.log('Exercise sample:', newExercises[0]);
      
      if (!Array.isArray(newExercises)) {
        console.error('Attempted to save non-array as exercises:', newExercises);
        throw new Error('Exercises must be an array');
      }
      
      const serialized = JSON.stringify(newExercises);
      localStorage.setItem(TRAINING_STORAGE_KEY, serialized);
      
      // Create backup with timestamp
      const backupKey = `${TRAINING_STORAGE_KEY}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, serialized);
      
      setExercises(newExercises);
      console.log('Exercises saved successfully');
      
      // Verify save
      const verification = localStorage.getItem(TRAINING_STORAGE_KEY);
      if (verification) {
        const verified = JSON.parse(verification);
        console.log('Save verification successful:', verified.length, 'exercises');
      }
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
      console.log('Saving sessions to localStorage:', newSessions.length, 'items');
      
      if (!Array.isArray(newSessions)) {
        console.error('Attempted to save non-array as sessions:', newSessions);
        throw new Error('Sessions must be an array');
      }
      
      const serialized = JSON.stringify(newSessions);
      localStorage.setItem(SESSIONS_STORAGE_KEY, serialized);
      setSessions(newSessions);
      console.log('Sessions saved successfully');
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
    console.log('Adding new exercise:', exercise.title);
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
    console.log('Updating exercise:', updatedExercise.title, 'ID:', updatedExercise.id);
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
    console.log('Deleting exercise with ID:', exerciseId);
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
