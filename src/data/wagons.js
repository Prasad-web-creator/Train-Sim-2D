/**
 * wagons.js
 * Definitions and specifications for various freight wagon types.
 */

// Available freight wagon types with mass, dimensions, and styling properties
export const arr_WAGON_TYPES = Object.freeze([
  {
    id: 'passenger_coach',
    name: 'LHB Rajdhani Passenger Coach',
    emptyMassKg: 42000,
    cargoMassKg: 10000,
    lengthMeters: 24.0,
    bodyColor: '#cbd5e1',
    accentColor: '#dc2626',
    cargoName: 'Passengers',
    cargoColor: '#dc2626',
    wagonKind: 'passenger',
  },
  {
    id: 'wagon_grain_hopper',
    name: 'Grain Hopper Car',
    emptyMassKg: 28000,
    cargoMassKg: 65000,
    lengthMeters: 16.5,
    bodyColor: '#854d0e',
    accentColor: '#ca8a04',
    cargoName: 'Wheat & Grain',
    cargoColor: '#fde047',
    wagonKind: 'hopper',
  },
  {
    id: 'wagon_flatbed_lumber',
    name: 'Flatbed Lumber Wagon',
    emptyMassKg: 22000,
    cargoMassKg: 54000,
    lengthMeters: 17.2,
    bodyColor: '#166534',
    accentColor: '#15803d',
    cargoName: 'Timber Logs',
    cargoColor: '#b45309',
    wagonKind: 'flatbed',
  },
  {
    id: 'wagon_boxcar_red',
    name: 'Steel Boxcar',
    emptyMassKg: 29000,
    cargoMassKg: 58000,
    lengthMeters: 18.0,
    bodyColor: '#991b1b',
    accentColor: '#dc2626',
    cargoName: 'Manufactured Goods',
    cargoColor: '#451a03',
    wagonKind: 'boxcar',
  },
  {
    id: 'wagon_container_blue',
    name: 'Intermodal Container Car',
    emptyMassKg: 24000,
    cargoMassKg: 62000,
    lengthMeters: 19.5,
    bodyColor: '#1e3a8a',
    accentColor: '#2563eb',
    cargoName: 'Intermodal Freight',
    cargoColor: '#0284c7',
    wagonKind: 'container',
  },
]);

/**
 * Retrieves wagon configuration object by identifier.
 */
export function getWagonById(id) {
  const tmp_found = arr_WAGON_TYPES.find((obj_wagon) => obj_wagon.id === id);
  return tmp_found || arr_WAGON_TYPES[0];
}
