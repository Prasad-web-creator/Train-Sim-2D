/**
 * Locomotive.js
 * High-detail procedural vector 2D Indian Railways electric & diesel locomotive entity.
 * Features dual aerodynamic raked driving cabs (Cab 1 & Cab 2), authentic off-white/crimson livery,
 * bold "INDIAN RAILWAYS" branding, 4 machine room ventilation louvers, dual roof-mounted pantographs,
 * high-voltage busbars, underslung transformer, buffer shock absorbers, cowcatcher, and luminous LED lighting.
 */

import { TrainCar } from './TrainCar.js';
import { TrainComponent } from './TrainComponent.js';
import { drawRoundedRect } from '../../../utils/CanvasUtils.js';

export class Locomotive extends TrainCar {
  /**
   * Initializes locomotive model properties, colors, sub-components, and lighting states.
   */
  constructor(obj_locoModel) {
    super(
      obj_locoModel.name,
      obj_locoModel.lengthMeters,
      obj_locoModel.massKg,
      obj_locoModel.bogieWheelCount || 3
    );
    this.model = obj_locoModel;
    this.definition = obj_locoModel;

    // Sub-components
    this.compHeadlights = new TrainComponent('headlights');
    this.compHeadlights.lightingState = { on: true, intensity: 1.0, color: '#fef08a' };

    this.compMarkerLights = new TrainComponent('marker_lights');
    this.compMarkerLights.lightingState = { on: true, intensity: 0.9, color: '#ef4444' };

    this.compCabinInterior = new TrainComponent('cabin_interior');
    this.compCabinInterior.lightingState = { on: true, intensity: 0.8, color: '#fed7aa' };

    this.compRoofFan = new TrainComponent('roof_fan');
    this.fanRotationAngle = 0;
  }

  /**
   * Updates locomotive sub-components, fan animations, and lighting states.
   */
  update(distMeters, velocityMps, deltaTime, trackSystem, throttleNotch = 0) {
    super.update(distMeters, velocityMps, deltaTime, trackSystem);

    const tmp_fanSpeed = 3.0 + (throttleNotch / 8) * 18.0;
    this.fanRotationAngle += tmp_fanSpeed * deltaTime;
    this.compRoofFan.update(deltaTime, velocityMps, throttleNotch > 0);

    // Update lighting sub-components
    this.compHeadlights.update(deltaTime, velocityMps);
    this.compMarkerLights.update(deltaTime, velocityMps);
    this.compCabinInterior.update(deltaTime, velocityMps);
  }

  /**
   * Renders the complete authentic Indian Railways locomotive bodywork matching Image 1:
   * Dual aerodynamic raked driving cabs, off-white body with bold crimson-red center cheatline,
   * bold "INDIAN RAILWAYS" side branding, 4 machine room ventilation louvers, crew doors,
   * dual pantographs, roof high-voltage gear, underslung transformer, buffers, and LED headlights.
   */
  renderBody(ctx, options = {}) {
    const tmp_len = this.lengthPixels;
    const tmp_halfLen = tmp_len * 0.5;
    const tmp_model = this.model;
    const tmp_isHeadlightOn =
      options.isHeadlightOn !== undefined ? options.isHeadlightOn : this.compHeadlights.lightingState.on;

    // Interior & headlight illumination multipliers
    const obj_weather = options.weatherSystem;
    const obj_dayNight = options.dayNightSystem;
    const obj_trainLighting = obj_weather ? obj_weather.getTrainLightingSettings() : null;
    const obj_dnLighting = obj_dayNight ? obj_dayNight.getLightingState() : null;

    let tmp_illuminateCab = obj_trainLighting ? obj_trainLighting.illuminateInterior : false;
    let tmp_headlightMult = obj_trainLighting ? obj_trainLighting.headlightIntensity : 1.0;

    if (obj_dnLighting) {
      if (obj_dnLighting.buildingLightsActive) {
        tmp_illuminateCab = true;
      }
      tmp_headlightMult *= obj_dnLighting.headlightIntensity;
    }

    // 1. Heavy Underslung Equipment: Central main transformer, air tanks, battery boxes
    this.renderUnderframeEquipment(ctx, tmp_halfLen, tmp_model);

    // 2. Chassis Main Frame Sill, Buffer Beams, and Cowcatcher (Pilot)
    this.renderChassisFrameAndBuffers(ctx, tmp_halfLen, tmp_model);

    // 3. Aerodynamic Dual-Cab Carbody & Livery (Off-white + Crimson Red cheatline + INDIAN RAILWAYS)
    this.renderCarbodyAndLivery(ctx, tmp_halfLen, tmp_model);

    // 4. Four Machine Room Rectangular Louvered Ventilation Windows
    this.renderMachineRoomVents(ctx, tmp_halfLen);

    // 5. Front & Rear Crew Access Doors, Stainless Grab Rails, and Foot Ladders
    this.renderCrewDoorsAndHandrails(ctx, tmp_halfLen, tmp_model);

    // 6. Raked Aerodynamic Windshields & Side Crew Windows (Front Cab 1 & Rear Cab 2)
    this.renderCabWindowsAndWindshields(ctx, tmp_halfLen, tmp_illuminateCab);

    // 7. Roof Equipment: Dual Pantographs, High-Voltage Busbars, Resistor Grids, VCB, Horns
    this.renderRoofHighVoltageGear(ctx, tmp_halfLen, tmp_model);

    // 8. Front Sealed-Beam LED Headlights, Ditch Lights, Rear Red Markers, and Volumetric Light Beam
    this.renderHeadlightsAndMarkers(ctx, tmp_halfLen, tmp_isHeadlightOn, tmp_headlightMult);

    // 9. Front & Rear Coupler Drawbars at Buffer Beam Centerline (y = -12)
    this.frontCoupler.position = { x: tmp_halfLen, y: -12 };
    this.rearCoupler.position = { x: -tmp_halfLen, y: -12 };

    if (!this.isFrontCoupled) {
      this.frontCoupler.render(ctx);
    }
    if (!this.isRearCoupled) {
      this.rearCoupler.render(ctx);
    }
  }

