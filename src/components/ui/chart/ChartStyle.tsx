
import * as React from "react"
import { ChartConfig } from './types'

export function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  // Generate CSS variables for the chart colors
  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {}
    
    // Process each config key for colors
    Object.entries(config).forEach(([key, value]) => {
      if (value && typeof value === 'object' && 'color' in value) {
        vars[`--${key}-color`] = value.color as string
      }
    })
    
    return vars
  }, [config])

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        [data-chart="${id}"] {
          ${Object.entries(cssVars)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n')}
        }
        
        [data-chart="${id}"] .recharts-cartesian-grid line {
          stroke: hsl(var(--border) / 0.5);
        }
        
        [data-chart="${id}"] .recharts-cartesian-axis-tick-value {
          fill: hsl(var(--foreground));
        }
        
        [data-chart="${id}"] .recharts-tooltip-label {
          color: hsl(var(--foreground));
        }
        
        [data-chart="${id}"] .recharts-default-tooltip {
          background-color: hsl(var(--background));
          border-color: hsl(var(--border));
        }
        
        @media (prefers-color-scheme: dark) {
          [data-chart="${id}"] .recharts-surface {
            filter: brightness(0.8) contrast(1.2);
          }
        }
      `
    }} />
  )
}
