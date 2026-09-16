/**
 * DayNightConstants.js
 * Definitions and interpolation math for the 7 continuous dynamic time-of-day phases:
 * DAWN, MORNING, NOON, AFTERNOON, SUNSET, EVENING, NIGHT.
 *
 * Configures sky gradient stops, solar and lunar orbital coordinates, ambient darkness wash,
 * distant mountain attenuation, station lighting, building window illumination,
 * signal Fresnel glow multipliers, train headlight importance, and dashboard backlighting.
 */

export const cons_TIME_PHASES = Object.freeze({
  DAWN: 'DAWN',
  MORNING: 'MORNING',
  NOON: 'NOON',
  AFTERNOON: 'AFTERNOON',
  SUNSET: 'SUNSET',
  EVENING: 'EVENING',
  NIGHT: 'NIGHT',
});

export const arr_TIME_PHASE_ORDER = Object.freeze([
  cons_TIME_PHASES.DAWN,
  cons_TIME_PHASES.MORNING,
  cons_TIME_PHASES.NOON,
  cons_TIME_PHASES.AFTERNOON,
  cons_TIME_PHASES.SUNSET,
  cons_TIME_PHASES.EVENING,
  cons_TIME_PHASES.NIGHT,
]);

/**
 * Keyframe profiles for each time phase anchored to specific clock hours (0.00 to 24.00).
 */