  /**
   * 1. Underslung Heavy Equipment: Central traction transformer, cooling radiator fins,
   * compressed air main reservoirs (MR tanks), and auxiliary battery enclosures.
   */
  renderUnderframeEquipment(ctx, halfLen, model) {
    ctx.save();

    // Central Traction Transformer Box (underslung between bogies)
    const transW = 120;
    const transH = 14;
    const transX = -transW * 0.5;
    const transY = -14;

    ctx.fillStyle = model.undercarriageColor || '#0f172a';
    drawRoundedRect(ctx, transX, transY, transW, transH, 3);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Transformer oil cooling radiator vertical fins
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    for (let fx = transX + 12; fx < transX + transW - 10; fx += 8) {
      ctx.beginPath();
      ctx.moveTo(fx, transY + 2);
      ctx.lineTo(fx, transY + transH - 2);
      ctx.stroke();
    }

    // Transformer inspection hatch and drain plug
    ctx.fillStyle = '#475569';
    ctx.fillRect(transX + 6, transY + 4, 4, 6);
    ctx.fillRect(transX + transW - 10, transY + 4, 4, 6);

    // Twin Cylindrical Compressed Air Reservoirs (MR1 & MR2)
    const tankW = 54;
    const tankH = 8;
    // Left MR Tank
    const tankLeftX = transX - tankW - 14;
    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, tankLeftX, -12, tankW, tankH, 4);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // Left tank mounting straps
    ctx.fillStyle = '#64748b';
    ctx.fillRect(tankLeftX + 10, -13, 3, tankH + 2);
    ctx.fillRect(tankLeftX + tankW - 13, -13, 3, tankH + 2);

