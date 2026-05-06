import { Client } from '@googlemaps/google-maps-services-js';

const googleMapsClient = new Client({});
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'dummy_key';
const OPEN_WEATHER_MAP_API_KEY = process.env.OPEN_WEATHER_MAP_API_KEY || 'dummy_key';

interface Coordinates {
  lat: number;
  lng: number;
}

export async function calculateETA(origin: Coordinates, destination: Coordinates) {
  if (GOOGLE_MAPS_API_KEY === 'dummy_key') {
    // Dummy response for development
    return {
      durationSeconds: 3600, // 1 hour
      distanceMeters: 50000, // 50 km
      eta: new Date(Date.now() + 3600 * 1000)
    };
  }

  try {
    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [{ lat: origin.lat, lng: origin.lng }],
        destinations: [{ lat: destination.lat, lng: destination.lng }],
        key: GOOGLE_MAPS_API_KEY,
        departure_time: Math.floor(Date.now() / 1000),
      }
    });

    const element = response.data.rows[0].elements[0];
    if (element.status !== 'OK') {
      throw new Error(`Google Maps API Error: ${element.status}`);
    }

    // duration_in_traffic gives a more accurate ETA considering live traffic
    const durationSeconds = element.duration_in_traffic?.value || element.duration.value;
    const distanceMeters = element.distance.value;

    return {
      durationSeconds,
      distanceMeters,
      eta: new Date(Date.now() + durationSeconds * 1000)
    };
  } catch (error) {
    console.error('Error calculating ETA:', error);
    throw error;
  }
}

export async function checkWeatherDelay(destination: Coordinates) {
  if (OPEN_WEATHER_MAP_API_KEY === 'dummy_key') {
    return { hasDelay: false, delayMinutes: 0, reason: 'Development Dummy Weather' };
  }

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${destination.lat}&lon=${destination.lng}&appid=${OPEN_WEATHER_MAP_API_KEY}`);
    const data = await res.json();

    const weatherCondition = data.weather[0]?.main?.toLowerCase();
    
    // Conditions that might cause a delay for a truck carrying construction materials
    if (['snow', 'thunderstorm', 'extreme', 'tornado', 'squall'].includes(weatherCondition)) {
      return {
        hasDelay: true,
        delayMinutes: 60,
        reason: `Severe weather condition: ${data.weather[0].description}`
      };
    } else if (['rain', 'drizzle'].includes(weatherCondition)) {
      return {
        hasDelay: true,
        delayMinutes: 20,
        reason: 'Rainy conditions causing slow traffic'
      };
    }

    return { hasDelay: false, delayMinutes: 0, reason: null };
  } catch (error) {
    console.error('Error checking weather:', error);
    return { hasDelay: false, delayMinutes: 0, reason: null };
  }
}

export async function calculateComprehensiveETA(origin: Coordinates, destination: Coordinates) {
  const { eta, durationSeconds } = await calculateETA(origin, destination);
  const weather = await checkWeatherDelay(destination);

  let finalETA = new Date(eta);
  
  if (weather.hasDelay) {
    finalETA = new Date(finalETA.getTime() + weather.delayMinutes * 60 * 1000);
  }

  return {
    originalETA: eta,
    finalETA,
    weatherDelay: weather.hasDelay ? weather.delayMinutes : 0,
    delayReason: weather.reason
  };
}
