
import { useState, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Player, PlayerGrade } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, UserCircle, Camera, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useIsMobile } from "@/hooks/use-mobile";

const playerFormSchema = z.object({
  name: z.string().min(2, { message: "Namn måste vara minst 2 tecken" }),
  grade: z.enum(["A", "B", "C", "D", "TRÄNARE"], {
    required_error: "Välj en nivå",
  }),
  position: z.string().optional(),
  jerseyNumber: z.string().optional(),
});

type PlayerFormValues = z.infer<typeof playerFormSchema>;

interface AddPlayerFormProps {
  onSave: (player: Player) => void;
  onCancel: () => void;
}

export function AddPlayerForm({ onSave, onCancel }: AddPlayerFormProps) {
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      name: "",
      grade: "B",
      position: "",
      jerseyNumber: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImagePreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (values: PlayerFormValues) => {
    // Create a new player with form values and a unique ID
    const newPlayer: Player = {
      id: uuidv4(),
      name: values.name,
      grade: values.grade as PlayerGrade,
      position: values.position || undefined,
      jerseyNumber: values.jerseyNumber || undefined,
      activities: [],
      image: imagePreview,
    };

    onSave(newPlayer);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 w-full max-w-md mx-auto px-2">
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-2">
            <div 
              className="h-24 w-24 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Player" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-16 w-16 text-gray-400" />
              )}
              <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            {imagePreview && (
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white" 
                onClick={handleRemoveImage}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <span className="text-sm text-muted-foreground">Klicka för att lägga till bild</span>
        </div>

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

        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-end space-x-2'} pt-4`}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className={isMobile ? 'w-full' : ''}
          >
            <X className="h-4 w-4 mr-2" />
            Avbryt
          </Button>
          <Button 
            type="submit"
            className={isMobile ? 'w-full' : ''}
          >
            <Save className="h-4 w-4 mr-2" />
            Spara
          </Button>
        </div>
      </form>
    </Form>
  );
}
