
/**
 * Types for chart components
 */

import React from 'react';

export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
    icon?: React.ElementType; // Change to ElementType instead of ReactNode
  } | undefined;
}

export interface ChartContextProps {
  config: ChartConfig;
}

export interface ChartLegendContentProps {
  className?: string;
  payload?: any[];
  verticalAlign?: string;
  hideIcon?: boolean;
  nameKey?: string;
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any, name: string) => string;
  className?: string;
  indicator?: React.ReactNode;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  labelFormatter?: (label: any) => React.ReactNode;
  labelClassName?: string;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}
