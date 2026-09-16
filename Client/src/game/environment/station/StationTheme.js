/**
 * StationTheme.js
 * Visual theme specifications for the reusable railway station environment system.
 * Supports: INDIAN, MOUNTAIN, URBAN, RURAL, and INDUSTRIAL.
 */

export const cons_STATION_THEMES = Object.freeze({
  INDIAN: 'indian',
  MOUNTAIN: 'mountain',
  URBAN: 'urban',
  RURAL: 'rural',
  INDUSTRIAL: 'industrial',
});

export const obj_STATION_THEME_PROFILES = Object.freeze({
  [cons_STATION_THEMES.INDIAN]: {
    id: cons_STATION_THEMES.INDIAN,
    name: 'Indian Colonial & Provincial',
    platform: {
      surfaceColor: '#cbd5e1',     // Light grey concrete/stone surface
      copingColor: '#64748b',      // Granite coping edge
      tactileColor: '#facc15',     // Vibrant Indian yellow safety warning strip
      baseWallColor: '#991b1b',    // Red brick face below platform edge
      heightPixels: 34,
      rampLengthMeters: 8,
    },
    canopy: {
      style: 'corrugated_curved',  // Rail-blue curved corrugated iron roof
      sheetColor: '#1d4ed8',       // Blue corrugated sheets
      trussColor: '#334155',       // Tubular angle iron lattice trusses
      pillarColor: '#1e293b',      // Cast iron fluted pillars
      widthMeters: 65,
      heightPixels: 55,
    },
    building: {
      style: 'colonial_brick',     // Red brick with white lime plaster quoins & arches
      wallColor: '#b91c1c',        // Deep colonial red brick
      mortarColor: 'rgba(0,0,0,0.18)',
      plasterTrimColor: '#f8fafc', // Whitewashed lime plaster trim and arches
      roofColor: '#ea580c',        // Terracotta Mangalore roof tiles
      windowColor: '#38bdf8',      // Arched glass windows
      doorColor: '#78350f',        // Teak wood entrance doors
      widthMeters: 58,
      heightPixels: 95,
    },
    sign: {
      style: 'indian_bilingual',   // Yellow rectangular board with bold black border
      bgColor: '#facc15',          // Indian Railways signature yellow
      textColor: '#000000',        // High-contrast bold black lettering
      borderColor: '#000000',      // Solid black perimeter border
      accentColor: '#1e293b',
      hasRegionalScript: true,
      hasElevationTag: true,
    },
    lamp: {
      style: 'victorian_ornate',   // Ornate Victorian cast-iron lantern
      postColor: '#1e293b',        // Dark green/black cast iron
      lanternColor: '#334155',
      lightColor: 'rgba(254, 240, 138, 0.85)', // Warm incandescent glow
      glowRadius: 75,
    },
    bench: {
      style: 'cast_iron_wood',     // Cast iron curved ends with varnished wood slats
      woodColor: '#b45309',
      frameColor: '#1e293b',
    },
    fence: {
      style: 'ornamental_iron',    // Wrought iron decorative spears
      color: '#1e293b',
      postColor: '#0f172a',
      heightPixels: 28,
    },
    foliage: {
      treeType: 'banyan_palm',
      canopyColor: '#15803d',
      trunkColor: '#78350f',
    },
    luggage: ['brass_trunk', 'steel_trunk', 'duffel_bag', 'holdall'],
    equipment: ['chai_stall', 'water_cooler', 'station_master_bell', 'departure_board'],
  },

  [cons_STATION_THEMES.MOUNTAIN]: {
    id: cons_STATION_THEMES.MOUNTAIN,
    name: 'Alpine Timber Chalet',
    platform: {
      surfaceColor: '#78716c',     // Rough flagstone slabs
      copingColor: '#44403c',      // Cut granite blocks
      tactileColor: '#f59e0b',     // Amber chisel-marked safety stone edge
      baseWallColor: '#57534e',    // Fieldstone masonry base
      heightPixels: 32,
      rampLengthMeters: 7,
    },
    canopy: {
      style: 'timber_truss',       // Steep pitched timber king-post truss roof
      sheetColor: '#334155',       // Dark slate shingles with snow trim
      trussColor: '#78350f',       // Heavy dark timber beams
      pillarColor: '#451a03',      // Cedar log uprights
      widthMeters: 55,
      heightPixels: 60,
    },
    building: {
      style: 'alpine_chalet',      // Granite fieldstone base with cedar log upper story
      wallColor: '#78350f',        // Heavy cedar log siding
      mortarColor: '#44403c',
      plasterTrimColor: '#f1f5f9', // Snow-dusted eaves & carved brackets
      roofColor: '#1e293b',        // Steep alpine slate with snow ridge
      windowColor: '#7dd3fc',      // Small mullioned window panes
      doorColor: '#451a03',        // Heavy studded oak door
      widthMeters: 52,
      heightPixels: 105,
    },
    sign: {
      style: 'mountain_carved',    // Carved dark cedar timber plank with white routed text
      bgColor: '#451a03',
      textColor: '#ffffff',
      borderColor: '#78350f',
      accentColor: '#e2e8f0',      // Snow cap accents
      hasRegionalScript: false,
      hasElevationTag: true,
    },
    lamp: {
      style: 'timber_lantern',     // Rustic timber bracket with hanging carriage lantern
      postColor: '#78350f',
      lanternColor: '#1e293b',
      lightColor: 'rgba(251, 191, 36, 0.85)', // Warm amber oil flame
      glowRadius: 70,
    },
    bench: {
      style: 'rustic_log',         // Split cedar log bench on rock risers
      woodColor: '#92400e',
      frameColor: '#57534e',
    },
    fence: {
      style: 'split_rail_timber',  // Zig-zag split cedar rail fence
      color: '#78350f',
      postColor: '#451a03',
      heightPixels: 26,
    },
    foliage: {
      treeType: 'alpine_pine',
      canopyColor: '#14532d',
      trunkColor: '#451a03',
    },
    luggage: ['canvas_rucksack', 'ski_wooden_crate', 'leather_valise'],
    equipment: ['fire_log_stack', 'snow_shovel_rack', 'vintage_station_clock'],
  },

  [cons_STATION_THEMES.URBAN]: {
    id: cons_STATION_THEMES.URBAN,
    name: 'Modern Metropolitan Hub',
    platform: {
      surfaceColor: '#e2e8f0',     // Polished architectural terrazzo / precast concrete
      copingColor: '#94a3b8',      // Chamfered stone curb
      tactileColor: '#facc15',     // High-visibility yellow blister tactile paving
      baseWallColor: '#475569',    // Smooth architectural concrete wall
      heightPixels: 36,
      rampLengthMeters: 9,
    },
    canopy: {
      style: 'glass_barrel',       // Curved aerodynamic barrel-vault tubular steel and glass
      sheetColor: 'rgba(56, 189, 248, 0.55)', // Cyan tinted glass panels
      trussColor: '#334155',       // Tubular white/grey steel spaceframe
      pillarColor: '#475569',      // Sleek cylindrical steel columns
      widthMeters: 75,
      heightPixels: 65,
    },
    building: {
      style: 'modern_glass',       // Curtain wall glass concourse with steel framing
      wallColor: '#1e293b',        // Dark anthracite steel & charcoal panels
      mortarColor: '#0f172a',
      plasterTrimColor: '#38bdf8', // Neon cyan edge accents & LED strips
      roofColor: '#334155',        // Flat composite roof with cantilever canopy
      windowColor: '#38bdf8',      // Tinted floor-to-ceiling curtain glass
      doorColor: '#0284c7',        // Automatic sliding glass doors
      widthMeters: 65,
      heightPixels: 110,
    },
    sign: {
      style: 'urban_led',          // Backlit acrylic LED sign with illuminated cyan/white typography
      bgColor: '#0f172a',
      textColor: '#ffffff',
      borderColor: '#38bdf8',
      accentColor: '#38bdf8',      // Cyan LED glow
      hasRegionalScript: false,
      hasElevationTag: false,
    },
    lamp: {
      style: 'modern_gooseneck',   // Sleek architectural gooseneck LED luminaire
      postColor: '#64748b',
      lanternColor: '#1e293b',
      lightColor: 'rgba(224, 242, 254, 0.9)', // Clean crisp white-blue LED pool
      glowRadius: 85,
    },
    bench: {
      style: 'perforated_chrome',  // Brushed stainless steel perforated bench
      woodColor: '#cbd5e1',
      frameColor: '#475569',
    },
    fence: {
      style: 'modern_glass_panel', // Stainless steel balustrade with glass infill panels
      color: 'rgba(56, 189, 248, 0.4)',
      postColor: '#94a3b8',
      heightPixels: 30,
    },
    foliage: {
      treeType: 'urban_linden',
      canopyColor: '#16a34a',
      trunkColor: '#52525b',
    },
    luggage: ['spinner_suitcase', 'commuter_briefcase', 'duffel_bag'],
    equipment: ['digital_turnstile', 'electronic_departure_board', 'modern_waste_bin'],
  },

  [cons_STATION_THEMES.RURAL]: {
    id: cons_STATION_THEMES.RURAL,
    name: 'Countryside Whistle Stop',
    platform: {
      surfaceColor: '#d6d3d1',     // Weathered timber planking & compacted gravel
      copingColor: '#78716c',      // Heavy creosoted wood edge timber
      tactileColor: '#eab308',     // Painted weathered warning line
      baseWallColor: '#57534e',    // Weathered timber pile underpinning
      heightPixels: 30,
      rampLengthMeters: 7,
    },
    canopy: {
      style: 'timber_tin',         // Simple gabled wooden pole shelter with corrugated tin roof
      sheetColor: '#7c2d12',       // Rusted oxidized tin sheets
      trussColor: '#78350f',       // Rough pine 4x4 rafters
      pillarColor: '#451a03',      // Cedar post supports
      widthMeters: 45,
      heightPixels: 48,
    },
    building: {
      style: 'clapboard_depot',    // Horizontal clapboard siding with tin roof & brick chimney
      wallColor: '#f1f5f9',        // Weathered white/cream clapboards
      mortarColor: '#78716c',
      plasterTrimColor: '#78350f', // Forest green / dark oak door and window trim
      roofColor: '#9a3412',        // Red oxide rusted corrugated tin
      windowColor: '#bae6fd',      // 4-pane sash windows
      doorColor: '#78350f',        // Panelled pine door
      widthMeters: 44,
      heightPixels: 80,
    },
    sign: {
      style: 'rural_enamel',       // Vintage enamel plate with rounded corners and metal mounting posts
      bgColor: '#fef3c7',          // Antique cream enamel
      textColor: '#78350f',        // Dark brown / dark green serif letters
      borderColor: '#78350f',
      accentColor: '#451a03',
      hasRegionalScript: false,
      hasElevationTag: true,
    },
    lamp: {
      style: 'kerosene_pole',      // Green gooseneck enamel shade with warm filament glow
      postColor: '#166534',        // Heritage dark green metal post
      lanternColor: '#14532d',
      lightColor: 'rgba(253, 230, 138, 0.8)', // Warm soft yellow incandescent bulb
      glowRadius: 65,
    },
    bench: {
      style: 'weathered_plank',    // Weathered pine board bench with cast brackets
      woodColor: '#a8a29e',
      frameColor: '#57534e',
    },
    fence: {
      style: 'weathered_wood',     // Split-rail wooden fence
      color: '#a8a29e',
      postColor: '#78716c',
      heightPixels: 24,
    },
    foliage: {
      treeType: 'rural_oak',
      canopyColor: '#15803d',
      trunkColor: '#78350f',
    },
    luggage: ['vintage_valise', 'milk_churn', 'wooden_crate'],
    equipment: ['hand_pump_well', 'baggage_handcart', 'wooden_milk_bench'],
  },

  [cons_STATION_THEMES.INDUSTRIAL]: {
    id: cons_STATION_THEMES.INDUSTRIAL,
    name: 'Industrial Freight Yard Depot',
    platform: {
      surfaceColor: '#64748b',     // Heavy industrial reinforced concrete with expansion joints
      copingColor: '#334155',      // Heavy steel-armored curb angle
      tactileColor: '#eab308',     // Yellow/black diagonal safety hazard edge
      baseWallColor: '#1e293b',    // Cast concrete with grease/soot staining
      heightPixels: 35,
      rampLengthMeters: 10,
    },
    canopy: {
      style: 'steel_gantry',       // Heavy steel I-beam gantry canopy with overhead crane rail
      sheetColor: '#475569',       // Corrugated dark galvanized iron
      trussColor: '#1e293b',       // Heavy riveted steel I-beams
      pillarColor: '#0f172a',      // Heavy boxed steel stanchions
      widthMeters: 70,
      heightPixels: 62,
    },
    building: {
      style: 'freight_bay',        // Multi-bay brick and corrugated iron freight depot
      wallColor: '#44403c',        // Soot-stained dark industrial brick
      mortarColor: '#1c1917',
      plasterTrimColor: '#78716c', // Weathered concrete lintels
      roofColor: '#334155',        // Corrugated iron shed roof
      windowColor: '#94a3b8',      // Wire-reinforced industrial clerestory windows
      doorColor: '#1e293b',        // Heavy roll-up corrugated steel bay doors
      widthMeters: 62,
      heightPixels: 92,
    },
    sign: {
      style: 'industrial_hazard',  // Stamped steel sign with yellow/black diagonal hazard stripes
      bgColor: '#eab308',
      textColor: '#18181b',
      borderColor: '#18181b',
      accentColor: '#000000',
      hasRegionalScript: false,
      hasElevationTag: false,
    },
    lamp: {
      style: 'sodium_floodlight',  // High-intensity dual sodium-vapor floodlight mast
      postColor: '#334155',
      lanternColor: '#0f172a',
      lightColor: 'rgba(245, 158, 11, 0.85)', // Intense yellow-amber sodium wash
      glowRadius: 95,
    },
    bench: {
      style: 'heavy_metal',        // Welded angle iron and perforated metal bench
      woodColor: '#475569',
      frameColor: '#1e293b',
    },
    fence: {
      style: 'chainlink_barbed',   // Galvanized chain link mesh with angled barbed wire outriggers
      color: '#94a3b8',
      postColor: '#64748b',
      heightPixels: 34,
    },
    foliage: {
      treeType: 'industrial_birch',
      canopyColor: '#65a30d',
      trunkColor: '#a1a1aa',
    },
    luggage: ['steel_oil_drum', 'wooden_pallet', 'heavy_machinery_crate'],
    equipment: ['freight_beam_scale', 'fire_buckets_rack', 'forklift_ramp'],
  },
});

/**
 * Returns theme configuration profile with safe fallback to Indian.
 */
export function getStationThemeProfile(themeKey) {
  const tmp_key = (themeKey || '').toLowerCase();
  return obj_STATION_THEME_PROFILES[tmp_key] || obj_STATION_THEME_PROFILES[cons_STATION_THEMES.INDIAN];
}
