/**
 * TrainRenderer.js
 * High-detail procedural vector 2D rendering of diesel-electric locomotives and freight wagons.
 */

import { drawRoundedRect, drawRivet } from '../../utils/CanvasUtils.js';

export class TrainRenderer {
  /**
   * Initializes train renderer settings, wheel radii, and lighting cache.
   */
  constructor() {
    this.wheelRadius = 15;
  }

  /**
   * Renders the entire train consist: couplers, wagons, locomotive, bogies, and headlights.
   */
  render(ctx, consist, isHeadlightOn = true, weatherSystem = null, dayNightSystem = null) {
    if (consist && typeof consist.render === 'function') {
      consist.render(ctx, { isHeadlightOn, weatherSystem, dayNightSystem });
      return;
    }

    const arr_wagons = consist.arr_wagons || [];
    const obj_loco = consist.locomotive;

    // 1. Render couplers between all coupled vehicles
    this.renderCouplers(ctx, consist);

    // 2. Render all trailing freight wagons (back to front)
    for (let tmp_i = arr_wagons.length - 1; tmp_i >= 0; tmp_i--) {
      this.renderWagon(ctx, arr_wagons[tmp_i]);
    }

    // 3. Render lead diesel locomotive
    this.renderLocomotive(ctx, obj_loco, isHeadlightOn, weatherSystem, dayNightSystem);
  }

