
import { z } from "zod";
import { PlayerPosition } from "@/types/player";

export const positionOptions = [
  { label: "Målvakt", value: "MV" },
  { label: "Back", value: "BACK" },
  { label: "Mittfältare", value: "MF" },
  { label: "Anfallare", value: "ANF" },
  { label: "Tränare", value: "TRÄNARE" },
];

export const formSchema = z.object({
  name: z.string().min(2, { message: "Namn måste vara minst 2 tecken" }),
  grade: z.enum(["A", "B", "C", "D"]).optional(),
  positions: z.array(z.enum(["MV", "BACK", "MF", "ANF", "TRÄNARE"])),
  jerseyNumber: z.string().optional(),
  isTrainer: z.boolean().default(false),
});

export type PlayerFormValues = z.infer<typeof formSchema>;
