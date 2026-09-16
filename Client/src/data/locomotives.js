/**
 * locomotives.js
 * Definitions and specifications for our default Indian Railways locomotive: WAP-7 "Vidyut Express".
 */

// Array of available locomotive models with complete technical specifications
export const arr_LOCOMOTIVE_MODELS = Object.freeze([
  {
    id: 'loco_wap7_red',
    name: 'WAP-7',
    fullName: 'WAP-7 "Vidyut Express"',
    shortName: 'WAP-7',
    type: 'Electric Passenger & Superfast',
    category: 'Electric',
    serviceType: 'Passenger',
    description: 'Indian Railways flagship 3-phase AC electric passenger locomotive with 6,120 HP, regenerative braking, and dual high-speed pantographs.',
    massKg: 123000, // 123 tonnes
    lengthMeters: 20.6,
    maxPowerWatts: 4560000, // 6,120 HP (4.56 MW)
    powerHp: 6120,
    maxTractiveEffortN: 322000, // 322 kN
    tractionKn: 322,
    topSpeedKmh: 140,
    brakingScore: 92, // /100
    fuelTankLitres: 0,
    fuelCapacityDisplay: '25kV AC Catenary',
    hasPantograph: true,
    bogieWheelCount: 3,
    bodyColor: '#f8fafc',
    cabColor: '#e2e8f0',
    stripeColor: '#dc2626',
    undercarriageColor: '#0f172a',
    handrailColor: '#cbd5e1',
    image: '/assets/trains/locomotives/wap7_profile.jpg',
    priceCredits: 0,
    isDefaultUnlocked: true,
  },
]);

/**
 * Retrieves locomotive specification by identifier string.
 */
export function getLocomotiveById(id) {
  const tmp_found = arr_LOCOMOTIVE_MODELS.find((obj_loco) => obj_loco.id === id);
  return tmp_found || arr_LOCOMOTIVE_MODELS[0];
}