  /**
   * Renders heavy knuckle couplers with dynamic slack tension and swaying flexible air brake hoses.
   */
  renderCouplers(ctx, consist) {
    const arr_vehicles = consist.getAllVehicles();
    ctx.save();

    for (let tmp_i = 0; tmp_i < arr_vehicles.length - 1; tmp_i++) {
      const obj_front = arr_vehicles[tmp_i];
      const obj_rear = arr_vehicles[tmp_i + 1];

      const obj_posA = obj_front.getRearCouplerPos();
      const obj_posB = obj_rear.getFrontCouplerPos();

      // Steel coupler drawbar (stretches / compresses with dynamic slack)
      ctx.beginPath();
      ctx.moveTo(obj_posA.x, obj_posA.y - 2);
      ctx.lineTo(obj_posB.x, obj_posB.y - 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();

      // Double-knuckle interlocking coupler head
      const tmp_midX = (obj_posA.x + obj_posB.x) * 0.5;
      const tmp_midY = (obj_posA.y + obj_posB.y) * 0.5 - 2;

      ctx.beginPath();
      ctx.arc(tmp_midX - 2, tmp_midY, 5, 0, Math.PI * 2);
      ctx.arc(tmp_midX + 2, tmp_midY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#475569';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Flexible air brake hose with dynamic sway
      const tmp_hoseSway = Math.sin((obj_front.worldX * 0.05)) * 1.5;
      ctx.beginPath();
      ctx.moveTo(obj_posA.x, obj_posA.y + 4);
      ctx.quadraticCurveTo(tmp_midX, tmp_midY + 14 + tmp_hoseSway, obj_posB.x, obj_posB.y + 4);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Renders a freight wagon according to its specific cargo type (hopper, flatbed, boxcar, container).
   */
  renderWagon(ctx, wagon) {
    ctx.save();

    // 1. Render front and rear bogie trucks with suspension & brake components
    this.renderBogie(ctx, wagon.frontBogie.x, wagon.frontBogie.y, wagon.frontBogie.angle, wagon.wheelRotationAngle, 2, wagon.brakeShoeClamp, 0, wagon.suspensionDisplacement);
    this.renderBogie(ctx, wagon.rearBogie.x, wagon.rearBogie.y, wagon.rearBogie.angle, wagon.wheelRotationAngle, 2, wagon.brakeShoeClamp, 0, wagon.suspensionDisplacement);

    // 2. Transform into car body coordinate space (center at origin, rotated by body pitch)
    ctx.translate(wagon.worldX, wagon.worldY);
    ctx.rotate(wagon.pitchAngle);

    const tmp_len = wagon.lengthPixels;
    const tmp_halfLen = tmp_len * 0.5;
    const tmp_model = wagon.model;

    // Heavy under-frame steel sill
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-tmp_halfLen, -10, tmp_len, 8);

    // Render vehicle body by kind
    if (tmp_model.wagonKind === 'hopper') {
      this.renderHopperBody(ctx, tmp_len, tmp_model);
    } else if (tmp_model.wagonKind === 'flatbed') {
      this.renderFlatbedBody(ctx, tmp_len, tmp_model);
    } else if (tmp_model.wagonKind === 'boxcar') {
      this.renderBoxcarBody(ctx, tmp_len, tmp_model);
    } else if (tmp_model.wagonKind === 'container') {
      this.renderContainerBody(ctx, tmp_len, tmp_model);
    }

    ctx.restore();
  }

  /**
   * Renders grain hopper wagon with angled slopes, discharge bays, and grain cargo.
   */
  renderHopperBody(ctx, length, model) {
    const tmp_w = length * 0.94;
    const tmp_halfW = tmp_w * 0.5;
    const tmp_h = 72;

    // Hopper body shell
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW, -10);
    ctx.lineTo(-tmp_halfW + 28, -tmp_h);
    ctx.lineTo(tmp_halfW - 28, -tmp_h);
    ctx.lineTo(tmp_halfW, -10);
    ctx.closePath();
    ctx.fillStyle = model.bodyColor;
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Grain cargo visible in open top
    ctx.fillStyle = model.cargoColor;
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW + 36, -tmp_h + 8);
    ctx.quadraticCurveTo(0, -tmp_h - 6, tmp_halfW - 36, -tmp_h + 8);
    ctx.lineTo(tmp_halfW - 36, -tmp_h + 16);
    ctx.lineTo(-tmp_halfW + 36, -tmp_h + 16);
    ctx.closePath();
    ctx.fill();

    // Vertical structural reinforcement ribs
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    const tmp_ribStep = 32;
    for (let tmp_rx = -tmp_halfW + 45; tmp_rx < tmp_halfW - 45; tmp_rx += tmp_ribStep) {
      ctx.beginPath();
      ctx.moveTo(tmp_rx, -10);
      ctx.lineTo(tmp_rx, -tmp_h);
      ctx.stroke();
    }

    // Bottom discharge hopper chutes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-tmp_halfW + 70, -6, 28, 7);
    ctx.fillRect(tmp_halfW - 98, -6, 28, 7);

    ctx.restore();
  }

  /**
   * Renders flatbed lumber wagon with stacked timber logs and side stanchions.
   */
  renderFlatbedBody(ctx, length, model) {
    const tmp_w = length * 0.96;
    const tmp_halfW = tmp_w * 0.5;

    // Wooden deck bed
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-tmp_halfW, -16, tmp_w, 8);

    // Side stake stanchions (vertical posts holding logs)
    ctx.fillStyle = '#1e293b';
    const tmp_stakeStep = 45;
    for (let tmp_sx = -tmp_halfW + 15; tmp_sx <= tmp_halfW - 15; tmp_sx += tmp_stakeStep) {
      ctx.fillRect(tmp_sx - 3, -78, 6, 68);
    }

    // Stacked timber tree logs with bark and annual tree rings
    const tmp_logRadius = 11;
    const tmp_logCountX = Math.floor((tmp_w - 40) / (tmp_logRadius * 2));
    const tmp_logStartX = -tmp_halfW + 25;

    // Bottom tier of logs
    for (let tmp_i = 0; tmp_i < tmp_logCountX; tmp_i++) {
      const tmp_lx = tmp_logStartX + tmp_i * (tmp_logRadius * 2);
      ctx.fillStyle = '#b45309'; // Bark
      ctx.fillRect(tmp_lx - tmp_logRadius, -36, tmp_logRadius * 2, 20);
    }

    // Top tier of logs
    for (let tmp_i = 0; tmp_i < tmp_logCountX - 1; tmp_i++) {
      const tmp_lx = tmp_logStartX + tmp_logRadius + tmp_i * (tmp_logRadius * 2);
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(tmp_lx - tmp_logRadius, -56, tmp_logRadius * 2, 20);
    }

    // End cut circles on outermost logs
    this.renderLogEnd(ctx, tmp_logStartX, -26, tmp_logRadius);
    this.renderLogEnd(ctx, tmp_logStartX + (tmp_logCountX - 1) * tmp_logRadius * 2, -26, tmp_logRadius);
    this.renderLogEnd(ctx, tmp_logStartX + tmp_logRadius, -46, tmp_logRadius);
  }

