/**
 * AssetManifest.js
 * Master asset manifest defining all categorized game assets, formats, fallbacks, and loading priorities.
 * Supports WebP and PNG with automatic negotiation, plus SVG for scalable UI icons.
 */

export const arr_ASSET_MANIFEST = [
  {
    "id": "loco_titan4400",
    "category": "trains/locomotives",
    "name": "Titan-4400 Diesel-Electric",
    "src": "/assets/trains/locomotives/titan4400.webp",
    "fallback": "/assets/trains/locomotives/titan4400.png",
    "type": "image",
    "loading": "eager",
    "description": "4400 HP heavy freight locomotive lead unit"
  },
  {
    "id": "loco_wap7",
    "category": "trains/locomotives",
    "name": "WAP-7 High Speed Electric",
    "src": "/assets/trains/locomotives/wap7.webp",
    "fallback": "/assets/trains/locomotives/wap7.png",
    "type": "image",
    "loading": "lazy",
    "description": "6000 HP passenger electric locomotive"
  },
  {
    "id": "loco_wdg4",
    "category": "trains/locomotives",
    "name": "WDG-4 Heavy Freight",
    "src": "/assets/trains/locomotives/wdg4.webp",
    "fallback": "/assets/trains/locomotives/wdg4.png",
    "type": "image",
    "loading": "lazy",
    "description": "Dedicated heavy freight diesel locomotive"
  },
  {
    "id": "loco_shunter",
    "category": "trains/locomotives",
    "name": "WDS-6 Yard Shunter",
    "src": "/assets/trains/locomotives/shunter.webp",
    "fallback": "/assets/trains/locomotives/shunter.png",
    "type": "image",
    "loading": "lazy",
    "description": "High-torque terminal switching switcher"
  },
  {
    "id": "coach_passenger",
    "category": "trains/coaches",
    "name": "Passenger Coach",
    "src": "/assets/trains/coaches/passenger_coach.webp",
    "fallback": "/assets/trains/coaches/passenger_coach.png",
    "type": "image",
    "loading": "eager",
    "description": "Standard intercity passenger coach"
  },
  {
    "id": "coach_cargo_boxcar",
    "category": "trains/coaches",
    "name": "Covered Freight Boxcar",
    "src": "/assets/trains/coaches/cargo_boxcar.webp",
    "fallback": "/assets/trains/coaches/cargo_boxcar.png",
    "type": "image",
    "loading": "lazy",
    "description": "Heavy steel enclosed cargo wagon"
  },
  {
    "id": "coach_tanker",
    "category": "trains/coaches",
    "name": "Petroleum Tanker Car",
    "src": "/assets/trains/coaches/tanker_car.webp",
    "fallback": "/assets/trains/coaches/tanker_car.png",
    "type": "image",
    "loading": "lazy",
    "description": "Pressurized liquid cargo tank car"
  },
  {
    "id": "tree_pine",
    "category": "environment/trees",
    "name": "Evergreen Pine Tree",
    "src": "/assets/environment/trees/tree_pine.png",
    "fallback": "/assets/environment/trees/tree_pine.webp",
    "type": "image",
    "loading": "lazy",
    "description": "Mountain pass pine tree sprite"
  },
  {
    "id": "tree_deciduous",
    "category": "environment/trees",
    "name": "Deciduous Broadleaf Tree",
    "src": "/assets/environment/trees/tree_deciduous.png",
    "fallback": "/assets/environment/trees/tree_deciduous.webp",
    "type": "image",
    "loading": "lazy",
    "description": "Rural valley deciduous tree sprite"
  },
  {
    "id": "tree_palm",
    "category": "environment/trees",
    "name": "Tropical Palm Tree",
    "src": "/assets/environment/trees/tree_palm.png",
    "fallback": "/assets/environment/trees/tree_palm.webp",
    "type": "image",
    "loading": "lazy",
    "description": "Coastal railway palm tree sprite"
  },
  {
    "id": "station_building",
    "category": "environment/stations",
    "name": "Railway Terminal Building",
    "src": "/assets/environment/stations/station_building.webp",
    "fallback": "/assets/environment/stations/station_building.png",
    "type": "image",
    "loading": "lazy",
    "description": "Classic brick station terminal backdrop"
  },
  {
    "id": "station_sign",
    "category": "environment/stations",
    "name": "Platform Station Sign",
    "src": "/assets/environment/stations/station_sign.png",
    "fallback": "/assets/environment/stations/station_sign.webp",
    "type": "image",
    "loading": "eager",
    "description": "Standard high-contrast station nameboard"
  },
  {
    "id": "station_bench",
    "category": "environment/stations",
    "name": "Platform Bench",
    "src": "/assets/environment/stations/platform_bench.png",
    "fallback": "/assets/environment/stations/platform_bench.webp",
    "type": "image",
    "loading": "lazy",
    "description": "Cast iron platform passenger bench"
  },
  {
    "id": "mountain_distant",
    "category": "environment/mountains",
    "name": "Distant Mountain Parallax",
    "src": "/assets/environment/mountains/mountain_distant.webp",
    "fallback": "/assets/environment/mountains/mountain_distant.png",
    "type": "image",
    "loading": "lazy",
    "description": "Atmospheric deep background mountain range"
  },
  {
    "id": "mountain_mid",
    "category": "environment/mountains",
    "name": "Mid-Range Mountain Parallax",
    "src": "/assets/environment/mountains/mountain_mid.webp",
    "fallback": "/assets/environment/mountains/mountain_mid.png",
    "type": "image",
    "loading": "lazy",
    "description": "Mid-ground mountain ridgeline with foothills"
  },
  {
    "id": "mountain_near",
    "category": "environment/mountains",
    "name": "Near Ridge Mountain Parallax",
    "src": "/assets/environment/mountains/mountain_near.webp",
    "fallback": "/assets/environment/mountains/mountain_near.png",
    "type": "image",
    "loading": "lazy",
    "description": "Close rocky escarpment with vegetation"
  },
  {
    "id": "railway_catenary_pole",
    "category": "environment/railway",
    "name": "Overhead Catenary Mast",
    "src": "/assets/environment/railway/catenary_pole.png",
    "fallback": "/assets/environment/railway/catenary_pole.webp",
    "type": "image",
    "loading": "eager",
    "description": "25kV AC overhead electrification mast"
  },
  {
    "id": "railway_signal_post",
    "category": "environment/railway",
    "name": "Trackside Signal Post",
    "src": "/assets/environment/railway/signal_post.png",
    "fallback": "/assets/environment/railway/signal_post.webp",
    "type": "image",
    "loading": "eager",
    "description": "Multi-aspect railway signal post structure"
  },
  {
    "id": "railway_track_ballast",
    "category": "environment/railway",
    "name": "Track Ballast Bed",
    "src": "/assets/environment/railway/track_ballast.webp",
    "fallback": "/assets/environment/railway/track_ballast.png",
    "type": "image",
    "loading": "eager",
    "description": "Crushed stone railway track roadbed"
  },
  {
    "id": "gauge_bezel",
    "category": "ui/gauges",
    "name": "Machined Gauge Bezel",
    "src": "/assets/ui/gauges/gauge_bezel.png",
    "fallback": "/assets/ui/gauges/gauge_bezel.webp",
    "type": "image",
    "loading": "eager",
    "description": "Metallic brushed circular dial bezel"
  },
  {
    "id": "gauge_glass_sheen",
    "category": "ui/gauges",
    "name": "Gauge Glass Sheen",
    "src": "/assets/ui/gauges/gauge_glass_sheen.webp",
    "fallback": "/assets/ui/gauges/gauge_glass_sheen.png",
    "type": "image",
    "loading": "eager",
    "description": "Convex glass reflection and specular highlight"
  },
  {
    "id": "btn_tactile_base",
    "category": "ui/buttons",
    "name": "Tactile Button Base",
    "src": "/assets/ui/buttons/btn_tactile_base.png",
    "fallback": "/assets/ui/buttons/btn_tactile_base.webp",
    "type": "image",
    "loading": "eager",
    "description": "Recessed mechanical switch collar base"
  },
  {
    "id": "btn_emergency_mushroom",
    "category": "ui/buttons",
    "name": "Emergency Mushroom Button",
    "src": "/assets/ui/buttons/btn_emergency_mushroom.png",
    "fallback": "/assets/ui/buttons/btn_emergency_mushroom.webp",
    "type": "image",
    "loading": "eager",
    "description": "Large tactile emergency brake slam button"
  },
  {
    "id": "icon_horn",
    "category": "ui/icons",
    "name": "Air Horn Icon",
    "src": "/assets/ui/icons/horn.svg",
    "fallback": "/assets/fallbacks/fallback_icon.svg",
    "type": "svg",
    "loading": "eager",
    "description": "Tactile air horn vector icon"
  },
  {
    "id": "icon_headlight",
    "category": "ui/icons",
    "name": "Headlights Icon",
    "src": "/assets/ui/icons/headlight.svg",
    "fallback": "/assets/fallbacks/fallback_icon.svg",
    "type": "svg",
    "loading": "eager",
    "description": "Locomotive headlight switch vector icon"
  },
  {
    "id": "icon_sand",
    "category": "ui/icons",
    "name": "Sander Icon",
    "src": "/assets/ui/icons/sand.svg",
    "fallback": "/assets/fallbacks/fallback_icon.svg",
    "type": "svg",
    "loading": "eager",
    "description": "Traction sand dispenser vector icon"
  },
  {
    "id": "icon_brake",
    "category": "ui/icons",
    "name": "Air Brake Icon",
    "src": "/assets/ui/icons/brake.svg",
    "fallback": "/assets/fallbacks/fallback_icon.svg",
    "type": "svg",
    "loading": "eager",
    "description": "Pneumatic train brake shoe vector icon"
  },
  {
    "id": "icon_camera",
    "category": "ui/icons",
    "name": "Camera Switcher Icon",
    "src": "/assets/ui/icons/camera.svg",
    "fallback": "/assets/fallbacks/fallback_icon.svg",
    "type": "svg",
    "loading": "eager",
    "description": "Viewport camera cycle vector icon"
  },
  {
    "id": "icon_pause",
    "category": "ui/icons",
    "name": "Pause Icon",
    "src": "/assets/ui/icons/pause.svg",
    "fallback": "/assets/fallbacks/fallback_icon.svg",
    "type": "svg",
    "loading": "eager",
    "description": "Game simulation pause vector icon"
  },
  {
    "id": "icon_settings",
    "category": "ui/icons",
    "name": "Settings Gear Icon",
    "src": "/assets/ui/icons/settings.svg",
    "fallback": "/assets/fallbacks/fallback_icon.svg",
    "type": "svg",
    "loading": "eager",
    "description": "Mechanical configuration cog icon"
  },
  {
    "id": "icon_rotate",
    "category": "ui/icons",
    "name": "Screen Rotation Icon",
    "src": "/assets/ui/icons/rotate.svg",
    "fallback": "/assets/fallbacks/fallback_icon.svg",
    "type": "svg",
    "loading": "eager",
    "description": "Mobile orientation guidance icon"
  },
  {
    "id": "icon_speedometer",
    "category": "ui/icons",
    "name": "Speedometer Icon",
    "src": "/assets/ui/icons/speedometer.svg",
    "fallback": "/assets/fallbacks/fallback_icon.svg",
    "type": "svg",
    "loading": "eager",
    "description": "Analog speedometer dial icon"
  },
  {
    "id": "icon_fuel",
    "category": "ui/icons",
    "name": "Fuel Level Icon",
    "src": "/assets/ui/icons/fuel.svg",
    "fallback": "/assets/fallbacks/fallback_icon.svg",
    "type": "svg",
    "loading": "eager",
    "description": "Diesel fuel tank level icon"
  },
  {
    "id": "effect_smoke",
    "category": "effects",
    "name": "Exhaust Smoke Particle",
    "src": "/assets/effects/smoke_puff.png",
    "fallback": "/assets/effects/smoke_puff.webp",
    "type": "image",
    "loading": "lazy",
    "description": "Exhaust stack smoke particle puff"
  },
  {
    "id": "effect_spark",
    "category": "effects",
    "name": "Wheel Slip Spark",
    "src": "/assets/effects/spark.png",
    "fallback": "/assets/effects/spark.webp",
    "type": "image",
    "loading": "lazy",
    "description": "Steel rail friction wheel slip spark"
  },
  {
    "id": "effect_rain_splash",
    "category": "effects",
    "name": "Rain Ground Splash",
    "src": "/assets/effects/rain_splash.png",
    "fallback": "/assets/effects/rain_splash.webp",
    "type": "image",
    "loading": "lazy",
    "description": "Precipitation track splash ring"
  },
  {
    "id": "audio_manifest",
    "category": "audio",
    "name": "Audio Pipeline Configuration",
    "src": "/assets/audio/manifest.json",
    "fallback": null,
    "type": "data",
    "loading": "eager",
    "description": "Web Audio API tracks configuration"
  },
  {
    "id": "fallback_image",
    "category": "fallbacks",
    "name": "Universal Image Fallback",
    "src": "/assets/fallbacks/fallback_image.png",
    "fallback": "/assets/fallbacks/fallback_texture.webp",
    "type": "image",
    "loading": "eager",
    "description": "Default fallback placeholder for missing textures"
  },
  {
    "id": "fallback_icon",
    "category": "fallbacks",
    "name": "Universal Icon Fallback",
    "src": "/assets/fallbacks/fallback_icon.svg",
    "fallback": null,
    "type": "svg",
    "loading": "eager",
    "description": "Warning triangle fallback for missing icons"
  }
];

export const obj_ASSET_MAP = new Map(
  arr_ASSET_MANIFEST.map((item) => [item.id, item])
);

/**
 * Returns definition for a specific asset by ID.
 * 
 * @param {string} assetId
 * @returns {Object|null}
 */
export function fn_getAssetDefinition(assetId) {
  return obj_ASSET_MAP.get(assetId) || null;
}

/**
 * Returns all assets in a specific category.
 * 
 * @param {string} category
 * @returns {Array<Object>}
 */
export function fn_getAssetsByCategory(category) {
  return arr_ASSET_MANIFEST.filter((item) => item.category === category || item.category.startsWith(category));
}

/**
 * Returns all eager/preload assets that should load during initial splash.
 * 
 * @returns {Array<Object>}
 */
export function fn_getEagerAssets() {
  return arr_ASSET_MANIFEST.filter((item) => item.loading === 'eager');
}

/**
 * Returns all lazy assets intended for on-demand loading.
 * 
 * @returns {Array<Object>}
 */
export function fn_getLazyAssets() {
  return arr_ASSET_MANIFEST.filter((item) => item.loading === 'lazy');
}
