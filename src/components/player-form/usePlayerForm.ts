
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { Player } from "@/types/player";
import { formSchema } from "./formSchema";

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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || "",
      grade: initialValues?.grade || "A",
      positions: initialValues?.positions || [],
      jerseyNumber: initialValues?.jerseyNumber || "",
      isTrainer: initialValues?.positions?.includes("TRÄNARE") || false
    },
  });

  // Watch for changes in isTrainer field
  const isTrainer = form.watch("isTrainer");

  // When isTrainer changes, update positions and grade
  React.useEffect(() => {
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

  const handleSubmit = (data: any) => {
    // Create new player object
    const newPlayer: Player = {
      id: initialValues?.id || uuidv4(),
      name: data.name,
      grade: data.isTrainer ? undefined : data.grade, // Only set grade if not a trainer
      positions: data.positions,
      jerseyNumber: data.jerseyNumber || undefined,
      image: imagePreview,
      activities: initialValues?.activities || [],
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
