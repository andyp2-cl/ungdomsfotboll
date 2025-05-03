
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";

interface ScoreInputProps {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  isHighlighted?: boolean;
}

export function ScoreInput({ label, value, onChange, isHighlighted = false }: ScoreInputProps) {
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
        value={value === undefined ? "" : value}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className={`${isMobile ? 'h-10 text-center' : ''} ${isHighlighted ? "border-blue-200" : ""}`}
      />
    </div>
  );
}
