/**
 * WeatherConstants.js
 * Definitions and environmental profiles for the 8 weather types:
 * CLEAR, CLOUDY, RAIN, HEAVY_RAIN, SNOW, FOG, SUNSET, NIGHT.
 */

export const cons_WEATHER_TYPES = Object.freeze({
  CLEAR: 'CLEAR',
  CLOUDY: 'CLOUDY',
  RAIN: 'RAIN',
  HEAVY_RAIN: 'HEAVY_RAIN',
  SNOW: 'SNOW',
  FOG: 'FOG',
  SUNSET: 'SUNSET',
  NIGHT: 'NIGHT',
});

export const arr_WEATHER_CYCLE_ORDER = Object.freeze([
  cons_WEATHER_TYPES.CLEAR,
  cons_WEATHER_TYPES.CLOUDY,
  cons_WEATHER_TYPES.RAIN,
  cons_WEATHER_TYPES.HEAVY_RAIN,
  cons_WEATHER_TYPES.SNOW,
  cons_WEATHER_TYPES.FOG,
  cons_WEATHER_TYPES.SUNSET,
  cons_WEATHER_TYPES.NIGHT,
]);

export const obj_WEATHER_PROFILES = Object.freeze({
  [cons_WEATHER_TYPES.CLEAR]: {
    id: cons_WEATHER_TYPES.CLEAR,
    label: 'Clear Sky',
    icon: '☀️',
    sky: {
      gradientStops: [
        { stop: 0, color: '#0284c7' },   // Vibrant deep azure
        { stop: 0.65, color: '#bae6fd' },// Crisp sky blue
        { stop: 1, color: '#f0f9ff' },   // Light horizon haze
      ],
      cloudColor: 'rgba(255, 255, 255, 0.55)',
      cloudAlpha: 0.55,
      cloudCount: 5,
      hasStars: false,
      hasSun: true,
      sunColor: '#fef08a',
      hasMoon: false,
    },
    lighting: {
      ambientMultiplier: 1.0,
      ambientColor: 'rgba(0, 0, 0, 0)', // No darkening
      fogDensity: 0.0,
    },
    visibility: {
      layer2Alpha: 0.45,
      layer3Alpha: 1.0,
      mountainTint: null,
    },
    precipitation: {
      type: 'none',
      density: 0,
      speedY: 0,
      hasSplashes: false,
    },
    track: {
      isWet: false,
      wetGloss: 0.0,
      hasSnow: false,
      snowCoverage: 0.0,
    },
    train: {
      headlightIntensity: 1.0,
      illuminateInterior: false,
      illuminateCoaches: false,
    },
    atmosphere: {
      hasLightning: false,
      hasLayeredFog: false,
    },
  },

  [cons_WEATHER_TYPES.CLOUDY]: {
    id: cons_WEATHER_TYPES.CLOUDY,
    label: 'Overcast',
    icon: '☁️',
    sky: {
      gradientStops: [
        { stop: 0, color: '#475569' },   // Slate overcast
        { stop: 0.55, color: '#64748b' },
        { stop: 1, color: '#94a3b8' },
      ],
      cloudColor: 'rgba(203, 213, 225, 0.7)',
      cloudAlpha: 0.75,
      cloudCount: 8,
      hasStars: false,
      hasSun: false,
      hasMoon: false,
    },
    lighting: {
      ambientMultiplier: 0.82,
      ambientColor: 'rgba(30, 41, 59, 0.12)',
      fogDensity: 0.15,
    },
    visibility: {
      layer2Alpha: 0.35,
      layer3Alpha: 0.95,
      mountainTint: '#475569',
    },
    precipitation: {
      type: 'none',
      density: 0,
      speedY: 0,
      hasSplashes: false,
    },
    track: {
      isWet: false,
      wetGloss: 0.0,
      hasSnow: false,
      snowCoverage: 0.0,
    },
    train: {
      headlightIntensity: 1.1,
      illuminateInterior: false,
      illuminateCoaches: false,
    },
    atmosphere: {
      hasLightning: false,
      hasLayeredFog: false,
    },
  },

  [cons_WEATHER_TYPES.RAIN]: {
    id: cons_WEATHER_TYPES.RAIN,
    label: 'Light Rain',
    icon: '🌧️',
    sky: {
      gradientStops: [
        { stop: 0, color: '#1e293b' },   // Dark rainy slate
        { stop: 0.6, color: '#334155' },
        { stop: 1, color: '#475569' },
      ],
      cloudColor: 'rgba(100, 116, 139, 0.8)',
      cloudAlpha: 0.8,
      cloudCount: 9,
      hasStars: false,
      hasSun: false,
      hasMoon: false,
    },
    lighting: {
      ambientMultiplier: 0.72,
      ambientColor: 'rgba(15, 23, 42, 0.22)', // Cool slate darkening
      fogDensity: 0.25,
    },
    visibility: {
      layer2Alpha: 0.28,
      layer3Alpha: 0.9,
      mountainTint: '#334155',
    },
    precipitation: {
      type: 'rain',
      density: 90,
      speedY: 720,
      hasSplashes: true,
      color: 'rgba(186, 230, 253, 0.65)',
    },
    track: {
      isWet: true,
      wetGloss: 0.75, // Bright reflective sheen
      hasSnow: false,
      snowCoverage: 0.0,
    },
    train: {
      headlightIntensity: 1.35,
      illuminateInterior: true,
      illuminateCoaches: false,
    },
    atmosphere: {
      hasLightning: false,
      hasLayeredFog: false,
    },
  },

  [cons_WEATHER_TYPES.HEAVY_RAIN]: {
    id: cons_WEATHER_TYPES.HEAVY_RAIN,
    label: 'Heavy Storm',
    icon: '⛈️',
    sky: {
      gradientStops: [
        { stop: 0, color: '#090d16' },   // Menacing stormy charcoal
        { stop: 0.5, color: '#1e293b' },
        { stop: 1, color: '#334155' },
      ],
      cloudColor: 'rgba(51, 65, 85, 0.9)',
      cloudAlpha: 0.9,
      cloudCount: 11,
      hasStars: false,
      hasSun: false,
      hasMoon: false,
    },
    lighting: {
      ambientMultiplier: 0.52,
      ambientColor: 'rgba(15, 23, 42, 0.38)', // Stormy dark wash
      fogDensity: 0.45,
    },
    visibility: {
      layer2Alpha: 0.16,
      layer3Alpha: 0.8,
      mountainTint: '#1e293b',
    },
    precipitation: {
      type: 'heavy_rain',
      density: 160,
      speedY: 850,
      hasSplashes: true,
      color: 'rgba(224, 242, 254, 0.75)',
    },
    track: {
      isWet: true,
      wetGloss: 0.95, // Intense wet reflective rails & soaked ballast
      hasSnow: false,
      snowCoverage: 0.0,
    },
    train: {
      headlightIntensity: 1.5,
      illuminateInterior: true,
      illuminateCoaches: true,
    },
    atmosphere: {
      hasLightning: true,
      hasLayeredFog: false,
    },
  },

  [cons_WEATHER_TYPES.SNOW]: {
    id: cons_WEATHER_TYPES.SNOW,
    label: 'Snowfall',
    icon: '❄️',
    sky: {
      gradientStops: [
        { stop: 0, color: '#64748b' },   // Cold frosty blue-grey
        { stop: 0.6, color: '#94a3b8' },
        { stop: 1, color: '#cbd5e1' },
      ],
      cloudColor: 'rgba(241, 245, 249, 0.8)',
      cloudAlpha: 0.85,
      cloudCount: 8,
      hasStars: false,
      hasSun: false,
      hasMoon: false,
    },
    lighting: {
      ambientMultiplier: 0.88,
      ambientColor: 'rgba(224, 242, 254, 0.12)', // Cool diffuse snow bounce
      fogDensity: 0.22,
    },
    visibility: {
      layer2Alpha: 0.32,
      layer3Alpha: 0.9,
      mountainTint: '#64748b',
    },
    precipitation: {
      type: 'snow',
      density: 110,
      speedY: 115,
      hasSplashes: false,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    track: {
      isWet: false,
      wetGloss: 0.2,
      hasSnow: true,
      snowCoverage: 0.85, // White snow on sleepers and ballast
    },
    train: {
      headlightIntensity: 1.25,
      illuminateInterior: true,
      illuminateCoaches: true,
    },
    atmosphere: {
      hasLightning: false,
      hasLayeredFog: false,
    },
  },

  [cons_WEATHER_TYPES.FOG]: {
    id: cons_WEATHER_TYPES.FOG,
    label: 'Dense Fog',
    icon: '🌫️',
    sky: {
      gradientStops: [
        { stop: 0, color: '#94a3b8' },   // Milky atmospheric silver
        { stop: 0.5, color: '#cbd5e1' },
        { stop: 1, color: '#e2e8f0' },
      ],
      cloudColor: 'rgba(226, 232, 240, 0.6)',
      cloudAlpha: 0.6,
      cloudCount: 4,
      hasStars: false,
      hasSun: false,
      hasMoon: false,
    },
    lighting: {
      ambientMultiplier: 0.75,
      ambientColor: 'rgba(226, 232, 240, 0.24)', // Soft milky veil
      fogDensity: 0.85,
    },
    visibility: {
      layer2Alpha: 0.08, // Mountains heavily obscured
      layer3Alpha: 0.65,
      mountainTint: '#94a3b8',
    },
    precipitation: {
      type: 'none',
      density: 0,
      speedY: 0,
      hasSplashes: false,
    },
    track: {
      isWet: true,
      wetGloss: 0.45,
      hasSnow: false,
      snowCoverage: 0.0,
    },
    train: {
      headlightIntensity: 1.6, // Powerful beam cutting through mist
      illuminateInterior: true,
      illuminateCoaches: true,
    },
    atmosphere: {
      hasLightning: false,
      hasLayeredFog: true, // Multi-layer drifting fog ribbons
    },
  },

  [cons_WEATHER_TYPES.SUNSET]: {
    id: cons_WEATHER_TYPES.SUNSET,
    label: 'Golden Sunset',
    icon: '🌅',
    sky: {
      gradientStops: [
        { stop: 0, color: '#311042' },   // Twilight violet
        { stop: 0.35, color: '#9d174d' },// Magenta
        { stop: 0.7, color: '#ea580c' }, // Fiery orange
        { stop: 1, color: '#fde047' },   // Golden yellow horizon
      ],
      cloudColor: 'rgba(251, 146, 60, 0.65)',
      cloudAlpha: 0.65,
      cloudCount: 6,
      hasStars: false,
      hasSun: true,
      sunColor: '#fbbf24',
      hasMoon: false,
    },
    lighting: {
      ambientMultiplier: 0.92,
      ambientColor: 'rgba(249, 115, 22, 0.14)', // Warm golden-amber wash
      fogDensity: 0.08,
    },
    visibility: {
      layer2Alpha: 0.48,
      layer3Alpha: 1.0,
      mountainTint: '#581c87', // Deep purple mountains
    },
    precipitation: {
      type: 'none',
      density: 0,
      speedY: 0,
      hasSplashes: false,
    },
    track: {
      isWet: false,
      wetGloss: 0.5, // Warm golden specular rail shine
      hasSnow: false,
      snowCoverage: 0.0,
    },
    train: {
      headlightIntensity: 1.3,
      illuminateInterior: true,
      illuminateCoaches: true,
    },
    atmosphere: {
      hasLightning: false,
      hasLayeredFog: false,
    },
  },

  [cons_WEATHER_TYPES.NIGHT]: {
    id: cons_WEATHER_TYPES.NIGHT,
    label: 'Starry Night',
    icon: '🌙',
    sky: {
      gradientStops: [
        { stop: 0, color: '#020617' },   // Deepest midnight obsidian
        { stop: 0.6, color: '#090d16' },
        { stop: 1, color: '#0f172a' },
      ],
      cloudColor: 'rgba(30, 41, 59, 0.35)',
      cloudAlpha: 0.35,
      cloudCount: 4,
      hasStars: true,
      hasSun: false,
      hasMoon: true,
      moonColor: '#f1f5f9',
    },
    lighting: {
      ambientMultiplier: 0.28,
      ambientColor: 'rgba(2, 6, 23, 0.58)', // Midnight deep navy wash
      fogDensity: 0.1,
    },
    visibility: {
      layer2Alpha: 0.25,
      layer3Alpha: 0.85,
      mountainTint: '#090d16',
    },
    precipitation: {
      type: 'none',
      density: 0,
      speedY: 0,
      hasSplashes: false,
    },
    track: {
      isWet: false,
      wetGloss: 0.25,
      hasSnow: false,
      snowCoverage: 0.0,
    },
    train: {
      headlightIntensity: 1.8, // Maximum luminous beam projection
      illuminateInterior: true,
      illuminateCoaches: true,
    },
    atmosphere: {
      hasLightning: false,
      hasLayeredFog: false,
    },
  },
});

/**
 * Returns weather configuration profile with fallback to CLEAR.
 */
export function getWeatherProfile(weatherType) {
  const tmp_key = (weatherType || '').toUpperCase();
  return obj_WEATHER_PROFILES[tmp_key] || obj_WEATHER_PROFILES[cons_WEATHER_TYPES.CLEAR];
}
