import { Platform } from 'react-native';
import {
  GOOGLE_GEOCODING_KEY_ANDROID,
  GOOGLE_GEOCODING_KEY_IOS,
} from '@env';


const GOOGLE_API_KEY = Platform.select({
  android: GOOGLE_GEOCODING_KEY_ANDROID,
  ios: GOOGLE_GEOCODING_KEY_IOS,
});

/**
 * Extract best possible city name (works for restricted areas)
 */
const extractCity = (components: any[]) => {
  const priority = [
    'locality',
    'postal_town',
    'administrative_area_level_3',
    'administrative_area_level_2',
    'sublocality_level_1',
  ];

  for (const type of priority) {
    const match = components.find(c => c.types.includes(type));
    if (match) return match.long_name;
  }

  return null;
};

/**
 * Get city from postal code or address (Worldwide)
 */
export const getCityFromPostalCode = async (
  value: string
): Promise<string | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      value
    )}&key=${GOOGLE_API_KEY}`;

    


    const response = await fetch(url);
    const data = await response.json();
    console.log("GEO API:",url);
    console.log("GEO data:",data);

    if (data.status !== 'OK' || !data.results.length) {
      return null;
    }

    const components = data.results[0].address_components;
    return extractCity(components);
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