export const obj_TIME_PHASE_PROFILES = Object.freeze({
  [cons_TIME_PHASES.DAWN]: {
    id: cons_TIME_PHASES.DAWN,
    label: 'Dawn',
    icon: '🌅',
    hour: 5.5, // 05:30 AM
    skyGradientStops: [
      { stop: 0.0, color: '#1e1b4b' }, // Deep violet-indigo night retreat
      { stop: 0.45, color: '#701a75' }, // Radiant magenta dawn glow
      { stop: 1.0, color: '#fbcfe8' }, // Soft rose-peach horizon
    ],
    sun: {
      visible: true,
      azimuthRatio: 0.15, // Low on eastern horizon
      altitudeRatio: 0.82, // Just peeking above landscape
      size: 26,
      color: '#fde047',
      alpha: 0.85,
    },
    moon: {
      visible: false,
      azimuthRatio: 0.85,
      altitudeRatio: 0.35,
      size: 18,
      alpha: 0.0,
    },
    starsAlpha: 0.15, // Fading morning stars
    ambient: {
      brightnessMultiplier: 0.72,
      darknessOverlayRgba: 'rgba(76, 29, 149, 0.14)', // Soft violet morning mist wash
      mountainAlpha: 0.35,
      mountainTint: '#4c1d95',
    },
    lighting: {
      stationLampIntensity: 0.4,
      buildingLightsActive: 0.4,
      headlightNeed: 0.65,
      headlightIntensity: 1.3,
      signalHaloMultiplier: 1.4,
      dashboardBacklight: 0.35,
    },
  },

  [cons_TIME_PHASES.MORNING]: {
    id: cons_TIME_PHASES.MORNING,
    label: 'Morning',
    icon: '🌤️',
    hour: 8.5, // 08:30 AM
    skyGradientStops: [
      { stop: 0.0, color: '#0284c7' }, // Crisp azure blue
      { stop: 0.6, color: '#7dd3fc' }, // Pale sky blue
      { stop: 1.0, color: '#e0f2fe' }, // Pristine morning horizon
    ],
    sun: {
      visible: true,
      azimuthRatio: 0.32,
      altitudeRatio: 0.45, // Climbing in sky
      size: 30,
      color: '#fef08a',
      alpha: 0.95,
    },
    moon: {
      visible: false,
      azimuthRatio: 0.9,
      altitudeRatio: 0.5,
      size: 18,
      alpha: 0.0,
    },
    starsAlpha: 0.0,
    ambient: {
      brightnessMultiplier: 0.95,
      darknessOverlayRgba: 'rgba(0, 0, 0, 0)', // Crisp clear morning sunlight
      mountainAlpha: 0.42,
      mountainTint: null,
    },
    lighting: {
      stationLampIntensity: 0.0, // Lamps off
      buildingLightsActive: 0.0, // Windows daylight tinted
      headlightNeed: 0.2,
      headlightIntensity: 1.0,
      signalHaloMultiplier: 1.0,
      dashboardBacklight: 0.0,
    },
  },

  [cons_TIME_PHASES.NOON]: {
    id: cons_TIME_PHASES.NOON,
    label: 'Noon',
    icon: '☀️',
    hour: 12.0, // 12:00 PM
    skyGradientStops: [
      { stop: 0.0, color: '#0369a1' }, // Deep brilliant azure
      { stop: 0.6, color: '#38bdf8' }, // High midday cyan
      { stop: 1.0, color: '#bae6fd' }, // Sun-bleached horizon
    ],
    sun: {
      visible: true,
      azimuthRatio: 0.50, // Zenith center
      altitudeRatio: 0.16, // High in upper sky
      size: 34,
      color: '#ffffff',
      alpha: 1.0,
    },
    moon: {
      visible: false,
      azimuthRatio: 0.0,
      altitudeRatio: 0.8,
      size: 18,
      alpha: 0.0,
    },
    starsAlpha: 0.0,
    ambient: {
      brightnessMultiplier: 1.0,
      darknessOverlayRgba: 'rgba(0, 0, 0, 0)',
      mountainAlpha: 0.46,
      mountainTint: null,
    },
    lighting: {
      stationLampIntensity: 0.0,
      buildingLightsActive: 0.0,
      headlightNeed: 0.1,
      headlightIntensity: 0.85,
      signalHaloMultiplier: 1.0,
      dashboardBacklight: 0.0,
    },
  },

  [cons_TIME_PHASES.AFTERNOON]: {
    id: cons_TIME_PHASES.AFTERNOON,
    label: 'Afternoon',
    icon: '☀️',
    hour: 16.0, // 04:00 PM
    skyGradientStops: [
      { stop: 0.0, color: '#075985' }, // Deepening blue
      { stop: 0.6, color: '#38bdf8' },
      { stop: 1.0, color: '#fed7aa' }, // Golden pre-sunset horizon warm wash
    ],
    sun: {
      visible: true,
      azimuthRatio: 0.70, // Descending westward
      altitudeRatio: 0.42,
      size: 32,
      color: '#fef08a',
      alpha: 0.95,
    },
    moon: {
      visible: false,
      azimuthRatio: 0.1,
      altitudeRatio: 0.7,
      size: 18,
      alpha: 0.0,
    },
    starsAlpha: 0.0,
    ambient: {
      brightnessMultiplier: 0.96,
      darknessOverlayRgba: 'rgba(251, 146, 60, 0.06)', // Subtle warm amber afternoon glow
      mountainAlpha: 0.42,
      mountainTint: '#9a3412',
    },
    lighting: {
      stationLampIntensity: 0.0,
      buildingLightsActive: 0.0,
      headlightNeed: 0.25,
      headlightIntensity: 1.0,
      signalHaloMultiplier: 1.05,
      dashboardBacklight: 0.0,
    },
  },

  [cons_TIME_PHASES.SUNSET]: {
    id: cons_TIME_PHASES.SUNSET,
    label: 'Sunset',
    icon: '🌅',
    hour: 18.5, // 06:30 PM
    skyGradientStops: [
      { stop: 0.0, color: '#7c2d12' }, // Burnt sienna / crimson upper sky
      { stop: 0.45, color: '#ea580c' }, // Fiery orange dusk band
      { stop: 1.0, color: '#fde047' }, // Brilliant golden yellow horizon
    ],
    sun: {
      visible: true,
      azimuthRatio: 0.88, // Low on western horizon
      altitudeRatio: 0.76, // Dipping into landscape
      size: 38,
      color: '#fdba74',
      alpha: 0.92,
    },
    moon: {
      visible: false,
      azimuthRatio: 0.2,
      altitudeRatio: 0.5,
      size: 20,
      alpha: 0.0,
    },
    starsAlpha: 0.0,
    ambient: {
      brightnessMultiplier: 0.82,
      darknessOverlayRgba: 'rgba(249, 115, 22, 0.16)', // Warm golden sunset wash
      mountainAlpha: 0.38,
      mountainTint: '#7c2d12',
    },
    lighting: {
      stationLampIntensity: 0.3, // Lamps warming up
      buildingLightsActive: 0.3, // First windows illuminate
      headlightNeed: 0.5,
      headlightIntensity: 1.25,
      signalHaloMultiplier: 1.35,
      dashboardBacklight: 0.35,
    },
  },

  [cons_TIME_PHASES.EVENING]: {
    id: cons_TIME_PHASES.EVENING,
    label: 'Evening',
    icon: '🌆',
    hour: 20.5, // 08:30 PM
    skyGradientStops: [
      { stop: 0.0, color: '#0f172a' }, // Night sky settling
      { stop: 0.5, color: '#312e81' }, // Deep indigo twilight
      { stop: 1.0, color: '#4338ca' }, // Electric purple dusk horizon
    ],
    sun: {
      visible: false,
      azimuthRatio: 0.95,
      altitudeRatio: 1.1,
      size: 32,
      color: '#ea580c',
      alpha: 0.0,
    },
    moon: {
      visible: true,
      azimuthRatio: 0.45,
      altitudeRatio: 0.35,
      size: 22,
      alpha: 0.75,
    },
    starsAlpha: 0.55, // Stars begin shining
    ambient: {
      brightnessMultiplier: 0.58,
      darknessOverlayRgba: 'rgba(30, 27, 75, 0.32)', // Deepening indigo dusk wash
      mountainAlpha: 0.28,
      mountainTint: '#1e1b4b',
    },
    lighting: {
      stationLampIntensity: 0.85, // Station lamps active
      buildingLightsActive: 0.85, // Warm yellow window panes
      headlightNeed: 0.85, // Headlights become important
      headlightIntensity: 1.5,
      signalHaloMultiplier: 1.8,
      dashboardBacklight: 0.75, // Instrument backlight on
    },
  },

  [cons_TIME_PHASES.NIGHT]: {
    id: cons_TIME_PHASES.NIGHT,
    label: 'Night',
    icon: '🌙',
    hour: 23.5, // 11:30 PM
    skyGradientStops: [
      { stop: 0.0, color: '#020617' }, // Midnight abyss
      { stop: 0.6, color: '#090d16' }, // Dark navy
      { stop: 1.0, color: '#0f172a' }, // Deep horizon navy
    ],
    sun: {
      visible: false,
      azimuthRatio: 0.5,
      altitudeRatio: 1.5,
      size: 32,
      color: '#ffffff',
      alpha: 0.0,
    },
    moon: {
      visible: true,
      azimuthRatio: 0.72,
      altitudeRatio: 0.24, // High in night sky
      size: 24,
      alpha: 1.0,
    },
    starsAlpha: 1.0, // Full twinkling star field
    ambient: {
      brightnessMultiplier: 0.38,
      darknessOverlayRgba: 'rgba(2, 6, 23, 0.64)', // Deep midnight darkness wash
      mountainAlpha: 0.20, // Distant mountains dark silhouettes
      mountainTint: '#030712',
    },
    lighting: {
      stationLampIntensity: 1.0, // Full brilliance
      buildingLightsActive: 1.0, // All interior lights on
      headlightNeed: 1.0, // Crucial for visibility!
      headlightIntensity: 1.85, // Maximum projection beam
      signalHaloMultiplier: 2.2, // Huge glowing Fresnel halo
      dashboardBacklight: 1.0, // Full cockpit glow
    },
  },
});

