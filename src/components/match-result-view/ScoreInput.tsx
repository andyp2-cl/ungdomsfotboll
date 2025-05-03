
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScoreInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  isHighlighted?: boolean;
}

export function ScoreInput({ 
  label, 
  value, 
  onChange, 
  isHighlighted = false 
}: ScoreInputProps) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={`score-${label}`} 
        className={`${isHighlighted ? "font-semibold" : ""} ${isMobile ? "text-sm" : ""}`}
      >
        {label}
      </Label>
      <Input
        id={`score-${label}`}
        type="number"
        inputMode="numeric"
        min={0}
        value={value === undefined ? "" : value}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className={`${isHighlighted ? "border-blue-200" : ""} ${isMobile ? "h-12 text-lg text-center" : ""}`}
      />
    </div>
  );
}
