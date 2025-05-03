
import React from "react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScoreInputProps {
  score: number | undefined;
  onChange: (score: number | undefined) => void;
  label: string;
  isHighlighted?: boolean;
  hasError?: boolean;
}

export function ScoreInput({
  score,
  onChange,
  label,
  isHighlighted = false,
  hasError = false
}: ScoreInputProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-1">
      <div className={`font-medium text-center ${isMobile ? 'text-xs' : 'text-sm'} ${isHighlighted ? "font-semibold" : ""}`}>
        {label}
      </div>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        value={score === undefined ? "" : score}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className={`${isMobile ? 'h-10 text-center' : ''} ${isHighlighted ? "border-blue-200" : ""} ${hasError ? "border-red-500" : ""}`}
      />
    </div>
  );
}
