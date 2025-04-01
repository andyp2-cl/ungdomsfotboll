
import { z } from "zod";
import { ActivityType } from "@/types/player";

export const activityFormSchema = z.object({
  name: z.string().min(2, { message: "Namn måste vara minst 2 tecken" }),
  type: z.enum(["match", "cup"], {
    required_error: "Välj en aktivitetstyp",
  }),
  date: z.date({
    required_error: "Välj ett datum",
  }),
  time: z.string().optional(),
  locationName: z.string().optional(),
  locationDescription: z.string().optional(),
  locationGps: z.string().optional(),
  result: z.string().optional(),
  homeScore: z.coerce.number().optional(),
  awayScore: z.coerce.number().optional(),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;

// Result-specific types
export interface ResultFieldValues {
  result?: string;
  homeScore?: number;
  awayScore?: number;
}

// Location-specific types
export interface LocationFieldValues {
  locationName?: string;
  locationDescription?: string;
  locationGps?: string;
}