    // Right MR Tank
    const tankRightX = transX + transW + 14;
    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, tankRightX, -12, tankW, tankH, 4);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // Right tank mounting straps
    ctx.fillStyle = '#64748b';
    ctx.fillRect(tankRightX + 10, -13, 3, tankH + 2);
    ctx.fillRect(tankRightX + tankW - 13, -13, 3, tankH + 2);

    ctx.restore();
  }

  /**
   * 2. Heavy Cast-Steel Main Frame Sill, Front & Rear Buffer Shock Absorbers,
   * and Rail-Clearing Cowcatcher (Pilot) with safety warning chevrons.
   */
  renderChassisFrameAndBuffers(ctx, halfLen, model) {
    ctx.save();

    const totalLen = halfLen * 2;

    // Heavy Cast-Steel Main Sill Beam
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfLen, -20, totalLen, 6);

    // Underframe skirt edge trim
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-halfLen, -15, totalLen, 2);

    // Yellow safety threshold line along lower body sill
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-halfLen + 8, -20, totalLen - 16, 1.2);

    // ================= Front End Equipment (Cab 1 at +halfLen) =================
    // Front buffer beam
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(halfLen - 8, -24, 8, 14);

    // Front Circular Shock-Absorbing Buffer Plate
    ctx.fillStyle = '#334155';
    ctx.fillRect(halfLen - 2, -16, 6, 8); // Buffer cylinder stalk
    ctx.beginPath();
    ctx.ellipse(halfLen + 4, -12, 3, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Front Cowcatcher (Pilot / Cattle Guard)
    ctx.beginPath();
    ctx.moveTo(halfLen - 10, -14);
    ctx.lineTo(halfLen + 6, -3);
    ctx.lineTo(halfLen - 6, -3);
    ctx.lineTo(halfLen - 16, -14);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Front Cowcatcher safety warning hazard chevrons
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.6;
    for (let cx = halfLen - 12; cx <= halfLen - 2; cx += 4) {
      ctx.beginPath();
      ctx.moveTo(cx, -13);
      ctx.lineTo(cx + 6, -4);
      ctx.stroke();
    }

    // ================= Rear End Equipment (Cab 2 at -halfLen) =================
    // Rear buffer beam
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfLen, -24, 8, 14);

    // Rear Circular Shock-Absorbing Buffer Plate
    ctx.fillStyle = '#334155';
    ctx.fillRect(-halfLen - 4, -16, 6, 8);
    ctx.beginPath();
    ctx.ellipse(-halfLen - 4, -12, 3, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Rear Cowcatcher (Pilot) tucked cleanly inside rear buffer beam footprint
    ctx.beginPath();
    ctx.moveTo(-halfLen + 4, -14);
    ctx.lineTo(-halfLen + 6, -4);
    ctx.lineTo(-halfLen + 16, -4);
    ctx.lineTo(-halfLen + 18, -14);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Rear Cowcatcher safety warning hazard chevrons
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.4;
    for (let cx = -halfLen + 6; cx <= -halfLen + 14; cx += 4) {
      ctx.beginPath();
      ctx.moveTo(cx, -13);
      ctx.lineTo(cx + 4, -5);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 3. Aerodynamic Dual-Cab Carbody & Authentic Livery:
   * Unified full-length carbody, aerodynamic raked front and rear driving cabs,
   * off-white body with subtle metallic depth, bold crimson-red horizontal cheatline,
   * and bold uppercase "INDIAN RAILWAYS" branding centered on the upper panel.
   */
  renderCarbodyAndLivery(ctx, halfLen, model) {
    ctx.save();

    // Geometry points for aerodynamic dual-cab carbody polygon:
    // Symmetrical raked cab profile at both ends (WAP-7 dual driving cabs)
    const noseFrontBotX = halfLen - 10;
    const noseFrontMidX = halfLen - 14;
    const noseFrontTopX = halfLen - 44;

    const noseRearBotX = -halfLen + 10;
    const noseRearMidX = -halfLen + 14;
    const noseRearTopX = -halfLen + 44;

    const carbodyBotY = -20; // Sits directly on main frame sill
    const noseWaistY = -48;  // Rake angle transition point
    const rooflineY = -82;   // Main roof deck elevation

    // Create and clip to carbody path for crisp, unspilled graphics
    ctx.beginPath();
    ctx.moveTo(noseFrontBotX, carbodyBotY);
    ctx.lineTo(noseFrontMidX, noseWaistY);
    ctx.lineTo(noseFrontTopX, rooflineY);
    ctx.lineTo(noseRearTopX, rooflineY);
    ctx.lineTo(noseRearMidX, noseWaistY);
    ctx.lineTo(noseRearBotX, carbodyBotY);
    ctx.closePath();

    // Fill Base Carbody: Authentic Indian Railways WAP-7 livery with subtle metallic gradient
    const bodyGrad = ctx.createLinearGradient(0, rooflineY, 0, carbodyBotY);
    bodyGrad.addColorStop(0.0, '#e8edf2');
    bodyGrad.addColorStop(0.2, '#f8fafc');
    bodyGrad.addColorStop(0.8, '#ffffff');
    bodyGrad.addColorStop(1.0, '#e2e8f0');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Bold Crimson-Red Center Cheatline running end-to-end
    const stripeY = -49;
    const stripeH = 14;
    const stripeGrad = ctx.createLinearGradient(0, stripeY, 0, stripeY + stripeH);
    const stripeColor = model.stripeColor || '#dc2626';

    stripeGrad.addColorStop(0.0, '#b91c1c');
    stripeGrad.addColorStop(0.4, stripeColor);
    stripeGrad.addColorStop(1.0, '#991b1b');

    ctx.save();
    ctx.clip(); // Clip within carbody polygon
    ctx.fillStyle = stripeGrad;
    ctx.fillRect(-halfLen - 10, stripeY, halfLen * 2 + 20, stripeH);

    // Deep crimson border pinstripes
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-halfLen - 10, stripeY, halfLen * 2 + 20, 1.2);
    ctx.fillRect(-halfLen - 10, stripeY + stripeH - 1.2, halfLen * 2 + 20, 1.2);

    // Lower carbody dark accent skirt line
    ctx.fillStyle = '#334155';
    ctx.fillRect(-halfLen - 10, -22, halfLen * 2 + 20, 2);

    // Roof edge trim line
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-halfLen - 10, rooflineY, halfLen * 2 + 20, 2);

    ctx.restore();

    // Outer Carbody Outline Stroke
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // ================= "INDIAN RAILWAYS" Bold Branding =================
    // Centered on the upper white panel between the two middle machine room vents
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "900 13.5px 'Rajdhani', 'Oswald', 'Segoe UI', Arial, sans-serif";

    ctx.fillText('INDIAN RAILWAYS', 0, -64);

    // Subtle road number plate below center red stripe
    ctx.fillStyle = '#475569';
    ctx.font = "bold 9px 'Rajdhani', 'Segoe UI', Arial, sans-serif";
    ctx.fillText('WAP-7 • 30541', 0, -28);

    ctx.restore();

    ctx.restore();
  }

  /**
   * 4. Four Machine Room Rectangular Louvered Ventilation Windows:
   * Exactly matching Image 1, positioned evenly on the carbody upper flank
   * (2 to the left of "INDIAN RAILWAYS" and 2 to the right).
   */
  renderMachineRoomVents(ctx, halfLen) {
    ctx.save();

    // 4 vent positions along X: 2 left of center text, 2 right of center text
    const ventPositions = [
      -halfLen + 140,
      -halfLen + 200,
      halfLen - 200,
      halfLen - 140,
    ];

    const ventW = 26;
    const ventH = 20;
    const ventY = -74;

    for (const vx of ventPositions) {
      const left = vx - ventW * 0.5;

      // Dark metallic window frame
      ctx.fillStyle = '#0f172a';
      drawRoundedRect(ctx, left, ventY, ventW, ventH, 2);
      ctx.fill();

      // Deep recessed intake grille background
      ctx.fillStyle = '#1e293b';
      drawRoundedRect(ctx, left + 1.5, ventY + 1.5, ventW - 3, ventH - 3, 1.5);
      ctx.fill();

      // Horizontal louver slats
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.4;
      for (let ly = ventY + 4.5; ly < ventY + ventH - 2; ly += 3.5) {
        ctx.beginPath();
        ctx.moveTo(left + 3, ly);
        ctx.lineTo(left + ventW - 3, ly);
        ctx.stroke();
      }

      // Metallic frame highlight
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(left + 0.5, ventY + 0.5, ventW - 1, ventH - 1);
    }

    ctx.restore();
  }

  /**
   * 5. Front & Rear Crew Access Doors, Vertical Stainless Grab Rails, and Foot Ladders:
   * Positioned behind each driving cab matching authentic Indian Railways locomotives.
   */
  renderCrewDoorsAndHandrails(ctx, halfLen, model) {
    ctx.save();

    const doorW = 20;
    const doorH = 58;
    const doorY = -78;

    // Doors placed behind front cab and rear cab
    const frontDoorX = halfLen - 100;
    const rearDoorX = -halfLen + 80;

    // --- Front Crew Door (Cab 1) ---
    this.drawCrewDoor(ctx, frontDoorX, doorY, doorW, doorH, true);

    // --- Rear Crew Door (Cab 2) ---
    this.drawCrewDoor(ctx, rearDoorX, doorY, doorW, doorH, false);

    ctx.restore();
  }

  /**
   * Helper to draw an individual crew door, drop window, stainless rail, and ladder.
   */
  drawCrewDoor(ctx, x, y, w, h, isFront) {
    // Door panel seam outline
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, x, y, w, h, 2);
    ctx.stroke();

    // Upper rectangular drop window on door
    const winW = w - 6;
    const winH = 16;
    const winX = x + 3;
    const winY = y + 4;

    ctx.fillStyle = '#0f172a';
    drawRoundedRect(ctx, winX, winY, winW, winH, 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    drawRoundedRect(ctx, winX + 1.2, winY + 1.2, winW - 2.4, winH - 2.4, 1.5);
    ctx.fill();

    // Chrome door latch handle
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(isFront ? x + 3 : x + w - 5, y + h * 0.48, 2.5, 5);

    // Polished Stainless Steel Vertical Grab Rail / Handrail
    const railX = isFront ? x + w + 3 : x - 3;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(railX, y + 2);
    ctx.lineTo(railX, -16);
    ctx.stroke();

    // Mounting stanchion brackets
    ctx.fillStyle = '#64748b';
    ctx.fillRect(railX - 1.5, y + 4, 3, 2);
    ctx.fillRect(railX - 1.5, -28, 3, 2);
    ctx.fillRect(railX - 1.5, -18, 3, 2);

    // Boarding Foot Ladder Stirrup Steps (hanging below the sill)
    const ladderX = x + 3;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.8;
    // Two vertical stringers
    ctx.beginPath();
    ctx.moveTo(ladderX, -20);
    ctx.lineTo(ladderX, -9);
    ctx.moveTo(ladderX + w - 6, -20);
    ctx.lineTo(ladderX + w - 6, -9);
    // Two foot rungs
    ctx.moveTo(ladderX, -15);
    ctx.lineTo(ladderX + w - 6, -15);
    ctx.moveTo(ladderX, -10);
    ctx.lineTo(ladderX + w - 6, -10);
    ctx.stroke();
  }

  /**
   * 6. Raked Aerodynamic Windshields & Side Crew Windows:
   * Slanted aerodynamic windshields with dark rubber seals and diagonal reflections,
   * plus side rectangular windows for both Cab 1 (front) and Cab 2 (rear).
   */
  renderCabWindowsAndWindshields(ctx, halfLen, isLit = false) {
    ctx.save();

    const glassColor = isLit ? '#fef08a' : '#38bdf8';

    // ================= Front Cab 1 (Heading Forward, +halfLen) =================
    // 1. Forward Raked Windshield (Angled forward glass following cab nose profile)
    const fTopX = halfLen - 42.5;
    const fTopY = -79;
    const fBotX = halfLen - 18.5;
    const fBotY = -52;
    const fWinW = 8; // Streamlined windshield profile width

    // Windshield Rubber Surround Frame
    ctx.beginPath();
    ctx.moveTo(fTopX, fTopY);
    ctx.lineTo(fBotX, fBotY);
    ctx.lineTo(fBotX - fWinW, fBotY);
    ctx.lineTo(fTopX - fWinW, fTopY);
    ctx.closePath();
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Windshield Glass Pane
    ctx.beginPath();
    ctx.moveTo(fTopX - 1, fTopY + 1.2);
    ctx.lineTo(fBotX - 1, fBotY - 1.2);
    ctx.lineTo(fBotX - fWinW + 1.2, fBotY - 1.2);
    ctx.lineTo(fTopX - fWinW + 1.2, fTopY + 1.2);
    ctx.closePath();
    ctx.fillStyle = glassColor;
    ctx.fill();

    // Windshield diagonal reflection sheen
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(fTopX - 2, fTopY);
    ctx.lineTo(fTopX + 1, fTopY);
    ctx.lineTo(fBotX - 2, fBotY);
    ctx.lineTo(fBotX - 5, fBotY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Heavy Windshield Wiper Blade Arm
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(fBotX - 4, fBotY - 1);
    ctx.lineTo(fTopX - 2, fTopY + 10);
    ctx.stroke();

    // 2. Front Cab Side Window (Separated from windshield by a clear solid cab A-pillar)
    const fSideX = halfLen - 73;
    const fSideY = -76;
    const fSideW = 17;
    const fSideH = 22;

    ctx.fillStyle = '#0f172a';
    drawRoundedRect(ctx, fSideX, fSideY, fSideW, fSideH, 3);
    ctx.fill();

    ctx.fillStyle = glassColor;
    drawRoundedRect(ctx, fSideX + 1.5, fSideY + 1.5, fSideW - 3, fSideH - 3, 2);
    ctx.fill();

    // Side window diagonal sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(fSideX + 3, fSideY + fSideH - 2);
    ctx.lineTo(fSideX + 8, fSideY + fSideH - 2);
    ctx.lineTo(fSideX + fSideW - 2, fSideY + 3);
    ctx.lineTo(fSideX + fSideW - 7, fSideY + 3);
    ctx.closePath();
    ctx.fill();

    // ================= Rear Cab 2 (Facing Rearward, -halfLen) =================
    // 1. Rear Raked Windshield
    const rTopX = -halfLen + 42.5;
    const rTopY = -79;
    const rBotX = -halfLen + 18.5;
    const rBotY = -52;
    const rWinW = 8;

    // Rear Windshield Rubber Surround Frame
    ctx.beginPath();
    ctx.moveTo(rTopX, rTopY);
    ctx.lineTo(rBotX, rBotY);
    ctx.lineTo(rBotX + rWinW, rBotY);
    ctx.lineTo(rTopX + rWinW, rTopY);
    ctx.closePath();
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Rear Windshield Glass Pane
    ctx.beginPath();
    ctx.moveTo(rTopX + 1, rTopY + 1.2);
    ctx.lineTo(rBotX + 1, rBotY - 1.2);
    ctx.lineTo(rBotX + rWinW - 1.2, rBotY - 1.2);
    ctx.lineTo(rTopX + rWinW - 1.2, rTopY + 1.2);
    ctx.closePath();
    ctx.fillStyle = glassColor;
    ctx.fill();

    // Rear Windshield diagonal reflection sheen
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(rTopX + 2, rTopY);
    ctx.lineTo(rTopX - 1, rTopY);
    ctx.lineTo(rBotX + 2, rBotY);
    ctx.lineTo(rBotX + 5, rBotY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Rear windshield wiper
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(rBotX + 4, rBotY - 1);
    ctx.lineTo(rTopX + 2, rTopY + 10);
    ctx.stroke();

    // 2. Rear Cab Side Window
    const rSideX = -halfLen + 56;
    const rSideY = -76;
    const rSideW = 17;
    const rSideH = 22;

    ctx.fillStyle = '#0f172a';
    drawRoundedRect(ctx, rSideX, rSideY, rSideW, rSideH, 3);
    ctx.fill();

    ctx.fillStyle = glassColor;
    drawRoundedRect(ctx, rSideX + 1.5, rSideY + 1.5, rSideW - 3, rSideH - 3, 2);
    ctx.fill();

    // Rear side window diagonal sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(rSideX + 2, rSideY + 3);
    ctx.lineTo(rSideX + 7, rSideY + 3);
    ctx.lineTo(rSideX + rSideW - 3, rSideY + rSideH - 2);
    ctx.lineTo(rSideX + rSideW - 8, rSideY + rSideH - 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * 7. Roof Equipment: Dual Articulated Pantographs (Front & Rear), High-Voltage
   * Copper Busbars, Ceramic Insulators, Dynamic Brake Resistor Grids, VCB, and Dual Horns.
   */
  renderRoofHighVoltageGear(ctx, halfLen, model) {
    ctx.save();

    const roofY = -82;

    // Roof deck metallic cap strip
    ctx.fillStyle = '#475569';
    drawRoundedRect(ctx, -halfLen + 38, roofY - 5, halfLen * 2 - 76, 5, 2);
    ctx.fill();

    // Dynamic Brake Resistor Grid Boxes on roof deck
    const resBoxW = 46;
    const resBoxH = 8;
    const resY = roofY - 12;

    // Central & flanking resistor housings
    for (const bx of [-85, 0, 85]) {
      ctx.fillStyle = '#1e293b';
      drawRoundedRect(ctx, bx - resBoxW * 0.5, resY, resBoxW, resBoxH, 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Horizontal cooling slats on resistor box
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.0;
      for (let sy = resY + 2; sy < resY + resBoxH - 1; sy += 2.2) {
        ctx.beginPath();
        ctx.moveTo(bx - resBoxW * 0.5 + 4, sy);
        ctx.lineTo(bx + resBoxW * 0.5 - 4, sy);
        ctx.stroke();
      }
    }

    // Dual Air Horn Trumpets above each cab
    ctx.fillStyle = '#fbbf24'; // Brass horn
    // Front cab horn (pointing forward)
    ctx.fillRect(halfLen - 55, roofY - 9, 14, 3);
    ctx.beginPath();
    ctx.arc(halfLen - 41, roofY - 7.5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Rear cab horn (pointing backward)
    ctx.fillRect(-halfLen + 41, roofY - 9, 14, 3);
    ctx.beginPath();
    ctx.arc(-halfLen + 41, roofY - 7.5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const isElectric = model?.hasPantograph !== false && model?.category !== 'Diesel';

    if (isElectric) {
      // High-Voltage Vacuum Circuit Breaker (VCB) Housing
      ctx.fillStyle = '#0f172a';
      drawRoundedRect(ctx, -22, roofY - 18, 16, 12, 2);
      ctx.fill();

      // Ceramic Insulator Bushing Standoff Columns along the roof
      const insulatorXPositions = [-halfLen * 0.58, -100, -35, 35, 100, halfLen * 0.58];
      for (const ix of insulatorXPositions) {
        this.drawCeramicInsulator(ctx, ix, roofY - 5);
      }

      // High-Voltage Copper Busbar Conduit running continuously between pantographs
      ctx.strokeStyle = '#d97706'; // Polished copper
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-halfLen * 0.58, roofY - 14);
      ctx.lineTo(-22, roofY - 14);
      ctx.lineTo(-14, roofY - 17);
      ctx.lineTo(halfLen * 0.58, roofY - 14);
      ctx.stroke();

      // Dual Pantographs (Front & Rear, electric locomotives)
      const frontPantoX = halfLen * 0.58;
      const rearPantoX = -halfLen * 0.58;

      this.drawArticulatedPantograph(ctx, frontPantoX, roofY - 5, true);
      this.drawArticulatedPantograph(ctx, rearPantoX, roofY - 5, false);
    } else {
      // Diesel Locomotive Roof: Radiator cooling fan grilles and exhaust shroud
      for (const fx of [-halfLen * 0.4, halfLen * 0.4]) {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(fx, roofY - 5, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Fan hub & blades
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(fx, roofY - 5, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central diesel exhaust silencer hatch
      ctx.fillStyle = '#1e293b';
      drawRoundedRect(ctx, -24, roofY - 10, 48, 6, 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Renders a ribbed porcelain/ceramic insulator bushing standoff.
   */
  drawCeramicInsulator(ctx, x, y) {
    ctx.save();
    // Insulator column with horizontal ribs
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x - 3, y - 8, 6, 8);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    for (let ry = y - 7; ry <= y - 2; ry += 2) {
      ctx.beginPath();
      ctx.moveTo(x - 4.5, ry);
      ctx.lineTo(x + 4.5, ry);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Renders an authentic diamond-articulated Indian Railways pantograph
   * with red tubular linkages, ceramic base insulators, and carbon contact shoe.
   */
  drawArticulatedPantograph(ctx, px, py, isRaised = true) {
    ctx.save();

    // Base Mounting Frame on Ceramic Insulator Bushings
    const baseW = 28;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(px - baseW * 0.5, py - 6, baseW, 3);

    // 4 Base insulators
    this.drawCeramicInsulator(ctx, px - baseW * 0.4, py);
    this.drawCeramicInsulator(ctx, px + baseW * 0.4, py);

    // Pantograph Height and Geometry
    const pantoH = isRaised ? 32 : 18;
    const midH = pantoH * 0.52;

    // Lower articulation arms (Red tubular steel)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const kneeX = px + 6;
    const kneeY = py - 6 - midH;

    ctx.beginPath();
    ctx.moveTo(px - baseW * 0.35, py - 6);
    ctx.lineTo(kneeX, kneeY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px + baseW * 0.35, py - 6);
    ctx.lineTo(kneeX, kneeY);
    ctx.stroke();

    // Upper articulation arm up to collector pan
    const panX = px;
    const panY = py - 6 - pantoH;

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(panX + 8, panY + 2);
    ctx.lineTo(panX, panY);
    ctx.stroke();

    // Top Carbon Contact Shoe / Collector Pan with Aerodynamic End Horns
    const shoeW = 34;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    // Curved left horn
    ctx.moveTo(panX - shoeW * 0.5 - 4, panY + 3);
    ctx.lineTo(panX - shoeW * 0.5, panY);
    // Flat contact bar across catenary wire
    ctx.lineTo(panX + shoeW * 0.5, panY);
    // Curved right horn
    ctx.lineTo(panX + shoeW * 0.5 + 4, panY + 3);
    ctx.stroke();

    // Carbon wear strip on top of collector shoe
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(panX - shoeW * 0.4, panY - 1);
    ctx.lineTo(panX + shoeW * 0.4, panY - 1);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 8. Front High-Intensity Sealed-Beam LED Headlights, Ditch Lights,
   * Rear Red Marker Lights, and Volumetric Forward Light Projection Beam.
   */
  renderHeadlightsAndMarkers(ctx, halfLen, isHeadlightOn, intensityMult = 1.0) {
    ctx.save();

    // Headlight position on Front Cab nose
    const headlightX = halfLen - 13;
    const headlightY = -46;

    // Twin Sealed-Beam Headlight Bezel Housing
    ctx.fillStyle = '#0f172a';
    drawRoundedRect(ctx, headlightX - 4, headlightY - 8, 8, 16, 2);
    ctx.fill();

    // Upper and Lower LED Headlight Lamps
    const lampColor = isHeadlightOn ? '#ffffff' : '#64748b';
    const lampGlow = isHeadlightOn ? '#fef08a' : '#475569';

    ctx.beginPath();
    ctx.arc(headlightX, headlightY - 4, 3.2, 0, Math.PI * 2);
    ctx.arc(headlightX, headlightY + 4, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = lampColor;
    ctx.fill();

    if (isHeadlightOn) {
      // Corona glow around active headlight bezels
      ctx.beginPath();
      ctx.arc(headlightX + 2, headlightY - 4, 5.5, 0, Math.PI * 2);
      ctx.arc(headlightX + 2, headlightY + 4, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.fill();
    }

    // Lower Front Ditch Lights (mounted on buffer beam deck)
    const ditchX = halfLen - 6;
    const ditchY = -22;
    ctx.beginPath();
    ctx.arc(ditchX, ditchY, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = isHeadlightOn ? '#fef08a' : '#475569';
    ctx.fill();

    // Rear Red Marker Light (Cab 2 Nose)
    const rearMarkerX = -halfLen + 13;
    const rearMarkerY = -46;
    ctx.beginPath();
    ctx.arc(rearMarkerX, rearMarkerY, 3.0, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    // Volumetric Headlight Projection Beam onto Tracks
    if (isHeadlightOn) {
      ctx.save();
      const beamLen = 580 * Math.min(1.4, intensityMult);
      const coreAlpha = Math.min(0.85, 0.48 * intensityMult);
      const midAlpha = Math.min(0.45, 0.18 * intensityMult);

      const beamGrad = ctx.createRadialGradient(
        headlightX, headlightY, 6,
        headlightX + beamLen * 0.75, headlightY + 25, beamLen * 0.85
      );
      beamGrad.addColorStop(0, `rgba(254, 240, 138, ${coreAlpha})`);
      beamGrad.addColorStop(0.35, `rgba(254, 240, 138, ${midAlpha})`);
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.beginPath();
      ctx.moveTo(headlightX + 2, headlightY - 3);
      ctx.lineTo(headlightX + beamLen, headlightY - 95);
      ctx.lineTo(headlightX + beamLen + 50, headlightY + 135);
      ctx.closePath();
      ctx.fillStyle = beamGrad;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Returns world space coordinate of roof exhaust stack or high-voltage conduit.
   */
  getExhaustStackWorldPos() {
    const tmp_stackOffset = -this.lengthPixels * 0.12;
    const tmp_stackHeight = -82;
    const tmp_totAngle = this.pitchAngle + this.vibrationRockAngle;

    const tmp_cos = Math.cos(tmp_totAngle);
    const tmp_sin = Math.sin(tmp_totAngle);

    return {
      x: this.worldX + tmp_stackOffset * tmp_cos - tmp_stackHeight * tmp_sin,
      y: (this.worldY + this.vibrationOffsetY) + tmp_stackOffset * tmp_sin + tmp_stackHeight * tmp_cos,
    };
  }
}
