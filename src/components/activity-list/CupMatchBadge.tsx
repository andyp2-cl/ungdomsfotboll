
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface CupMatchBadgeProps {
  className?: string;
}

export function CupMatchBadge({ className }: CupMatchBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 ${className || ''}`}
    >
      <Trophy className="h-3.5 w-3.5" />
      Cupmatch
    </Badge>
  );
}
