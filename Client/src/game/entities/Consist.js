/**
 * Consist.js
 * Assembles locomotive and coupled freight wagons into a train consist with coupler mechanics.
 */

import { Train } from './Train.js';
import { Wagon } from './Wagon.js';
import { getLocomotiveById } from '../../data/locomotives.js';
import { getWagonById } from '../../data/wagons.js';

export class Consist {
  /**
   * Initializes train consist with a locomotive and trailing coupled wagons.
   */
  constructor(locomotiveId, arr_wagonIds = []) {
    const obj_locoModel = typeof locomotiveId === 'string' ? getLocomotiveById(locomotiveId) : (locomotiveId?.id ? locomotiveId : getLocomotiveById(locomotiveId));
    this.locomotive = new Train(obj_locoModel);

    // Initialize wagons array
    this.arr_wagons = (arr_wagonIds || []).map((wagonId, index) => {
      const obj_wagonType = typeof wagonId === 'string' ? getWagonById(wagonId) : wagonId;
      return new Wagon(obj_wagonType, index);
    });

    this.couplerSlackMeters = 0.95; // Standard coupler gap between buffer beams
    this.totalMassKg = this.calculateTotalMass();
  }

  /**
   * Getter for array of coupled wagons.
   */
  get wagons() {
    return this.arr_wagons;
  }

  /**
   * Calculates total aggregate mass of locomotive and all freight wagons in kilograms.
   */
  calculateTotalMass() {
    let tmp_total = this.locomotive.model.massKg;
    for (let tmp_i = 0; tmp_i < this.arr_wagons.length; tmp_i++) {
      tmp_total += this.arr_wagons[tmp_i].totalMassKg;
    }
    return tmp_total;
  }

  /**
   * Updates coordinates, velocity-based wheel rotations, and suspension for all vehicles in consist.
   */
  update(locomotiveDistMeters, speedMps = 0, deltaTime = 0.016, trackSystem, throttleNotch = 0, brakeRatio = 0, tractiveForceN = 0) {
    // 1. Update locomotive with speed, delta, throttle, and brake states
    this.locomotive.update(locomotiveDistMeters, speedMps, deltaTime, trackSystem, throttleNotch, brakeRatio);

    // 2. Update each coupled wagon behind the preceding vehicle
    let tmp_prevRearCouplerDist = locomotiveDistMeters - (this.locomotive.lengthMeters * 0.5);

    for (let tmp_i = 0; tmp_i < this.arr_wagons.length; tmp_i++) {
      const obj_wagon = this.arr_wagons[tmp_i];
      const tmp_wagonCenterDist = tmp_prevRearCouplerDist - this.couplerSlackMeters - (obj_wagon.lengthMeters * 0.5);

      obj_wagon.update(tmp_wagonCenterDist, speedMps, deltaTime, trackSystem, brakeRatio, tractiveForceN);
      tmp_prevRearCouplerDist = tmp_wagonCenterDist - (obj_wagon.lengthMeters * 0.5);
    }
  }

  /**
   * Triggers a suspension bump impulse across all consist vehicles (e.g. crossing rail expansion joint).
   */
  triggerSuspensionBump(intensity = 1.6) {
    this.locomotive.triggerSuspensionBump(intensity);
    for (let tmp_i = 0; tmp_i < this.arr_wagons.length; tmp_i++) {
      this.arr_wagons[tmp_i].triggerSuspensionBump(intensity * 0.85);
    }
  }

  /**
   * Gets an array of all vehicles in the consist (locomotive followed by wagons).
   */
  getAllVehicles() {
    return [this.locomotive, ...this.arr_wagons];
  }
}
