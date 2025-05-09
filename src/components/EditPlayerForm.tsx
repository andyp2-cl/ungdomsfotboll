
import React, { useState } from "react";
import { Player, PlayerGrade, PlayerPosition } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, X } from "lucide-react";
import { ImageUploadField } from "./player-form/ImageUploadField";
import { DevelopmentFields } from "./player-form/DevelopmentFields";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, PlayerFormValues } from "./player-form/formSchema";

interface EditPlayerFormProps {
  player: Player;
  onSave: (updatedPlayer: Player) => void;
  onCancel: () => void;
}

export function EditPlayerForm({ player, onSave, onCancel }: EditPlayerFormProps) {
  const [isTrainer, setIsTrainer] = useState(player.positions?.includes("TRÄNARE") || false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(player.image);

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: player.name,
      grade: isTrainer ? undefined : player.grade,
      positions: player.positions || [],
      jerseyNumber: player.jerseyNumber || "",
      isTrainer,
      development: player.development || {
        technical: 1,
        gameUnderstanding: 1,
        passing: 1,
        offensive: 1,
        defensive: 1,
        mentality: 1
      }
    },
  });

  const handleSubmit = (values: PlayerFormValues) => {
    // Create updated player with form values
    const updatedPlayer: Player = {
      ...player,
      name: values.name,
      // Only set grade if not a trainer
      grade: isTrainer ? undefined : (values.grade || "A"),
      positions: values.positions as PlayerPosition[],
      jerseyNumber: values.jerseyNumber || undefined,
      image: imagePreview,
      development: values.development
    };

    onSave(updatedPlayer);
  };

  // Available player positions
  const positions: { label: string; value: PlayerPosition }[] = [
    { label: "Målvakt", value: "MV" },
    { label: "Back", value: "BACK" },
    { label: "Mittfältare", value: "MF" },
    { label: "Anfallare", value: "ANF" },
    { label: "Tränare", value: "TRÄNARE" },
  ];

  const handleTrainerChange = (checked: boolean) => {
    setIsTrainer(checked);
    form.setValue("isTrainer", checked);
    
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Namn</FormLabel>
              <FormControl>
                <Input placeholder="Spelarens namn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-4">
          <div className="flex items-center mb-4">
            <Checkbox 
              id="is-trainer" 
              checked={isTrainer}
              onCheckedChange={handleTrainerChange}
              className="mr-2"
            />
            <Label htmlFor="is-trainer">Detta är en tränare</Label>
          </div>
        </div>

        {!isTrainer && (
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Nivå</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-2"
                  >
                    {["A", "B", "C", "D"].map((grade) => (
                      <FormItem
                        key={grade}
                        className="flex items-center space-x-1 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={grade} id={`grade-${grade}`} />
                        </FormControl>
                        <Label
                          htmlFor={`grade-${grade}`}
                          className="font-normal cursor-pointer"
                        >
                          {grade}
                        </Label>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="positions"
          render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel>Position</FormLabel>
              </div>
              <div className="flex flex-wrap gap-2">
                {positions.filter(pos => isTrainer ? pos.value === "TRÄNARE" : true).map((position) => (
                  <FormField
                    key={position.value}
                    control={form.control}
                    name="positions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={position.value}
                          className="flex items-center space-x-1 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(position.value)}
                              onCheckedChange={(checked) => {
                                const currentPositions = field.value || [];
                                if (checked) {
                                  field.onChange([...currentPositions, position.value]);
                                } else {
                                  field.onChange(
                                    currentPositions.filter((val) => val !== position.value)
                                  );
                                }
                              }}
                              id={`position-${position.value}`}
                              className="hidden"
                            />
                          </FormControl>
                          <Badge
                            variant={
                              field.value?.includes(position.value)
                                ? "default"
                                : "outline"
                            }
                            className="px-3 py-1 cursor-pointer select-none"
                            onClick={() => {
                              const currentPositions = field.value || [];
                              if (currentPositions.includes(position.value)) {
                                field.onChange(
                                  currentPositions.filter((val) => val !== position.value)
                                );
                              } else {
                                field.onChange([...currentPositions, position.value]);
                              }
                            }}
                          >
                            {position.label}
                          </Badge>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jerseyNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tröjnummer</FormLabel>
              <FormControl>
                <Input placeholder="t.ex. 10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-4">
          <DevelopmentFields form={form} />
        </div>

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
