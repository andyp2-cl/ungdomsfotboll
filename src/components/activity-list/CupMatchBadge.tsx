
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export interface CupMatchBadgeProps {
  cupName: string;
}

export function CupMatchBadge({ cupName }: CupMatchBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className="bg-amber-50 text-amber-800 hover:bg-amber-100 flex items-center gap-1"
    >
      <Trophy className="h-3 w-3" />
      {cupName}
    </Badge>
  );
}
