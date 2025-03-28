
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Player, PlayerGrade } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const playerFormSchema = z.object({
  name: z.string().min(2, { message: "Namn måste vara minst 2 tecken" }),
  grade: z.enum(["A", "B", "C", "D", "TRÄNARE"], {
    required_error: "Välj en nivå",
  }),
  position: z.string().optional(),
  jerseyNumber: z.string().optional(),
});

type PlayerFormValues = z.infer<typeof playerFormSchema>;

interface EditPlayerFormProps {
  player: Player;
  onSave: (updatedPlayer: Player) => void;
  onCancel: () => void;
}

export function EditPlayerForm({ player, onSave, onCancel }: EditPlayerFormProps) {
  const { toast } = useToast();
  
  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      name: player.name,
      grade: player.grade,
      position: player.position || "",
      jerseyNumber: player.jerseyNumber || "",
    },
  });

  const handleSubmit = (values: PlayerFormValues) => {
    // Update player with form values
    const updatedPlayer: Player = {
      ...player,
      name: values.name,
      grade: values.grade as PlayerGrade,
      position: values.position || undefined,
      jerseyNumber: values.jerseyNumber || undefined,
    };

    onSave(updatedPlayer);
    toast({
      title: "Spelaren uppdaterad",
      description: `${values.name} har uppdaterats.`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivå</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj nivå" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A">Nivå A</SelectItem>
                  <SelectItem value="B">Nivå B</SelectItem>
                  <SelectItem value="C">Nivå C</SelectItem>
                  <SelectItem value="D">Nivå D</SelectItem>
                  <SelectItem value="TRÄNARE">Tränare</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj position" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MV">Målvakt</SelectItem>
                  <SelectItem value="BACK">Back</SelectItem>
                  <SelectItem value="MF">Mittfält</SelectItem>
                  <SelectItem value="ANF">Anfall</SelectItem>
                  <SelectItem value="TRÄNARE">Tränare</SelectItem>
                </SelectContent>
              </Select>
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
                <Input placeholder="Tröjnummer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
