
// Utility functions for grade-related operations

/**
 * Gets the color for a specific grade level
 */
export const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A': return '#22c55e'; // green-500
    case 'B': return '#3b82f6'; // blue-500
    case 'C': return '#f97316'; // orange-500
    case 'D': return '#a855f7'; // purple-500
    default: return '#6b7280'; // gray-500
  }
};

/**
 * Get chart config for grades
 */
export const getGradeChartConfig = () => ({
  gradeA: { theme: { light: '#22c55e', dark: '#22c55e' } },
  gradeB: { theme: { light: '#3b82f6', dark: '#3b82f6' } },
  gradeC: { theme: { light: '#f97316', dark: '#f97316' } },
  gradeD: { theme: { light: '#a855f7', dark: '#a855f7' } },
});
