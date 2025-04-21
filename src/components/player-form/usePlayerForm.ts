
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, PlayerFormValues } from "./formSchema";
import { Player, PlayerPosition } from "@/types/player";

export interface UsePlayerFormProps {
  onSave: (player: Player) => void;
  onCancel: () => void;
  player?: Partial<Player>;
}

export function usePlayerForm({ onSave, onCancel, player }: UsePlayerFormProps) {
  const [imagePreview, setImagePreview] = useState<string | undefined>(player?.image);
  
  // Detect if player is a trainer
  const isTrainer = player?.positions?.includes("TRÄNARE");
  
  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: player?.name || "",
      grade: player?.grade || "A",
      positions: player?.positions || [],
      jerseyNumber: player?.jersey_number || "",
      isTrainer: isTrainer || false,
    },
  });

  // Watch the isTrainer value for UI conditionals
  const isTrainerWatch = form.watch("isTrainer");

  // Handle form submission
  const handleSubmit = form.handleSubmit((values) => {
    const jerseyNumber = values.jerseyNumber;
    
    // Create player object
    const newPlayer: Player = {
      id: player?.id || crypto.randomUUID(),
      name: values.name,
      positions: values.positions,
      image: imagePreview,
      activities: player?.activities || [],
    };

    // Only add grade if not a trainer
    if (!values.isTrainer) {
      newPlayer.grade = values.grade;
    }
    
    // Only add jersey number if provided and not a trainer
    if (jerseyNumber && !values.isTrainer) {
      newPlayer.jersey_number = jerseyNumber;
    }
    
    onSave(newPlayer);
  });

  return { 
    form, 
    imagePreview, 
    setImagePreview, 
    handleSubmit,
    isTrainer: isTrainerWatch 
  };
}
