
import { z } from "zod";
import { ActivityType } from "@/types/player";

export const activityFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["match", "cup"] as const),
  date: z.date(),
  time: z.string().optional(),
  locationName: z.string().optional(),
  locationDescription: z.string().optional(),
  locationGps: z.string().optional(),
  result: z.string().optional(),
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
  isWin: z.boolean().optional(),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
