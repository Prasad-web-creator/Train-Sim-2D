/**
 * PassengerGroup.js
 * High-clarity 2D illustrated passenger characters, licensed Indian coolies,
 * daily commuters, saree-clad travelers, luggage items, and boarding animations.
 * 
 * Features distinct character scale (38-42px), detailed clothing, authentic skin tones,
 * accessories (briefcases, trolley bags, newspapers, brass arm badges),
 * and grounding contact shadows for maximum visual clarity on station platforms.
 */

import { getStationThemeProfile, cons_STATION_THEMES } from './StationTheme.js';

export class PassengerGroup {
  /**
   * Initializes procedural passenger population along platform length.
   */
  constructor(themeKey = cons_STATION_THEMES.INDIAN, platformStartDist = 100, platformLengthMeters = 150, count = 16) {
    this.themeKey = themeKey;
    this.theme = getStationThemeProfile(themeKey);
    this.platformStartDist = platformStartDist;
    this.platformLengthMeters = platformLengthMeters;
    this.initialCount = count;

    this.arr_passengers = [];
    this.boardingProgress = 0; // 0 to 1
    this.isBoardingActive = false;
    this.isTrainApproaching = false;
    this.isTrainDeparting = false;
    this.animTimer = 0;

    this.generatePassengers();
  }

  /**
   * Deterministically populates high-clarity passenger characters along the platform.
   */
  generatePassengers() {
    this.arr_passengers = [];
    const tmp_step = (this.platformLengthMeters - 24) / Math.max(4, this.initialCount);

    for (let tmp_i = 0; tmp_i < this.initialCount; tmp_i++) {
      const tmp_dist = this.platformStartDist + 12 + tmp_i * tmp_step + (Math.sin(tmp_i * 3.7) * 3);
      const tmp_rand = Math.abs(Math.sin(tmp_i * 9.2));

      let tmp_type = 'commuter';
      if (this.themeKey === cons_STATION_THEMES.INDIAN) {
        if (tmp_i % 4 === 1) {
          tmp_type = 'coolie'; // Licensed railway porter in red coat with trunk on head
        } else if (tmp_i % 4 === 2) {
          tmp_type = 'saree_passenger'; // Woman in vibrant Indian saree
        } else if (tmp_rand < 0.3) {
          tmp_type = 'seated';
        } else if (tmp_rand < 0.65) {
          tmp_type = 'luggage_traveler';
        } else {
          tmp_type = 'commuter';
        }
      } else {
        if (tmp_rand < 0.25) {
          tmp_type = 'seated';
        } else if (tmp_rand < 0.6) {
          tmp_type = 'luggage_traveler';
        } else if (tmp_rand < 0.8) {
          tmp_type = 'reader';
        } else {
          tmp_type = 'commuter';
        }
      }

      // Height tuned to 38-42px for high visual clarity and definition
      const tmp_baseH = 38 + (tmp_rand * 4);

      // Color variation for attire
      const arr_sareeColors = ['#0284c7', '#be185d', '#059669', '#ea580c', '#7c3aed'];
      const arr_shirtColors = ['#f8fafc', '#e0f2fe', '#fef08a', '#e2e8f0', '#fed7aa'];

      this.arr_passengers.push({
        id: tmp_i,
        dist: tmp_dist,
        origDist: tmp_dist,
        type: tmp_type,
        height: tmp_baseH,
        facingDirection: 1, // 1 = facing right / track, -1 = facing left
        isBoarding: tmp_type !== 'seated' && (tmp_i % 3 !== 0),
        targetDoorDist: tmp_dist + (Math.sin(tmp_i * 1.5) * 8),
        alpha: 1.0,
        bobPhase: tmp_i * 0.7,
        attireColor: tmp_type === 'saree_passenger' 
          ? arr_sareeColors[tmp_i % arr_sareeColors.length]
          : arr_shirtColors[tmp_i % arr_shirtColors.length],
        luggageType: this.theme.luggage[tmp_i % this.theme.luggage.length],
      });
    }
  }

