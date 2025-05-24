
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { Activity } from '@/types/player';

interface CupMatchBadgeProps {
  activity?: Activity;
  className?: string;
  compact?: boolean;
}

export function CupMatchBadge({ activity, className, compact = false }: CupMatchBadgeProps) {
  // Only show if activity has cupId or cupName
  if (!activity || (!activity.cupId && !activity.cupName)) {
    return null;
  }

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 border-amber-500 text-amber-700 bg-amber-50 ${className || ''}`}
    >
      <Trophy className="h-3 w-3" />
      {!compact && "Cup"}
    </Badge>
  );
}