/**
 * Chronological ordered keyframe array for smooth continuous time interpolation.
 */
export const arr_TIMELINE_KEYFRAMES = Object.freeze([
  { phase: cons_TIME_PHASES.NIGHT, hour: 0.0, profile: obj_TIME_PHASE_PROFILES[cons_TIME_PHASES.NIGHT] },
  { phase: cons_TIME_PHASES.DAWN, hour: 5.5, profile: obj_TIME_PHASE_PROFILES[cons_TIME_PHASES.DAWN] },
  { phase: cons_TIME_PHASES.MORNING, hour: 8.5, profile: obj_TIME_PHASE_PROFILES[cons_TIME_PHASES.MORNING] },
  { phase: cons_TIME_PHASES.NOON, hour: 12.0, profile: obj_TIME_PHASE_PROFILES[cons_TIME_PHASES.NOON] },
  { phase: cons_TIME_PHASES.AFTERNOON, hour: 16.0, profile: obj_TIME_PHASE_PROFILES[cons_TIME_PHASES.AFTERNOON] },
  { phase: cons_TIME_PHASES.SUNSET, hour: 18.5, profile: obj_TIME_PHASE_PROFILES[cons_TIME_PHASES.SUNSET] },
  { phase: cons_TIME_PHASES.EVENING, hour: 20.5, profile: obj_TIME_PHASE_PROFILES[cons_TIME_PHASES.EVENING] },
  { phase: cons_TIME_PHASES.NIGHT, hour: 23.5, profile: obj_TIME_PHASE_PROFILES[cons_TIME_PHASES.NIGHT] },
  { phase: cons_TIME_PHASES.NIGHT, hour: 24.0, profile: obj_TIME_PHASE_PROFILES[cons_TIME_PHASES.NIGHT] },
]);

