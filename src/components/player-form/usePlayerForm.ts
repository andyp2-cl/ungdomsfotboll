import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { Player, PlayerPosition, PlayerDevelopment } from "@/types/player";
import { formSchema, PlayerFormValues } from "./formSchema";

interface UsePlayerFormProps {
  onSave: (player: Player) => void;
  onCancel: () => void;
  initialValues?: Partial<Player>;
}

export function usePlayerForm({
  onSave,
  onCancel,
  initialValues
}: UsePlayerFormProps) {
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialValues?.image);

  // Complete default development values for all new fields
  const defaultDevelopment: PlayerDevelopment = {
    // Core original values
    technical: 1,
    gameUnderstanding: 1,
    passing: 1,
    offensive: 1,
    defensive: 1,
    mentality: 1,
    
    // New offensive values
    shooting: 1,
    crossing: 1,
    finishing: 1,
    creativity: 1,
    
    // New defensive values
    tackling: 1,
    interception: 1,
    positioning: 1,
    heading: 1,
    
    // New physical values
    speed: 1,
    stamina: 1,
    strength: 1,
    
    // New mental values
    leadership: 1,
    composure: 1,
    workRate: 1
  };

  // For existing players, use their development data or defaults
  const initialDevelopment = initialValues?.development 
    ? {
        // Core original values
        technical: initialValues.development.technical ?? defaultDevelopment.technical,
        gameUnderstanding: initialValues.development.gameUnderstanding ?? defaultDevelopment.gameUnderstanding,
        passing: initialValues.development.passing ?? defaultDevelopment.passing,
        offensive: initialValues.development.offensive ?? defaultDevelopment.offensive,
        defensive: initialValues.development.defensive ?? defaultDevelopment.defensive,
        mentality: initialValues.development.mentality ?? defaultDevelopment.mentality,
        
        // New offensive values - inherit from existing if missing
        shooting: initialValues.development.shooting ?? initialValues.development.offensive ?? defaultDevelopment.shooting,
        crossing: initialValues.development.crossing ?? initialValues.development.passing ?? defaultDevelopment.crossing,
        finishing: initialValues.development.finishing ?? initialValues.development.offensive ?? defaultDevelopment.finishing,
        creativity: initialValues.development.creativity ?? initialValues.development.gameUnderstanding ?? defaultDevelopment.creativity,
        
        // New defensive values - inherit from existing if missing
        tackling: initialValues.development.tackling ?? initialValues.development.defensive ?? defaultDevelopment.tackling,
        interception: initialValues.development.interception ?? initialValues.development.defensive ?? defaultDevelopment.interception,
        positioning: initialValues.development.positioning ?? initialValues.development.gameUnderstanding ?? defaultDevelopment.positioning,
        heading: initialValues.development.heading ?? initialValues.development.defensive ?? defaultDevelopment.heading,
        
        // New physical values - inherit from existing if missing
        speed: initialValues.development.speed ?? initialValues.development.technical ?? defaultDevelopment.speed,
        stamina: initialValues.development.stamina ?? initialValues.development.mentality ?? defaultDevelopment.stamina,
        strength: initialValues.development.strength ?? initialValues.development.defensive ?? defaultDevelopment.strength,
        
        // New mental values - inherit from existing if missing
        leadership: initialValues.development.leadership ?? initialValues.development.mentality ?? defaultDevelopment.leadership,
        composure: initialValues.development.composure ?? initialValues.development.mentality ?? defaultDevelopment.composure,
        workRate: initialValues.development.workRate ?? initialValues.development.mentality ?? defaultDevelopment.workRate
      }
    : defaultDevelopment;

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || "",
      grade: initialValues?.grade || "A",
      positions: initialValues?.positions || [],
      jerseyNumber: initialValues?.jerseyNumber || "",
      isTrainer: initialValues?.positions?.includes("TRÄNARE") || false,
      isActive: initialValues?.isActive !== undefined ? initialValues.isActive : true, // Default to true
      development: initialDevelopment
    },
  });

  // Watch for changes in isTrainer field
  const isTrainer = form.watch("isTrainer");

  // When isTrainer changes, update positions and grade
  useEffect(() => {
    if (isTrainer) {
      // Add TRÄNARE position if it's not already there
      const currentPositions = form.getValues("positions") || [];
      if (!currentPositions.includes("TRÄNARE")) {
        form.setValue("positions", [...currentPositions, "TRÄNARE"]);
      }
      form.setValue("grade", undefined); // Remove grade for trainers
    } else {
      // Remove TRÄNARE position if it exists
      const currentPositions = form.getValues("positions") || [];
      if (currentPositions.includes("TRÄNARE")) {
        form.setValue(
          "positions", 
          currentPositions.filter(pos => pos !== "TRÄNARE")
        );
      }
      // If grade was cleared, set it back to default
      if (!form.getValues("grade")) {
        form.setValue("grade", "A");
      }
    }
  }, [isTrainer, form]);

  const handleSubmit = (data: PlayerFormValues) => {
    // Create new player object with all development values and isActive
    const newPlayer: Player = {
      id: initialValues?.id || uuidv4(),
      name: data.name,
      grade: data.isTrainer ? undefined : data.grade,
      positions: data.positions as PlayerPosition[],
      jerseyNumber: data.jerseyNumber || undefined,
      image: imagePreview,
      activities: initialValues?.activities || [],
      isActive: data.isActive, // Include isActive field
      // Include all development data with complete field set
      development: {
        // Core values
        technical: data.development.technical,
        gameUnderstanding: data.development.gameUnderstanding,
        passing: data.development.passing,
        offensive: data.development.offensive,
        defensive: data.development.defensive,
        mentality: data.development.mentality,
        
        // New offensive values
        shooting: data.development.shooting,
        crossing: data.development.crossing,
        finishing: data.development.finishing,
        creativity: data.development.creativity,
        
        // New defensive values
        tackling: data.development.tackling,
        interception: data.development.interception,
        positioning: data.development.positioning,
        heading: data.development.heading,
        
        // New physical values
        speed: data.development.speed,
        stamina: data.development.stamina,
        strength: data.development.strength,
        
        // New mental values
        leadership: data.development.leadership,
        composure: data.development.composure,
        workRate: data.development.workRate
      }
    };

    onSave(newPlayer);
  };

  return {
    form,
    imagePreview,
    setImagePreview,
    handleSubmit: form.handleSubmit(handleSubmit),
    isTrainer,
  };
}
