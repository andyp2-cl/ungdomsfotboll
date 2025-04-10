
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export function CupMatchBadge() {
  return (
    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
      <Trophy className="h-3 w-3" />
      <span>Cupmatch</span>
    </Badge>
  );
}
