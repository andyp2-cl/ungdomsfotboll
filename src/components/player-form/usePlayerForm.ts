
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from 'uuid';
import { Player, PlayerGrade, PlayerPosition } from "@/types/player";
import { PlayerFormValues, playerFormSchema } from "./formSchema";

interface UsePlayerFormProps {
  onSave: (player: Player) => void;
  onCancel: () => void;
}

export function usePlayerForm({ onSave, onCancel }: UsePlayerFormProps) {
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  
  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      name: "",
      grade: "B",
      positions: [],
      jerseyNumber: "",
    },
  });

  const handleSubmit = (values: PlayerFormValues) => {
    const newPlayer: Player = {
      id: uuidv4(),
      name: values.name,
      grade: values.grade as PlayerGrade,
      positions: values.positions as PlayerPosition[] || [],
      jerseyNumber: values.jerseyNumber || undefined,
      activities: [],
      image: imagePreview,
    };

    onSave(newPlayer);
  };

  return {
    form,
    imagePreview,
    setImagePreview,
    handleSubmit,
    onCancel
  };
}