/**
 * Linear interpolation helper.
 */
export function fn_lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Parses hex or rgba string into [r, g, b, a].
 */
export function fn_parseColor(colorStr) {
  if (!colorStr) return [0, 0, 0, 0];

  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return [r, g, b, 1.0];
  }

  if (colorStr.startsWith('rgba') || colorStr.startsWith('rgb')) {
    const parts = colorStr.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      const r = parseFloat(parts[0]);
      const g = parseFloat(parts[1]);
      const b = parseFloat(parts[2]);
      const a = parts.length >= 4 ? parseFloat(parts[3]) : 1.0;
      return [r, g, b, a];
    }
  }

  return [0, 0, 0, 0];
}

/**
 * Smoothly interpolates between two color strings (hex or rgba).
 */
export function fn_lerpColor(c1, c2, t) {
  const [r1, g1, b1, a1] = fn_parseColor(c1);
  const [r2, g2, b2, a2] = fn_parseColor(c2);

  const r = Math.round(fn_lerp(r1, r2, t));
  const g = Math.round(fn_lerp(g1, g2, t));
  const b = Math.round(fn_lerp(b1, b2, t));
  const a = Math.round(fn_lerp(a1, a2, t) * 100) / 100;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Finds the two bounding keyframes and interpolation factor t for a given hour (0 to 24).
 */
export function fn_getTimeKeyframes(hour) {
  const tmp_h = ((hour % 24) + 24) % 24;

  for (let tmp_i = 0; tmp_i < arr_TIMELINE_KEYFRAMES.length - 1; tmp_i++) {
    const k1 = arr_TIMELINE_KEYFRAMES[tmp_i];
    const k2 = arr_TIMELINE_KEYFRAMES[tmp_i + 1];

    if (tmp_h >= k1.hour && tmp_h <= k2.hour) {
      const span = k2.hour - k1.hour;
      const t = span > 0 ? (tmp_h - k1.hour) / span : 0;
      return { k1, k2, t, hour: tmp_h };
    }
  }

  return {
    k1: arr_TIMELINE_KEYFRAMES[0],
    k2: arr_TIMELINE_KEYFRAMES[1],
    t: 0,
    hour: tmp_h,
  };
}

/**
 * Computes smoothly interpolated time-of-day parameters for any arbitrary clock hour.
 */
export function fn_interpolateDayNight(hour) {
  const { k1, k2, t } = fn_getTimeKeyframes(hour);
  const p1 = k1.profile;
  const p2 = k2.profile;

  // Determine active primary phase label
  const activePhase = t < 0.5 ? k1.phase : k2.phase;

  // Interpolate sky gradient stops
  const skyStops = [];
  const count = Math.min(p1.skyGradientStops.length, p2.skyGradientStops.length);
  for (let i = 0; i < count; i++) {
    const s1 = p1.skyGradientStops[i];
    const s2 = p2.skyGradientStops[i];
    skyStops.push({
      stop: fn_lerp(s1.stop, s2.stop, t),
      color: fn_lerpColor(s1.color, s2.color, t),
    });
  }

  // Interpolate sun
  const sun = {
    visible: p1.sun.visible || p2.sun.visible,
    azimuthRatio: fn_lerp(p1.sun.azimuthRatio, p2.sun.azimuthRatio, t),
    altitudeRatio: fn_lerp(p1.sun.altitudeRatio, p2.sun.altitudeRatio, t),
    size: fn_lerp(p1.sun.size, p2.sun.size, t),
    color: fn_lerpColor(p1.sun.color, p2.sun.color, t),
    alpha: fn_lerp(p1.sun.alpha, p2.sun.alpha, t),
  };

  // Interpolate moon
  const moon = {
    visible: p1.moon.visible || p2.moon.visible,
    azimuthRatio: fn_lerp(p1.moon.azimuthRatio, p2.moon.azimuthRatio, t),
    altitudeRatio: fn_lerp(p1.moon.altitudeRatio, p2.moon.altitudeRatio, t),
    size: fn_lerp(p1.moon.size, p2.moon.size, t),
    alpha: fn_lerp(p1.moon.alpha, p2.moon.alpha, t),
  };

  // Interpolate stars alpha
  const starsAlpha = fn_lerp(p1.starsAlpha, p2.starsAlpha, t);

  // Interpolate ambient lighting
  const ambient = {
    brightnessMultiplier: fn_lerp(p1.ambient.brightnessMultiplier, p2.ambient.brightnessMultiplier, t),
    darknessOverlayRgba: fn_lerpColor(p1.ambient.darknessOverlayRgba, p2.ambient.darknessOverlayRgba, t),
    mountainAlpha: fn_lerp(p1.ambient.mountainAlpha, p2.ambient.mountainAlpha, t),
    mountainTint: p1.ambient.mountainTint && p2.ambient.mountainTint
      ? fn_lerpColor(p1.ambient.mountainTint, p2.ambient.mountainTint, t)
      : (p1.ambient.mountainTint || p2.ambient.mountainTint || null),
  };

  // Interpolate functional lighting
  const lighting = {
    stationLampIntensity: fn_lerp(p1.lighting.stationLampIntensity, p2.lighting.stationLampIntensity, t),
    buildingLightsActive: fn_lerp(p1.lighting.buildingLightsActive, p2.lighting.buildingLightsActive, t),
    headlightNeed: fn_lerp(p1.lighting.headlightNeed, p2.lighting.headlightNeed, t),
    headlightIntensity: fn_lerp(p1.lighting.headlightIntensity, p2.lighting.headlightIntensity, t),
    signalHaloMultiplier: fn_lerp(p1.lighting.signalHaloMultiplier, p2.lighting.signalHaloMultiplier, t),
    dashboardBacklight: fn_lerp(p1.lighting.dashboardBacklight, p2.lighting.dashboardBacklight, t),
  };

  return {
    phase: activePhase,
    hour,
    skyStops,
    sun,
    moon,
    starsAlpha,
    ambient,
    lighting,
  };
}
