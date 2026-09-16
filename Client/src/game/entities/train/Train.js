/**
 * Train.js
 * Master train consist coordinator managing the lead Locomotive, trailing coupled PassengerCoach
 * or CargoCoach vehicles, inter-car coupler connections, aggregate mass, and spline tracking.
 */

import { Locomotive } from './Locomotive.js';
import { PassengerCoach } from './PassengerCoach.js';
import { CargoCoach } from './CargoCoach.js';
import { Coupler } from './Coupler.js';
import { getLocomotiveById } from '../../../data/locomotives.js';
import { getWagonById } from '../../../data/wagons.js';

export class Train {
  /**
   * Initializes train consist with a modular Locomotive and trailing coaches.
   */
  constructor(locomotiveId, arr_wagonIds = []) {
    const obj_locoModel = getLocomotiveById(locomotiveId);
    this.locomotive = new Locomotive(obj_locoModel);

    // Build trailing coaches array
    this.arr_cars = arr_wagonIds.map((wagonId, index) => {
      if (wagonId === 'passenger_coach') {
        return new PassengerCoach(`Coach ${index + 1}`, 24.0, 52000);
      }
      const obj_wagonType = getWagonById(wagonId);
      return new CargoCoach(obj_wagonType, index);
    });

    this.couplerSlackMeters = 0.95; // Buffer-to-buffer gap
    this.totalMassKg = this.calculateTotalMass();
    this.updateCoupledStates();
  }

  /**
   * Updates isFrontCoupled and isRearCoupled flags for all vehicles in the consist.
   */
  updateCoupledStates() {
    const arr_vehicles = this.getAllVehicles();
    for (let tmp_i = 0; tmp_i < arr_vehicles.length; tmp_i++) {
      const obj_v = arr_vehicles[tmp_i];
      obj_v.isFrontCoupled = (tmp_i > 0);
      obj_v.isRearCoupled = (tmp_i < arr_vehicles.length - 1);
    }
  }

  /**
   * Calculates total aggregate mass of locomotive and all coupled coaches in kilograms.
   */
  calculateTotalMass() {
    let tmp_total = this.locomotive.totalMassKg;
    for (let tmp_i = 0; tmp_i < this.arr_cars.length; tmp_i++) {
      tmp_total += this.arr_cars[tmp_i].totalMassKg;
    }
    return tmp_total;
  }

  /**
   * Updates coordinates of locomotive and trailing coupled cars along the track spline.
   */
  update(locomotiveDistMeters, velocityMps, deltaTime, trackSystem, throttleNotch = 0) {
    this.updateCoupledStates();

    // 1. Update locomotive
    this.locomotive.update(locomotiveDistMeters, velocityMps, deltaTime, trackSystem, throttleNotch);

    // 2. Position and update each coupled car behind the preceding car
    let tmp_prevRearCouplerDist = locomotiveDistMeters - (this.locomotive.lengthMeters * 0.5);

    for (let tmp_i = 0; tmp_i < this.arr_cars.length; tmp_i++) {
      const obj_car = this.arr_cars[tmp_i];
      const tmp_carCenterDist = tmp_prevRearCouplerDist - this.couplerSlackMeters - (obj_car.lengthMeters * 0.5);

      obj_car.update(tmp_carCenterDist, velocityMps, deltaTime, trackSystem);
      tmp_prevRearCouplerDist = tmp_carCenterDist - (obj_car.lengthMeters * 0.5);
    }
  }

  /**
   * Returns flat array of all vehicles in the consist (locomotive followed by cars).
   */
  getAllVehicles() {
    return [this.locomotive, ...this.arr_cars];
  }

  /**
   * Renders couplers, trailing coaches, and lead locomotive via the modular Canvas pipeline.
   */
  render(ctx, options = {}) {
    const arr_vehicles = this.getAllVehicles();

    // 1. Render knuckle couplers and air brake lines between adjacent cars
    for (let tmp_i = 0; tmp_i < arr_vehicles.length - 1; tmp_i++) {
      const obj_front = arr_vehicles[tmp_i];
      const obj_rear = arr_vehicles[tmp_i + 1];
      const obj_posA = obj_front.getRearCouplerPos();
      const obj_posB = obj_rear.getFrontCouplerPos();
      Coupler.renderConnection(ctx, obj_posA, obj_posB);
    }

    // 2. Render trailing coaches (back to front)
    for (let tmp_i = this.arr_cars.length - 1; tmp_i >= 0; tmp_i--) {
      this.arr_cars[tmp_i].render(ctx, options);
    }

    // 3. Render lead locomotive
    this.locomotive.render(ctx, options);
  }
}
