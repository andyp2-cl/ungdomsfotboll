import { z } from "zod";

// Schema för matcher som kräver hemmalag och bortalag
const matchSchema = z.object({
  type: z.literal("match"),
  homeTeam: z.string().min(1, "Hemmalag är obligatoriskt"),
  awayTeam: z.string().min(1, "Bortalag är obligatoriskt"),
  name: z.string().optional(), // Namnet sätts automatiskt för matcher
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
  isWin: z.boolean().optional(),
  leagueId: z.string().optional(),
  cupName: z.string().optional(),
});

// Schema för cuper som kräver namn
const cupSchema = z.object({
  type: z.literal("cup"),
  name: z.string().min(1, "Cupnamn är obligatoriskt"),
  homeTeam: z.string().optional(),
  awayTeam: z.string().optional(),
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
  isWin: z.boolean().optional(),
  leagueId: z.string().optional(),
  cupName: z.string().optional(),
});

// Gemensamma fält för alla aktivitetstyper
const commonFields = {
  date: z.date(),
  time: z.string().optional(),
  location: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    gpsLink: z.string().optional(),
  }),
};

// Kombinera schemana med discriminated union baserat på type
export const activityFormSchema = z.discriminatedUnion("type", [
  matchSchema.extend(commonFields),
  cupSchema.extend(commonFields),
]);

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
