
/**
 * Types for chart components
 */

export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
    icon?: React.ReactNode;  // Add icon property that was missing
  } | undefined;
}

export interface ChartContextProps {
  config: ChartConfig;
}

// Add the missing types that were referenced
export interface ChartLegendContentProps {
  className?: string;
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any, name: string) => string;
}
