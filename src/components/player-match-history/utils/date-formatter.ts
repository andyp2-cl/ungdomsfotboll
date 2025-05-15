
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('sv-SE', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};
