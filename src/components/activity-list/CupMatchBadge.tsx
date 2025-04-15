
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface CupMatchBadgeProps {
  className?: string;
  compact?: boolean;
}

export function CupMatchBadge({ className, compact = false }: CupMatchBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 ${className || ''}`}
    >
      <Trophy className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {!compact && "Cupmatch"}
    </Badge>
  );
}
