import { Activity, ActivityType } from "@/types/player";

export function groupByActivityType(activities: Activity[], type: ActivityType): Activity[] {
  // Fix the comparison to use === instead of == which was causing the type error
  return activities.filter(activity => activity.type === type);
}
