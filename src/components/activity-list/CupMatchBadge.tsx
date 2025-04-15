
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
      <Trophy className="h-3 w-3" />
      {!compact && "Cup"}
    </Badge>
  );
}
