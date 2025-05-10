
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { Player, PlayerPosition } from "@/types/player";
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

  // Ensure development is properly initialized with required values
  const defaultDevelopment = {
    technical: 1,
    gameUnderstanding: 1,
    passing: 1,
    offensive: 1,
    defensive: 1,
    mentality: 1
  };

  // Make sure all required properties exist by using the default values when properties are missing
  const initialDevelopment = initialValues?.development 
    ? {
        technical: initialValues.development.technical ?? defaultDevelopment.technical,
        gameUnderstanding: initialValues.development.gameUnderstanding ?? defaultDevelopment.gameUnderstanding,
        passing: initialValues.development.passing ?? defaultDevelopment.passing,
        offensive: initialValues.development.offensive ?? defaultDevelopment.offensive,
        defensive: initialValues.development.defensive ?? defaultDevelopment.defensive,
        mentality: initialValues.development.mentality ?? defaultDevelopment.mentality
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
    // Create new player object
    const newPlayer: Player = {
      id: initialValues?.id || uuidv4(),
      name: data.name,
      grade: data.isTrainer ? undefined : data.grade, // Only set grade if not a trainer
      positions: data.positions as PlayerPosition[], // Cast to PlayerPosition[] to satisfy type checking
      jerseyNumber: data.jerseyNumber || undefined,
      image: imagePreview,
      activities: initialValues?.activities || [],
      development: { ...data.development } // Ensure all required properties are present
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
