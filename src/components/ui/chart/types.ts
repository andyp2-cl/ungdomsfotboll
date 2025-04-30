
/**
 * Types for chart components
 */

export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
  } | undefined;
}

export interface ChartContextProps {
  config: ChartConfig;
}
