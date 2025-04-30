
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Player } from "@/types/player";
import { Form } from "@/components/ui/form";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "./player-form/ImageUploadField";
import { PlayerFormFields } from "./player-form/PlayerFormFields";
import { TrainerCheckbox } from "./player-form/TrainerCheckbox";

interface EditPlayerFormProps {
  player: Player;
  onSave: (updatedPlayer: Player) => void;
  onCancel: () => void;
}

export function EditPlayerForm({ player, onSave, onCancel }: EditPlayerFormProps) {
  const [isTrainer, setIsTrainer] = useState(player.positions?.includes("TRÄNARE") || false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(player.image);

  const formSchema = z.object({
    name: z.string().min(2, { message: "Namn måste vara minst 2 tecken" }),
    grade: z.enum(["A", "B", "C", "D"]).optional(),
    positions: z.array(z.enum(["MV", "BACK", "MF", "ANF", "TRÄNARE"])).optional(),
    jerseyNumber: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: player.name,
      grade: isTrainer ? undefined : player.grade,
      positions: player.positions || [],
      jerseyNumber: player.jerseyNumber || "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Create updated player with form values
    const updatedPlayer: Player = {
      ...player,
      name: values.name,
      // Only set grade if not a trainer
      grade: isTrainer ? undefined : (values.grade || "A"),
      positions: values.positions,
      jerseyNumber: values.jerseyNumber || undefined,
      image: imagePreview
    };

    onSave(updatedPlayer);
  };

  const handleTrainerChange = (checked: boolean) => {
    setIsTrainer(checked);
    
    // If becoming a trainer, add TRÄNARE to positions and remove grade
    if (checked) {
      const currentPositions = form.getValues("positions") || [];
      if (!currentPositions.includes("TRÄNARE")) {
        form.setValue("positions", [...currentPositions, "TRÄNARE"]);
      }
      form.setValue("grade", undefined);
    } else {
      // If no longer a trainer, remove TRÄNARE from positions and set default grade
      const currentPositions = form.getValues("positions") || [];
      form.setValue("positions", currentPositions.filter(pos => pos !== "TRÄNARE"));
      form.setValue("grade", "A");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <ImageUploadField 
          imagePreview={imagePreview} 
          setImagePreview={setImagePreview} 
        />

        <TrainerCheckbox 
          isTrainer={isTrainer} 
          onChange={handleTrainerChange} 
        />

        <PlayerFormFields 
          form={form} 
          isTrainer={isTrainer} 
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Avbryt
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Spara
          </Button>
        </div>
      </form>
    </Form>
  );
}
