
/**
 * Generates a Google Maps URL for a given location
 * @param location The location name or address
 * @returns A Google Maps URL that opens the location
 */
export function generateGoogleMapsUrl(location: string): string {
  // Encode the location for URL
  const encodedLocation = encodeURIComponent(location);
  return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
}

/**
 * Generates a GPS link for a football field in a city
 * @param fieldName The name of the field
 * @param city Optional city name
 * @returns A Google Maps URL
 */
export function generateFootballFieldUrl(fieldName: string, city: string = 'Hässleholm'): string {
  const query = `${fieldName}, ${city}, Fotbollsplan`;
  return generateGoogleMapsUrl(query);
}
