// City distance validation for Currency Exchange delivery
// Only cities within 150km of Panchkula, Haryana are eligible

export interface CityData {
  name: string;
  state: string;
  distanceFromPanchkula: number; // in km
}

// Predefined cities within 150km of Panchkula
export const PREDEFINED_CITIES: CityData[] = [
  { name: "Panchkula", state: "Haryana", distanceFromPanchkula: 0 },
  { name: "Chandigarh", state: "Chandigarh", distanceFromPanchkula: 5 },
  { name: "Mohali", state: "Punjab", distanceFromPanchkula: 10 },
  { name: "Zirakpur", state: "Punjab", distanceFromPanchkula: 15 },
  { name: "Derabassi", state: "Punjab", distanceFromPanchkula: 25 },
  { name: "Ambala", state: "Haryana", distanceFromPanchkula: 45 },
  { name: "Kurukshetra", state: "Haryana", distanceFromPanchkula: 95 },
  { name: "Yamunanagar", state: "Haryana", distanceFromPanchkula: 65 },
  { name: "Jagadhri", state: "Haryana", distanceFromPanchkula: 60 },
  { name: "Karnal", state: "Haryana", distanceFromPanchkula: 120 },
  { name: "Kaithal", state: "Haryana", distanceFromPanchkula: 140 },
  { name: "Pehowa", state: "Haryana", distanceFromPanchkula: 110 },
  { name: "Pinjore", state: "Haryana", distanceFromPanchkula: 12 },
  { name: "Kalka", state: "Haryana", distanceFromPanchkula: 15 },
  { name: "Nalagarh", state: "Himachal Pradesh", distanceFromPanchkula: 35 },
  { name: "Patiala", state: "Punjab", distanceFromPanchkula: 70 },
  { name: "Solan", state: "Himachal Pradesh", distanceFromPanchkula: 50 },
  { name: "Shimla", state: "Himachal Pradesh", distanceFromPanchkula: 115 },
  { name: "Dharampur", state: "Himachal Pradesh", distanceFromPanchkula: 40 },
  { name: "Kasauli", state: "Himachal Pradesh", distanceFromPanchkula: 45 },
];

// Additional cities for dynamic validation (not shown in dropdown but can be typed)
export const ADDITIONAL_VALID_CITIES: CityData[] = [
  { name: "Baddi", state: "Himachal Pradesh", distanceFromPanchkula: 30 },
  { name: "Parwanoo", state: "Himachal Pradesh", distanceFromPanchkula: 35 },
  { name: "Rajpura", state: "Punjab", distanceFromPanchkula: 40 },
  { name: "Kharar", state: "Punjab", distanceFromPanchkula: 15 },
  { name: "Ropar", state: "Punjab", distanceFromPanchkula: 45 },
  { name: "Nangal", state: "Punjab", distanceFromPanchkula: 80 },
  { name: "Morinda", state: "Punjab", distanceFromPanchkula: 50 },
  { name: "Ludhiana", state: "Punjab", distanceFromPanchkula: 100 },
  { name: "Jalandhar", state: "Punjab", distanceFromPanchkula: 145 },
  { name: "Panipat", state: "Haryana", distanceFromPanchkula: 140 },
  { name: "Sonipat", state: "Haryana", distanceFromPanchkula: 145 },
  { name: "Rohtak", state: "Haryana", distanceFromPanchkula: 145 },
  { name: "Saharanpur", state: "Uttar Pradesh", distanceFromPanchkula: 95 },
  { name: "Meerut", state: "Uttar Pradesh", distanceFromPanchkula: 140 },
];

const ALL_KNOWN_CITIES = [...PREDEFINED_CITIES, ...ADDITIONAL_VALID_CITIES];

export const MAX_DELIVERY_RADIUS_KM = 150;

export interface ValidationResult {
  isValid: boolean;
  distance: number | null;
  message: string;
}

/**
 * Validates if a city is within the delivery radius
 */
export function validateCityDistance(cityName: string): ValidationResult {
  if (!cityName || cityName.trim() === "") {
    return {
      isValid: false,
      distance: null,
      message: "Please enter a city name",
    };
  }

  const normalizedInput = cityName.trim().toLowerCase();
  
  // Search in known cities
  const foundCity = ALL_KNOWN_CITIES.find(
    city => city.name.toLowerCase() === normalizedInput
  );

  if (foundCity) {
    if (foundCity.distanceFromPanchkula <= MAX_DELIVERY_RADIUS_KM) {
      return {
        isValid: true,
        distance: foundCity.distanceFromPanchkula,
        message: `✓ ${foundCity.name} is within delivery radius (${foundCity.distanceFromPanchkula} km from Panchkula)`,
      };
    } else {
      return {
        isValid: false,
        distance: foundCity.distanceFromPanchkula,
        message: `Currency exchange delivery is currently available only within 150 km of Panchkula, Haryana.`,
      };
    }
  }

  // For unknown cities, we cannot validate distance - show a message
  return {
    isValid: false,
    distance: null,
    message: `Currency exchange delivery is currently available only within 150 km of Panchkula, Haryana. Please select a city from the list or contact support for other locations.`,
  };
}

/**
 * Searches for cities matching the input
 */
export function searchCities(query: string): CityData[] {
  if (!query || query.trim().length < 2) return PREDEFINED_CITIES;
  
  const normalizedQuery = query.trim().toLowerCase();
  
  return ALL_KNOWN_CITIES.filter(city =>
    city.name.toLowerCase().includes(normalizedQuery) ||
    city.state.toLowerCase().includes(normalizedQuery)
  ).sort((a, b) => a.distanceFromPanchkula - b.distanceFromPanchkula);
}

/**
 * Gets all eligible cities (within 150km)
 */
export function getEligibleCities(): CityData[] {
  return ALL_KNOWN_CITIES
    .filter(city => city.distanceFromPanchkula <= MAX_DELIVERY_RADIUS_KM)
    .sort((a, b) => a.distanceFromPanchkula - b.distanceFromPanchkula);
}