  /**
   * Updates passenger state machine: approach turning, boarding walk cycle, and dwell fade.
   */
  update(deltaTime, stationState, dwellProgress = 0) {
    this.animTimer += deltaTime;
    this.isTrainApproaching = stationState === 'APPROACHING';
    this.isBoardingActive = stationState === 'BERTHED';
    this.isTrainDeparting = stationState === 'DEPARTING';
    this.boardingProgress = Math.max(0, Math.min(1, dwellProgress));

    for (let tmp_i = 0; tmp_i < this.arr_passengers.length; tmp_i++) {
      const obj_p = this.arr_passengers[tmp_i];

      // Approach state: passengers turn towards the incoming train
      if (this.isTrainApproaching) {
        obj_p.facingDirection = -1;
      }

      // Boarding state: walk towards coach doors
      if (this.isBoardingActive && obj_p.isBoarding) {
        const tmp_walkSpeed = 1.4; // m/s
        const tmp_distDiff = obj_p.targetDoorDist - obj_p.dist;

        if (Math.abs(tmp_distDiff) > 0.3) {
          obj_p.facingDirection = tmp_distDiff > 0 ? 1 : -1;
          obj_p.dist += Math.sign(tmp_distDiff) * Math.min(Math.abs(tmp_distDiff), tmp_walkSpeed * deltaTime);
        }

        // Smooth fade out as boarding completes
        if (this.boardingProgress > 0.4) {
          const tmp_fade = (this.boardingProgress - 0.4) / 0.55;
          obj_p.alpha = Math.max(0, 1.0 - tmp_fade);
        }
      }

      // Reset when idle
      if (!this.isBoardingActive && !this.isTrainApproaching && !this.isTrainDeparting) {
        obj_p.alpha = 1.0;
        obj_p.dist = obj_p.origDist;
      }
    }
  }

  /**
   * Renders all passenger characters and luggage along the platform.
   */
  render(ctx, ppm, trackElevationFn, platformYOffset = 34) {
    ctx.save();

    for (let tmp_i = 0; tmp_i < this.arr_passengers.length; tmp_i++) {
      const obj_p = this.arr_passengers[tmp_i];
      if (obj_p.alpha <= 0.01) continue;

      const tmp_worldX = Math.round(obj_p.dist * ppm);
      const tmp_trackY = Math.round(trackElevationFn(obj_p.dist));
      const tmp_platformY = tmp_trackY - platformYOffset; // Platform walking surface

      ctx.save();
      ctx.globalAlpha = obj_p.alpha;
      ctx.translate(tmp_worldX, tmp_platformY);
      ctx.scale(obj_p.facingDirection, 1);

      // Walking bounce when moving
      let tmp_walkBobY = 0;
      let tmp_strideAngle = 0;
      if (this.isBoardingActive && obj_p.isBoarding && obj_p.alpha > 0.1) {
        tmp_walkBobY = Math.abs(Math.sin(this.animTimer * 10 + obj_p.bobPhase)) * -2.5;
        tmp_strideAngle = Math.sin(this.animTimer * 10 + obj_p.bobPhase) * 0.4;
      }

      ctx.translate(0, tmp_walkBobY);

      // Grounding contact shadow under character feet
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Render specific character type with rich details
      if (obj_p.type === 'coolie') {
        this.renderCoolie(ctx, obj_p.height, tmp_strideAngle);
      } else if (obj_p.type === 'saree_passenger') {
        this.renderSareePassenger(ctx, obj_p.height, obj_p.attireColor, tmp_strideAngle);
      } else if (obj_p.type === 'seated') {
        this.renderSeatedPassenger(ctx, obj_p.height, obj_p.attireColor);
      } else if (obj_p.type === 'luggage_traveler') {
        this.renderLuggageTraveler(ctx, obj_p.height, obj_p.attireColor, obj_p.luggageType, tmp_strideAngle);
      } else if (obj_p.type === 'reader') {
        this.renderReaderPassenger(ctx, obj_p.height, obj_p.attireColor);
      } else {
        this.renderCommuter(ctx, obj_p.height, obj_p.attireColor, tmp_strideAngle);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * 1. Indian Railways Coolie (Licensed Railway Porter):
   * Features crimson red coat, white collar, golden brass licensed arm badge,
   * cloth turban/cushion ring, vintage brass luggage trunk on head, white pleated trousers, sandals.
   */
  renderCoolie(ctx, height, strideAngle = 0) {
    const tmp_headR = 3.8;
    const tmp_headY = -height * 0.76;
    const tmp_torsoTopY = tmp_headY + tmp_headR + 1;
    const tmp_waistY = -height * 0.42;

    // 1. Legs / White Dhoti Trousers
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Left leg
    ctx.moveTo(-2, tmp_waistY);
    ctx.lineTo(-2 - Math.sin(strideAngle) * 5, -2);
    // Right leg
    ctx.moveTo(2, tmp_waistY);
    ctx.lineTo(2 + Math.sin(strideAngle) * 5, -2);
    ctx.stroke();

    // Leather sandals (Chappals)
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-4 - Math.sin(strideAngle) * 5, -2, 5, 2);
    ctx.fillRect(0 + Math.sin(strideAngle) * 5, -2, 5, 2);

    // 2. Red Uniform Coat (Kurta)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-5.5, tmp_torsoTopY);
    ctx.lineTo(5.5, tmp_torsoTopY);
    ctx.lineTo(5, tmp_waistY);
    ctx.lineTo(-5, tmp_waistY);
    ctx.closePath();
    ctx.fill();

    // White shirt collar peeking out
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-2.5, tmp_torsoTopY);
    ctx.lineTo(0, tmp_torsoTopY + 3.5);
    ctx.lineTo(2.5, tmp_torsoTopY);
    ctx.closePath();
    ctx.fill();

    // Dark buttons down front
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-0.7, tmp_torsoTopY + 4, 1.4, 1.5);
    ctx.fillRect(-0.7, tmp_torsoTopY + 7, 1.4, 1.5);

    // Golden licensed porter brass arm badge on left arm
    ctx.fillStyle = '#facc15';
    ctx.fillRect(4.2, tmp_torsoTopY + 3, 3, 4);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(4.2, tmp_torsoTopY + 3, 3, 4);

    // 3. Head & Skin
    // Neck
    ctx.fillStyle = '#a16207'; // Authentic warm Indian skin tone
    ctx.fillRect(-1.5, tmp_headY, 3, 4);

    // Face / Head
    ctx.beginPath();
    ctx.arc(0, tmp_headY, tmp_headR, 0, Math.PI * 2);
    ctx.fill();

    // Facial profile nose
    ctx.fillRect(2.8, tmp_headY - 1, 1.8, 2);

    // Red cloth pagri / cushion pad on head
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-5, tmp_headY - tmp_headR - 2.5, 10, 3.5);

