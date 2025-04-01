
import { z } from "zod";

export const playerFormSchema = z.object({
  name: z.string().min(2, { message: "Namn måste vara minst 2 tecken" }),
  grade: z.enum(["A", "B", "C", "D"], {
    required_error: "Välj en nivå",
  }),
  positions: z.array(z.string()).optional(),
  jerseyNumber: z.string().optional(),
});

export type PlayerFormValues = z.infer<typeof playerFormSchema>;

// List of available positions with labels
export const positionOptions = [
  { value: "MV", label: "Målvakt" },
  { value: "BACK", label: "Back" },
  { value: "MF", label: "Mittfält" },
  { value: "ANF", label: "Anfall" },
  { value: "TRÄNARE", label: "Tränare" }
];
