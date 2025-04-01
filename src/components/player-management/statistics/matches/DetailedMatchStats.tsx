
import React from "react";

interface DetailedMatchStatsProps {
  label: string;
  value: number | string;
  className?: string;
}

export function DetailedMatchStats({ label, value, className = "" }: DetailedMatchStatsProps) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-md ${className}`}>
      <span className="font-medium">{label}</span>
      <span>{value}</span>
    </div>
  );
}