  /**
   * Renders timber log end circle with growth rings.
   */
  renderLogEnd(ctx, cx, cy, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fde68a';
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Center ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Renders steel boxcar with corrugated sides and central sliding door.
   */
  renderBoxcarBody(ctx, length, model) {
    const tmp_w = length * 0.95;
    const tmp_halfW = tmp_w * 0.5;
    const tmp_h = 76;

    // Outer boxcar body
    ctx.fillStyle = model.bodyColor;
    drawRoundedRect(ctx, -tmp_halfW, -tmp_h, tmp_w, tmp_h - 10, 4);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Roof curved catwalk
    ctx.fillStyle = '#334155';
    ctx.fillRect(-tmp_halfW + 10, -tmp_h - 3, tmp_w - 20, 3);

    // Sliding center cargo door
    ctx.fillStyle = '#7f1d1d';
    drawRoundedRect(ctx, -38, -tmp_h + 8, 76, tmp_h - 22, 2);
    ctx.fill();
    ctx.stroke();

    // Door latch bar
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-1, -tmp_h + 12);
    ctx.lineTo(-1, -16);
    ctx.stroke();
  }

  /**
   * Renders intermodal container well wagon loaded with high-cube cargo container.
   */
  renderContainerBody(ctx, length, model) {
    const tmp_w = length * 0.94;
    const tmp_halfW = tmp_w * 0.5;
    const tmp_h = 80;

    // Container box
    ctx.fillStyle = model.cargoColor;
    drawRoundedRect(ctx, -tmp_halfW + 12, -tmp_h, tmp_w - 24, tmp_h - 14, 3);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vertical corrugation flutes
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 2;
    for (let tmp_cx = -tmp_halfW + 28; tmp_cx < tmp_halfW - 28; tmp_cx += 14) {
      ctx.beginPath();
      ctx.moveTo(tmp_cx, -tmp_h + 4);
      ctx.lineTo(tmp_cx, -18);
      ctx.stroke();
    }

    // Corner castings
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-tmp_halfW + 12, -tmp_h, 8, 8);
    ctx.fillRect(tmp_halfW - 20, -tmp_h, 8, 8);
    ctx.fillRect(-tmp_halfW + 12, -22, 8, 8);
    ctx.fillRect(tmp_halfW - 20, -22, 8, 8);
  }

  /**
   * Renders diesel-electric locomotive with engine hood, cab cabin, windows, grilles, and headlights.
   * Renders diesel-electric or electric locomotive with engine hood, cab cabin, windows,
   * warm interior lights, doors, pantographs, grilles, and pulsating headlights.
   */
  renderLocomotive(ctx, train, isHeadlightOn, weatherSystem = null, dayNightSystem = null) {
    if (train && typeof train.renderBody === 'function') {
      train.render(ctx, { isHeadlightOn, weatherSystem, dayNightSystem });
      return;
    }

    ctx.save();

    const obj_trainLighting = weatherSystem ? weatherSystem.getTrainLightingSettings() : null;
    const obj_dnLighting = dayNightSystem ? dayNightSystem.getLightingState() : null;

    let tmp_shouldLightCab = isHeadlightOn || (obj_trainLighting && obj_trainLighting.illuminateInterior);
    let tmp_intensity = obj_trainLighting ? obj_trainLighting.headlightIntensity : 1.0;

    if (obj_dnLighting) {
      if (obj_dnLighting.buildingLightsActive) {
        tmp_shouldLightCab = true;
      }
      tmp_intensity *= obj_dnLighting.headlightIntensity;
    }

    // 1. Render front and rear heavy bogie trucks with suspension & clamping brake shoes
    this.renderBogie(
      ctx,
      train.frontBogie.x,
      train.frontBogie.y,
      train.frontBogie.angle,
      train.wheelRotationAngle,
      train.model.bogieWheelCount,
      train.brakeShoeClamp,
      train.brakeShoeThermalGlow,
      train.frontBogie.suspensionY
    );
    this.renderBogie(
      ctx,
      train.rearBogie.x,
      train.rearBogie.y,
      train.rearBogie.angle,
      train.wheelRotationAngle,
      train.model.bogieWheelCount,
      train.brakeShoeClamp,
      train.brakeShoeThermalGlow,
      train.rearBogie.suspensionY
    );

    // 2. Transform into locomotive body coordinates
    ctx.translate(train.worldX, train.worldY);
    ctx.rotate(train.pitchAngle);

    const tmp_len = train.lengthPixels;
    const tmp_halfLen = tmp_len * 0.5;
    const tmp_model = train.model;

    // 3. Heavy undercarriage fuel tank & air reservoirs
    ctx.fillStyle = tmp_model.undercarriageColor;
    drawRoundedRect(ctx, -tmp_halfLen * 0.42, -18, tmp_len * 0.42, 22, 5);
    ctx.fill();

    // Safety walkways / running boards
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-tmp_halfLen, -12, tmp_len, 8);

    // Safety yellow walkway handrails
    ctx.strokeStyle = tmp_model.handrailColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-tmp_halfLen + 10, -32);
    ctx.lineTo(tmp_halfLen - 10, -32);
    // Stanchions
    for (let tmp_hx = -tmp_halfLen + 25; tmp_hx <= tmp_halfLen - 25; tmp_hx += 45) {
      ctx.moveTo(tmp_hx, -12);
      ctx.lineTo(tmp_hx, -32);
    }
    ctx.stroke();

    // 4. Long engine hood (radiator, engine bay, generator compartment)
    const tmp_hoodStartX = -tmp_halfLen + 20;
    const tmp_hoodEndX = tmp_halfLen * 0.28;
    const tmp_hoodWidth = tmp_hoodEndX - tmp_hoodStartX;
    const tmp_hoodHeight = 62;

    this.renderEngineHood(ctx, tmp_hoodStartX, tmp_hoodWidth, tmp_hoodHeight, tmp_model);

    // Dynamic radiator fan on engine hood roof
    this.renderCoolingFan(ctx, tmp_hoodStartX + tmp_hoodWidth * 0.35, -tmp_hoodHeight - 14, train.fanRotationAngle || 0);

    // Engine hood radiator grilles / cooling vents
    ctx.fillStyle = '#0f172a';
    for (let tmp_gx = tmp_hoodStartX + 20; tmp_gx < tmp_hoodEndX - 20; tmp_gx += 18) {
      drawRoundedRect(ctx, tmp_gx, -tmp_hoodHeight - 6, 12, 34, 2);
      ctx.fill();
    }

    // Roof dynamic brake fan housing & exhaust stack
    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, -tmp_halfLen * 0.24, -tmp_hoodHeight - 20, 26, 8, 2);
    ctx.fill();

    // Exhaust smokestack opening
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-tmp_halfLen * 0.14, -tmp_hoodHeight - 24, 18, 12);

    // Roof pantograph (where applicable for electric models)
    if (train.hasPantograph) {
      this.renderPantograph(ctx, -tmp_halfLen * 0.22, -tmp_hoodHeight - 14, train.pantographSway);
    }

    // Electric pantograph if electric locomotive
    if (tmp_model.locoType === 'electric') {
      this.renderPantograph(ctx, -tmp_halfLen * 0.45, -tmp_hoodHeight - 16, train.pantographHeight || 0.85);
    }

    // Dynamic exhaust smoke stack
    this.renderExhaustStack(ctx, tmp_hoodStartX + tmp_hoodWidth * 0.65, -tmp_hoodHeight - 18);

    // 5. Driver Cabin (elevated cab near front)
    const tmp_cabStartX = tmp_hoodEndX;
    const tmp_cabWidth = tmp_halfLen * 0.52;
    const tmp_cabHeight = 74;

    ctx.fillStyle = tmp_model.bodyColor;
    drawRoundedRect(ctx, tmp_cabStartX, -tmp_cabHeight - 12, tmp_cabWidth, tmp_cabHeight, 4);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cabin side access door with latch handle
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, tmp_cabStartX + 8, -tmp_cabHeight + 32, 22, 44, 2);
    ctx.stroke();
    // Chrome door latch
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(tmp_cabStartX + 26, -tmp_cabHeight + 52, 3.5, 2);

    // Cabin roof overhanging eaves
    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, tmp_cabStartX - 4, -tmp_cabHeight - 16, tmp_cabWidth + 8, 6, 2);
    ctx.fill();

    // Warm tungsten cabin interior lights with glowing dials
    if (tmp_shouldLightCab) {
      ctx.save();
      ctx.shadowColor = 'rgba(251, 191, 36, 0.65)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#fef3c7'; // Warm lit glass
      drawRoundedRect(ctx, tmp_cabStartX + 12, -tmp_cabHeight + 4, 38, 26, 3);
      ctx.fill();
      drawRoundedRect(ctx, tmp_cabStartX + 58, -tmp_cabHeight + 4, 28, 26, 3);
      ctx.fill();
      ctx.restore();

      // Glowing miniature instrument cluster dials on console
      ctx.fillStyle = '#22c55e'; // Green HUD glow
      ctx.fillRect(tmp_cabStartX + 72, -tmp_cabHeight + 22, 3, 3);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(tmp_cabStartX + 78, -tmp_cabHeight + 22, 3, 3);
    } else {
      ctx.fillStyle = '#38bdf8'; // Daytime tinted glass
      drawRoundedRect(ctx, tmp_cabStartX + 12, -tmp_cabHeight + 4, 38, 26, 3);
      ctx.fill();
      drawRoundedRect(ctx, tmp_cabStartX + 58, -tmp_cabHeight + 4, 28, 26, 3);
      ctx.fill();
    }

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    drawRoundedRect(ctx, tmp_cabStartX + 12, -tmp_cabHeight + 4, 38, 26, 3);
    ctx.stroke();
    drawRoundedRect(ctx, tmp_cabStartX + 58, -tmp_cabHeight + 4, 28, 26, 3);
    ctx.stroke();

    // Driver silhouette inside cabin
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.arc(tmp_cabStartX + 28, -tmp_cabHeight + 14, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(tmp_cabStartX + 22, -tmp_cabHeight + 20, 14, 10);

    // 6. Short front nose hood
    const tmp_noseStartX = tmp_cabStartX + tmp_cabWidth;
    const tmp_noseWidth = tmp_halfLen - tmp_noseStartX;
    const tmp_noseHeight = 44;

    ctx.fillStyle = tmp_model.bodyColor;
    drawRoundedRect(ctx, tmp_noseStartX, -tmp_noseHeight - 12, tmp_noseWidth, tmp_noseHeight, 5);
    ctx.fill();
    ctx.stroke();

    // Nose safety chevron stripes
    ctx.fillStyle = tmp_model.stripeColor;
    ctx.fillRect(tmp_noseStartX, -32, tmp_noseWidth, 6);

    // Locomotive identification lettering
    ctx.fillStyle = '#fef08a';
    ctx.font = '700 8.5px sans-serif';
    ctx.fillText('WDM3D', tmp_noseStartX + 12, -20);

    // Front headlights unit
    const tmp_headlightX = tmp_halfLen - 2;
    const tmp_headlightY = -tmp_noseHeight + 4;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(tmp_headlightX - 4, tmp_headlightY - 6, 6, 12);

    ctx.beginPath();
    ctx.arc(tmp_headlightX, tmp_headlightY, 5, 0, Math.PI * 2);
    ctx.fillStyle = isHeadlightOn ? '#fef08a' : '#94a3b8';
    ctx.fill();

    // 7. Dynamic headlight light cone projection and pulsating lens flare corona
    if (isHeadlightOn) {
      ctx.save();
      // Pulsating lens flare corona amplified by weather intensity
      const tmp_flareRadius = (10 + Math.sin(Date.now() * 0.007) * 2) * Math.min(1.4, tmp_intensity);
      ctx.beginPath();
      ctx.arc(tmp_headlightX, tmp_headlightY, tmp_flareRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(254, 240, 138, ${Math.min(0.7, 0.35 * tmp_intensity)})`;
      ctx.fill();

      // Volumetric beam cone
      const tmp_reach = 480 * Math.min(1.4, tmp_intensity);
      const tmp_lightGrad = ctx.createRadialGradient(
        tmp_headlightX, tmp_headlightY, 5,
        tmp_headlightX + tmp_reach * 0.8, tmp_headlightY + 20, tmp_reach
      );
      tmp_lightGrad.addColorStop(0, `rgba(254, 240, 138, ${Math.min(0.85, 0.50 * tmp_intensity)})`);
      tmp_lightGrad.addColorStop(0.3, `rgba(254, 240, 138, ${Math.min(0.45, 0.22 * tmp_intensity)})`);
      tmp_lightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.beginPath();
      ctx.moveTo(tmp_headlightX, tmp_headlightY);
      ctx.lineTo(tmp_headlightX + tmp_reach, tmp_headlightY - 80 * tmp_intensity);
      ctx.lineTo(tmp_headlightX + tmp_reach + 40, tmp_headlightY + 110 * tmp_intensity);
      ctx.closePath();
      ctx.fillStyle = tmp_lightGrad;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Renders a heavy steel bogie truck with suspension springs, clamping brake shoes, and rotating wheelsets.
   */
  renderBogie(ctx, x, y, angle, wheelAngle, wheelCount = 2, brakeClamp = 0, thermalGlow = 0, suspensionY = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const tmp_r = this.wheelRadius;
    const tmp_wheelSpacing = 36;
    const tmp_startOffsetX = -(wheelCount - 1) * tmp_wheelSpacing * 0.5;
    const tmp_frameY = -tmp_r - 6 + suspensionY * 0.4;
    const tmp_totalSpan = (wheelCount - 1) * tmp_wheelSpacing + 32;

    // 1. Rotating steel wheelsets & mechanical brake shoe calipers (drawn behind sideframe)
    for (let tmp_i = 0; tmp_i < wheelCount; tmp_i++) {
      const tmp_wx = tmp_startOffsetX + tmp_i * tmp_wheelSpacing;
      this.renderWheel(ctx, tmp_wx, -tmp_r + 2, tmp_r, wheelAngle);

      // Mechanical brake shoe caliper clamping on wheel tread
      this.renderBrakeShoe(ctx, tmp_wx, -tmp_r + 2, tmp_r, brakeClamp, thermalGlow);
    }

    // 2. Heavy Cast-Steel Equalizer Sideframe Beam (matching Image 1)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(tmp_startOffsetX - 16, tmp_frameY, tmp_totalSpan, 8);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(tmp_startOffsetX - 16, tmp_frameY, tmp_totalSpan, 8);

    // 3. Inverted Triangular / Trapezoidal Axle-Box Pedestal Yokes & Suspension Nests over each wheel
    for (let tmp_i = 0; tmp_i < wheelCount; tmp_i++) {
      const tmp_wx = tmp_startOffsetX + tmp_i * tmp_wheelSpacing;
      const tmp_axleY = -tmp_r + 2;

      // Triangular cast-steel pedestal yoke
      ctx.beginPath();
      ctx.moveTo(tmp_wx - 14, tmp_frameY + 4);
      ctx.lineTo(tmp_wx + 14, tmp_frameY + 4);
      ctx.lineTo(tmp_wx + 9, tmp_axleY + 4);
      ctx.lineTo(tmp_wx - 9, tmp_axleY + 4);
      ctx.closePath();
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Dual primary coil suspension springs
      const tmp_springH = Math.max(3, 6 - suspensionY * 0.5);
      ctx.fillStyle = '#475569';
      ctx.fillRect(tmp_wx - 11, tmp_axleY - tmp_springH - 1, 4, tmp_springH);
      ctx.fillRect(tmp_wx + 7, tmp_axleY - tmp_springH - 1, 4, tmp_springH);

      // Axle journal bearing box housing
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tmp_wx - 6, tmp_axleY - 5, 12, 10);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(tmp_wx, tmp_axleY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Polished axle hubcap bolt
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(tmp_wx, tmp_axleY, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Center Bolster Pivot Plate & Secondary Shock Damper (for 3-axle bogies)
    if (wheelCount >= 3) {
      // Secondary rubber/air spring block centered between axles
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-10, tmp_frameY - 4, 20, 7);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-8, tmp_frameY - 3, 16, 5);

      // Hydraulic yaw damper diagonal strut
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-12, tmp_frameY + 6);
      ctx.lineTo(12, tmp_frameY - 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Renders mechanical brake shoe pads clamping onto the wheel rim, with thermal glowing heat.
   */
  renderBrakeShoe(ctx, wx, wy, wheelRadius, clampRatio = 0, thermalGlow = 0) {
    ctx.save();
    ctx.translate(wx, wy);

    // Left and right brake shoes
    const tmp_retractDist = (1.0 - Math.max(0, Math.min(1, clampRatio))) * 3.2; // Clamps against wheel tread
    const tmp_shoeOffset = wheelRadius + 1.2 + tmp_retractDist;

    // Left shoe (rear of wheel)
    this.drawShoeBlock(ctx, -tmp_shoeOffset, -2, -1, thermalGlow);
    // Right shoe (front of wheel)
    this.drawShoeBlock(ctx, tmp_shoeOffset, -2, 1, thermalGlow);

    ctx.restore();
  }

  /**
   * Helper drawing a single brake shoe block with optional cherry-red thermal friction glow.
   */
  drawShoeBlock(ctx, sx, sy, side, thermalGlow) {
    ctx.save();
    ctx.translate(sx, sy);

    // Metallic brake pad block
    ctx.fillStyle = thermalGlow > 0.05
      ? `rgb(${Math.floor(70 + thermalGlow * 185)}, ${Math.floor(40 + thermalGlow * 30)}, 35)`
      : '#334155';

    ctx.fillRect(side < 0 ? -4 : 0, -6, 4, 12);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(side < 0 ? -4 : 0, -6, 4, 12);

    // Thermal glow aura when braking hard at speed
    if (thermalGlow > 0.08) {
      ctx.beginPath();
      ctx.arc(side < 0 ? -2 : 2, 0, 8 + thermalGlow * 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244, 63, 94, ${thermalGlow * 0.45})`;
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Renders electric locomotive roof-mounted pantograph with articulating arms and contact collector shoe.
   */
  renderPantograph(ctx, px, py, swayOffset = 0) {
    ctx.save();
    ctx.translate(px, py);

    const tmp_baseW = 32;
    // Insulator bushings on roof
    ctx.fillStyle = '#78350f'; // Ceramic brown insulators
    ctx.fillRect(-tmp_baseW * 0.5, -4, 8, 4);
    ctx.fillRect(tmp_baseW * 0.5 - 8, -4, 8, 4);

    // Lower diamond frame arms
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;

    const tmp_lowerH = -22;
    const tmp_upperH = -42 + swayOffset;

    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-4, tmp_lowerH);
    ctx.moveTo(12, -4);
    ctx.lineTo(4, tmp_lowerH);
    ctx.stroke();

    // Central pneumatic/spring cylinder
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, tmp_lowerH - 3, 6, 6);

    // Upper articulating diamond arms
    ctx.beginPath();
    ctx.moveTo(-4, tmp_lowerH);
    ctx.lineTo(0, tmp_upperH);
    ctx.moveTo(4, tmp_lowerH);
    ctx.lineTo(0, tmp_upperH);
    ctx.stroke();

    // Top horizontal collector head shoe with graphite wear strips
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-20, tmp_upperH - 3, 40, 3);
    // Horn curve tips on collector shoe
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20, tmp_upperH - 1.5);
    ctx.lineTo(-24, tmp_upperH + 3);
    ctx.moveTo(20, tmp_upperH - 1.5);
    ctx.lineTo(24, tmp_upperH + 3);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Renders a single steel railway wheel with tread, flange, axle hubcap, and rotating spokes.
   */
  renderWheel(ctx, cx, cy, radius, rotation) {
    ctx.save();
    ctx.translate(cx, cy);

    // Outer wheel rim & tire
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Wheel flange lip
    ctx.beginPath();
    ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Inner wheel recessed web
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Rotating wheel inspection holes / spokes
    ctx.rotate(rotation);
    ctx.fillStyle = '#0f172a';
    for (let tmp_sp = 0; tmp_sp < 4; tmp_sp++) {
      ctx.beginPath();
      const tmp_ang = (tmp_sp * Math.PI) / 2;
      ctx.arc(Math.cos(tmp_ang) * (radius * 0.45), Math.sin(tmp_ang) * (radius * 0.45), 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Axle roller bearing journal cap
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }
}