    // 4. Arms raised supporting the trunk
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Left arm
    ctx.moveTo(-5, tmp_torsoTopY + 2);
    ctx.lineTo(-8, tmp_headY);
    ctx.lineTo(-6, tmp_headY - tmp_headR - 3);
    // Right arm
    ctx.moveTo(5, tmp_torsoTopY + 2);
    ctx.lineTo(8, tmp_headY);
    ctx.lineTo(6, tmp_headY - tmp_headR - 3);
    ctx.stroke();

    // Hands
    ctx.fillStyle = '#a16207';
    ctx.fillRect(-7.5, tmp_headY - tmp_headR - 4.5, 3, 2.5);
    ctx.fillRect(4.5, tmp_headY - tmp_headR - 4.5, 3, 2.5);

    // 5. Metal / Brass Luggage Trunk on Head
    const tmp_trunkY = tmp_headY - tmp_headR - 17;
    const tmp_trunkW = 24;
    const tmp_trunkH = 14;

    // Trunk body
    ctx.fillStyle = '#d97706'; // Warm brass/amber metal
    ctx.fillRect(-tmp_trunkW * 0.5, tmp_trunkY, tmp_trunkW, tmp_trunkH);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-tmp_trunkW * 0.5, tmp_trunkY, tmp_trunkW, tmp_trunkH);

    // Leather reinforcement bands
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-tmp_trunkW * 0.5 + 4, tmp_trunkY, 2.5, tmp_trunkH);
    ctx.fillRect(tmp_trunkW * 0.5 - 6.5, tmp_trunkY, 2.5, tmp_trunkH);

    // Brass corner brackets
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-tmp_trunkW * 0.5, tmp_trunkY, 3, 3);
    ctx.fillRect(tmp_trunkW * 0.5 - 3, tmp_trunkY, 3, 3);
    ctx.fillRect(-tmp_trunkW * 0.5, tmp_trunkY + tmp_trunkH - 3, 3, 3);
    ctx.fillRect(tmp_trunkW * 0.5 - 3, tmp_trunkY + tmp_trunkH - 3, 3, 3);

    // Central brass lock latch
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-1.5, tmp_trunkY + 5, 3, 4);
  }

  /**
   * 2. Female Passenger in Elegant Saree:
   * Features flowing pleated saree in festival colors, gold zari border / pallu over shoulder,
   * neat hair bun, delicate jewelry highlight, and travel handbag.
   */
  renderSareePassenger(ctx, height, sareeColor = '#0284c7', strideAngle = 0) {
    const tmp_headR = 3.6;
    const tmp_headY = -height * 0.78;
    const tmp_torsoTopY = tmp_headY + tmp_headR + 1;
    const tmp_waistY = -height * 0.44;

    // 1. Flowing Saree Skirt
    ctx.fillStyle = sareeColor;
    ctx.beginPath();
    ctx.moveTo(-4, tmp_waistY);
    ctx.lineTo(4, tmp_waistY);
    ctx.lineTo(6 + Math.sin(strideAngle) * 2, -2);
    ctx.lineTo(-6 - Math.sin(strideAngle) * 2, -2);
    ctx.closePath();
    ctx.fill();

    // Golden Zari Border along hem
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-6 - Math.sin(strideAngle) * 2, -4, 12, 2.2);

    // 2. Blouse & Pallu Draped Over Torso
    ctx.fillStyle = sareeColor;
    ctx.beginPath();
    ctx.moveTo(-4.5, tmp_torsoTopY);
    ctx.lineTo(4.5, tmp_torsoTopY);
    ctx.lineTo(4, tmp_waistY);
    ctx.lineTo(-4, tmp_waistY);
    ctx.closePath();
    ctx.fill();

    // Diagonal Gold Pallu Sash
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-4, tmp_waistY + 2);
    ctx.lineTo(3.5, tmp_torsoTopY + 1);
    ctx.stroke();

    // 3. Head, Neck & Hair
    ctx.fillStyle = '#a16207'; // Skin tone
    ctx.fillRect(-1.2, tmp_headY, 2.4, 3.5);
    ctx.beginPath();
    ctx.arc(0, tmp_headY, tmp_headR, 0, Math.PI * 2);
    ctx.fill();

    // Hair bun (Juda) at back
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-tmp_headR - 1, tmp_headY - 0.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Jasmine flower garland highlight (Gajra)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-tmp_headR - 2.5, tmp_headY - 2.5, 2, 4);

    // 4. Arms & Handbag
    ctx.strokeStyle = sareeColor;
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(3.5, tmp_torsoTopY + 2);
    ctx.lineTo(5.5, tmp_waistY + 2);
    ctx.stroke();

    // Leather handbag in hand
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4.5, tmp_waistY + 3, 5, 5.5);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(4.5, tmp_waistY + 3, 5, 5.5);
    // Handbag strap
    ctx.beginPath();
    ctx.arc(7, tmp_waistY + 3, 2, Math.PI, 0);
    ctx.stroke();
  }

  /**
   * 3. Professional Commuter:
   * Collared shirt, slacks, belt with buckle, leather briefcase, formal shoes.
   */
  renderCommuter(ctx, height, shirtColor = '#e0f2fe', strideAngle = 0) {
    const tmp_headR = 3.8;
    const tmp_headY = -height * 0.8;
    const tmp_torsoTopY = tmp_headY + tmp_headR + 1;
    const tmp_waistY = -height * 0.45;

    // 1. Slacks / Trousers
    ctx.strokeStyle = '#1e293b'; // Charcoal navy trousers
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2, tmp_waistY);
    ctx.lineTo(-2 - Math.sin(strideAngle) * 5, -2);
    ctx.moveTo(2, tmp_waistY);
    ctx.lineTo(2 + Math.sin(strideAngle) * 5, -2);
    ctx.stroke();

    // Formal leather shoes
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-4 - Math.sin(strideAngle) * 5, -2, 5.5, 2);
    ctx.fillRect(0 + Math.sin(strideAngle) * 5, -2, 5.5, 2);

    // 2. Collared Shirt
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.moveTo(-5.5, tmp_torsoTopY);
    ctx.lineTo(5.5, tmp_torsoTopY);
    ctx.lineTo(4.5, tmp_waistY);
    ctx.lineTo(-4.5, tmp_waistY);
    ctx.closePath();
    ctx.fill();

    // Brown leather belt with gold buckle
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-4.5, tmp_waistY - 2.5, 9, 2.5);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-1, tmp_waistY - 2.5, 2, 2.5);

    // 3. Head & Hair
    ctx.fillStyle = '#a16207'; // Skin tone
    ctx.fillRect(-1.5, tmp_headY, 3, 3.5);
    ctx.beginPath();
    ctx.arc(0, tmp_headY, tmp_headR, 0, Math.PI * 2);
    ctx.fill();

    // Dark hair
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, tmp_headY - 1, tmp_headR, Math.PI, Math.PI * 2);
    ctx.fill();

    // 4. Arms & Leather Briefcase
    ctx.strokeStyle = shirtColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(4.5, tmp_torsoTopY + 2);
    ctx.lineTo(6.5, tmp_waistY + 4);
    ctx.stroke();

    // Brown leather briefcase
    ctx.fillStyle = '#92400e';
    ctx.fillRect(6, tmp_waistY + 3, 8, 7);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, tmp_waistY + 3, 8, 7);
    // Brass clasp
    ctx.fillStyle = '#facc15';
    ctx.fillRect(9.5, tmp_waistY + 6, 1.5, 2);
  }

  /**
   * 4. Traveler with Rolling Trolley Luggage:
   * Casual jacket, rolling spinner suitcase with telescoping handle, travel bag.
   */
  renderLuggageTraveler(ctx, height, shirtColor = '#f8fafc', luggageType = 'spinner_suitcase', strideAngle = 0) {
    this.renderCommuter(ctx, height, shirtColor, strideAngle);

    // Rolling Trolley Luggage beside traveler
    const tmp_lx = 9;
    const tmp_luggageH = 18;
    const tmp_luggageW = 11;

    // Upright suitcase body
    ctx.fillStyle = '#0284c7'; // Navy/royal blue suitcase
    ctx.fillRect(tmp_lx, -tmp_luggageH, tmp_luggageW, tmp_luggageH - 3);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(tmp_lx, -tmp_luggageH, tmp_luggageW, tmp_luggageH - 3);

    // Front zipper pocket highlight
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(tmp_lx + 2, -tmp_luggageH + 3, tmp_luggageW - 4, tmp_luggageH - 9);

    // Telescoping silver pull handle
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tmp_lx + 3.5, -tmp_luggageH);
    ctx.lineTo(tmp_lx + 3.5, -tmp_luggageH - 8);
    ctx.lineTo(tmp_lx + 7.5, -tmp_luggageH - 8);
    ctx.lineTo(tmp_lx + 7.5, -tmp_luggageH);
    ctx.stroke();

    // Black handle grip
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(tmp_lx + 2.5, -tmp_luggageH - 9.5, 6, 2);

    // Suitcase spinner wheels
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(tmp_lx + 2.5, -1.5, 1.5, 0, Math.PI * 2);
    ctx.arc(tmp_lx + tmp_luggageW - 2.5, -1.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 5. Seated Passenger Resting on Platform Bench:
   * Relaxed posture, crossed legs, reading newspaper.
   */
  renderSeatedPassenger(ctx, height, shirtColor = '#f8fafc') {
    const tmp_seatedH = height * 0.72;
    const tmp_headR = 3.6;
    const tmp_headY = -tmp_seatedH;

    // 1. Thighs & Lower Legs
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Thigh horizontal on bench
    ctx.moveTo(-1, -12);
    ctx.lineTo(8, -12);
    // Lower leg down to platform
    ctx.lineTo(8, -1);
    ctx.stroke();

    // Shoes
    ctx.fillStyle = '#09090b';
    ctx.fillRect(6, -2, 5, 2);

    // 2. Torso leaned back comfortably
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.moveTo(-4, tmp_headY + tmp_headR + 1);
    ctx.lineTo(4, tmp_headY + tmp_headR + 1);
    ctx.lineTo(3, -12);
    ctx.lineTo(-4, -12);
    ctx.closePath();
    ctx.fill();

    // 3. Head & Hair
    ctx.fillStyle = '#a16207';
    ctx.beginPath();
    ctx.arc(0, tmp_headY, tmp_headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, tmp_headY - 1, tmp_headR, Math.PI, Math.PI * 2);
    ctx.fill();

    // 4. Folded Morning Newspaper in Hands
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(4, -18);
    ctx.lineTo(13, -20);
    ctx.lineTo(14, -8);
    ctx.lineTo(5, -6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Newspaper text lines
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(6, -16);
    ctx.lineTo(11, -17);
    ctx.moveTo(6, -13);
    ctx.lineTo(12, -14);
    ctx.moveTo(6, -10);
    ctx.lineTo(12, -11);
    ctx.stroke();
  }

  /**
   * 6. Standing Reader Passenger:
   */
  renderReaderPassenger(ctx, height, shirtColor = '#f8fafc') {
    this.renderCommuter(ctx, height, shirtColor, 0);

    // Open book / folded paper in hands
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(4, -height * 0.55);
    ctx.lineTo(11, -height * 0.62);
    ctx.lineTo(12, -height * 0.42);
    ctx.lineTo(5, -height * 0.38);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}
