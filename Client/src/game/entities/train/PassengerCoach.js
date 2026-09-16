/**
 * PassengerCoach.js
 * High-detail procedural vector 2D Indian Railways LHB Rajdhani Express passenger coach entity.
 * Features iconic silver-grey body with thick crimson-red window band, yellow "RAJDHANI EXPRESS"
 * destination board, bold red vestibule entrance doors with vertical windows, high-visibility yellow
 * end grab rails, wide panoramic sealed AC tinted windows with diagonal glass reflection sheens,
 * fluted stainless steel roof, underslung bio-toilets & inverters, and inter-car accordion gangway bellows.
 */

import { TrainCar } from './TrainCar.js';
import { drawRoundedRect } from '../../../utils/CanvasUtils.js';

export class PassengerCoach extends TrainCar {
  /**
   * Initializes Indian Railways LHB passenger coach dimensions, livery colors, and interior lighting.
   */
  constructor(name = 'LHB Rajdhani Coach', lengthMeters = 24.0, totalMassKg = 42000) {
    super(name, lengthMeters, totalMassKg, 2); // 2 axles per FIAT-SIG LHB bogie
    this.bodyColor = '#cbd5e1'; // Metallic silver-grey
    this.stripeColor = '#dc2626'; // Bold crimson-red
    this.roofColor = '#94a3b8';
    this.interiorLightOn = true;

    this.model = {
      name: 'LHB Rajdhani Passenger Coach',
      bodyColor: '#cbd5e1',
      stripeColor: '#dc2626',
      roofColor: '#94a3b8',
      undercarriageColor: '#0f172a',
      bogieWheelCount: 2,
    };
  }

  /**
   * Renders the complete authentic Indian Railways LHB Rajdhani passenger coach bodywork:
   * Silver body, thick crimson window band, yellow destination board, red passenger doors,
   * yellow corner grab rails, panoramic tinted windows, fluted roof, and undercarriage equipment.
   */
  renderBody(ctx, options = {}) {
    const tmp_len = this.lengthPixels;
    const tmp_halfLen = tmp_len * 0.5;

    // Dimensions aligned with WAP-7 locomotive chassis & roofline
    const coachH = 64;   // Height from sill (y = -20) to roofline (y = -84)
    const sillY = -20;
    const roofY = -84;

    // Check interior illumination settings
    const obj_lighting = options.weatherSystem ? options.weatherSystem.getTrainLightingSettings() : null;
    const obj_dnLighting = options.dayNightSystem ? options.dayNightSystem.getLightingState() : null;
    let tmp_isLit = obj_lighting ? obj_lighting.illuminateCoaches : this.interiorLightOn;
    if (obj_dnLighting && obj_dnLighting.buildingLightsActive) {
      tmp_isLit = true;
    }

    // 1. Underslung Heavy Equipment: AC inverters, battery box, air tanks, bio-toilets
    this.renderUnderframeEquipment(ctx, tmp_halfLen);

    // 2. Heavy Cast-Steel Chassis Main Sill & Buffer Beam
    this.renderChassisSill(ctx, tmp_halfLen);

    // 3. Main LHB Rajdhani Carbody & Iconic Crimson Red Window Band
    this.renderCarbodyAndLivery(ctx, tmp_halfLen, roofY, sillY);

    // 4. Passenger Entrance Doors (Bold Crimson Red with tall vertical windows & yellow corner bars)
    this.renderEntranceDoorsAndCornerBars(ctx, tmp_halfLen, roofY, sillY, tmp_isLit);

    // 5. Panoramic Sealed AC Passenger Windows Row & Yellow Destination Board
    this.renderPassengerWindows(ctx, tmp_halfLen, roofY, tmp_isLit);

    // 6. Fluted Stainless Steel Curved Roof with Longitudinal Ribs & AC Units
    this.renderRoofAndACPods(ctx, tmp_halfLen, roofY);

    // 7. End Vestibule Flexible Accordion Diaphragm Gangway Bellows
    this.renderGangwayDiaphragms(ctx, tmp_halfLen, coachH);

    // 8. Front & Rear Coupler Knuckles at Buffer Beam Centerline (y = -12)
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
   * 1. Underslung Equipment: Central AC inverter & battery enclosures, twin air brake reservoirs,
   * bio-toilet retention tanks, and structural underframe girder.
   */
  renderUnderframeEquipment(ctx, halfLen) {
    ctx.save();

    // Central Heavy AC Inverter & Electrical Equipment Box (between bogies)
    const boxW = 190;
    const boxH = 12;
    const boxX = -boxW * 0.5;
    const boxY = -14;

    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Ventilation slats on inverter box
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    for (let bx = boxX + 16; bx < boxX + boxW - 14; bx += 9) {
      ctx.beginPath();
      ctx.moveTo(bx, boxY + 2);
      ctx.lineTo(bx, boxY + boxH - 2);
      ctx.stroke();
    }

    // Twin Cylindrical Auxiliary Air Reservoirs
    // Left Tank
    ctx.fillStyle = '#334155';
    drawRoundedRect(ctx, boxX - 58, -12, 46, 7, 3);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.0;
    ctx.stroke();
    // Left tank mounting straps
    ctx.fillStyle = '#64748b';
    ctx.fillRect(boxX - 50, -13, 2.5, 9);
    ctx.fillRect(boxX - 22, -13, 2.5, 9);

    // Right Tank
    ctx.fillStyle = '#334155';
    drawRoundedRect(ctx, boxX + boxW + 12, -12, 46, 7, 3);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.0;
    ctx.stroke();
    // Right tank mounting straps
    ctx.fillStyle = '#64748b';
    ctx.fillRect(boxX + boxW + 20, -13, 2.5, 9);
    ctx.fillRect(boxX + boxW + 48, -13, 2.5, 9);

    // Bio-Toilet Retention Tanks (green/charcoal tanks near the ends)
    ctx.fillStyle = '#166534';
    drawRoundedRect(ctx, -halfLen + 70, -11, 28, 6, 2);
    ctx.fill();
    drawRoundedRect(ctx, halfLen - 98, -11, 28, 6, 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * 2. Heavy Cast-Steel Chassis Main Sill Beam & Lower Edge Trim.
   */
  renderChassisSill(ctx, halfLen) {
    ctx.save();
    const totalLen = halfLen * 2;

    // Heavy Cast-Steel Main Sill Beam spanning vehicle length
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfLen, -20, totalLen, 6);

    // Underframe skirt edge trim
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-halfLen + 4, -15, totalLen - 8, 2);

    // Front buffer beam / headstock & CBC draft gear pocket
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(halfLen - 4, -22, 4, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(halfLen - 1, -16, 2, 8);

    // Rear buffer beam / headstock & CBC draft gear pocket
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfLen, -22, 4, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-halfLen - 1, -16, 2, 8);

    ctx.restore();
  }

  /**
   * 3. Main LHB Rajdhani Carbody & Iconic Crimson Red Window Band:
   * Silver-grey base body with a wide horizontal crimson-red band across the middle.
   */
  renderCarbodyAndLivery(ctx, halfLen, roofY, sillY) {
    ctx.save();

    const carbodyW = halfLen * 2 - 20;
    const carbodyH = sillY - roofY;

    // Base Carbody: Metallic silver-grey with subtle vertical gradient
    const bodyGrad = ctx.createLinearGradient(0, roofY, 0, sillY);
    bodyGrad.addColorStop(0.0, '#cbd5e1');
    bodyGrad.addColorStop(0.3, '#f1f5f9');
    bodyGrad.addColorStop(0.7, '#e2e8f0');
    bodyGrad.addColorStop(1.0, '#cbd5e1');

    ctx.fillStyle = bodyGrad;
    drawRoundedRect(ctx, -halfLen + 10, roofY, carbodyW, carbodyH, 4);
    ctx.fill();

    // Bold Crimson-Red Window Band running horizontally between doors
    // From y = -68 to y = -38 (covering the entire window row)
    const bandY = -68;
    const bandH = 30;
    const bandStartX = -halfLen + 64;
    const bandEndX = halfLen - 64;
    const bandW = bandEndX - bandStartX;

    const bandGrad = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
    bandGrad.addColorStop(0.0, '#b91c1c');
    bandGrad.addColorStop(0.45, '#dc2626');
    bandGrad.addColorStop(1.0, '#991b1b');

    ctx.fillStyle = bandGrad;
    ctx.fillRect(bandStartX, bandY, bandW, bandH);

    // Dark crimson framing pinstripes
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(bandStartX, bandY, bandW, 1.2);
    ctx.fillRect(bandStartX, bandY + bandH - 1.2, bandW, 1.2);

    // Lower carbody subtle dark accent stripe
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-halfLen + 10, -22, carbodyW, 1.4);

    // Outer carbody border stroke
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    drawRoundedRect(ctx, -halfLen + 10, roofY, carbodyW, carbodyH, 4);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 4. Passenger Entrance Doors & Corner Safety Bars:
   * Bold crimson-red doors with tall vertical windows and bright yellow vertical grab rails at car ends.
   */
  renderEntranceDoorsAndCornerBars(ctx, halfLen, roofY, sillY, isLit) {
    ctx.save();

    const doorW = 26;
    const doorH = sillY - roofY - 2;
    const doorY = roofY + 2;

    const frontDoorX = halfLen - 62;
    const rearDoorX = -halfLen + 36;

    // Render Front Door (right end)
    this.drawLhbDoor(ctx, frontDoorX, doorY, doorW, doorH, true, isLit);

    // Render Rear Door (left end)
    this.drawLhbDoor(ctx, rearDoorX, doorY, doorW, doorH, false, isLit);

    // ================= Bright Yellow Corner Safety Grab Rails & Stripes =================
    // Front corner rail (right end)
    const frontRailX = halfLen - 16;
    ctx.strokeStyle = '#fbbf24'; // High-visibility safety yellow
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(frontRailX, roofY + 6);
    ctx.lineTo(frontRailX, -16);
    ctx.stroke();

    // Front corner yellow safety accent marker
    ctx.fillStyle = '#facc15';
    ctx.fillRect(frontRailX - 1.5, roofY + 8, 3, 10);
    ctx.fillRect(frontRailX - 1.5, -28, 3, 10);

    // Rear corner rail (left end)
    const rearRailX = -halfLen + 16;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(rearRailX, roofY + 6);
    ctx.lineTo(rearRailX, -16);
    ctx.stroke();

    // Rear corner yellow safety accent marker
    ctx.fillStyle = '#facc15';
    ctx.fillRect(rearRailX - 1.5, roofY + 8, 3, 10);
    ctx.fillRect(rearRailX - 1.5, -28, 3, 10);

    ctx.restore();
  }

  /**
   * Helper to draw a single Indian Railways LHB passenger entrance door.
   */
  drawLhbDoor(ctx, x, y, w, h, isFront, isLit) {
    // Door panel: Bold Crimson Red
    const doorGrad = ctx.createLinearGradient(0, y, 0, y + h);
    doorGrad.addColorStop(0.0, '#b91c1c');
    doorGrad.addColorStop(0.5, '#dc2626');
    doorGrad.addColorStop(1.0, '#991b1b');

    ctx.fillStyle = doorGrad;
    drawRoundedRect(ctx, x, y, w, h, 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tall vertical drop window on door
    const winW = 14;
    const winH = 32;
    const winX = x + (w - winW) * 0.5;
    const winY = y + 6;

    // Window frame gasket
    ctx.fillStyle = '#0f172a';
    drawRoundedRect(ctx, winX, winY, winW, winH, 4);
    ctx.fill();

    // Window glass
    ctx.fillStyle = isLit ? '#fef08a' : '#0284c7';
    drawRoundedRect(ctx, winX + 1.2, winY + 1.2, winW - 2.4, winH - 2.4, 3);
    ctx.fill();

    // Glass reflection diagonal sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(winX + 2, winY + winH - 4);
    ctx.lineTo(winX + 6, winY + winH - 4);
    ctx.lineTo(winX + winW - 2, winY + 4);
    ctx.lineTo(winX + winW - 6, winY + 4);
    ctx.closePath();
    ctx.fill();

    // Chrome door handle
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(isFront ? x + 3 : x + w - 5.5, y + h * 0.52, 2.5, 7);

    // Boarding Footstep Stirrup Ladder (hanging below frame)
    const ladderX = x + 3;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.8;
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
   * 5. Panoramic Sealed AC Passenger Windows Row & Yellow "RAJDHANI EXPRESS" Board:
   * 9 wide rectangular tinted windows with rubber gaskets and reflections,
   * plus the golden-yellow destination name board centered above the windows.
   */
  renderPassengerWindows(ctx, halfLen, roofY, isLit) {
    ctx.save();

    const winW = 44;
    const winH = 22;
    const winY = -64;

    // Windows span from -halfLen + 76 to +halfLen - 76
    const startX = -halfLen + 76;
    const endX = halfLen - 76;
    const totalSpan = endX - startX;
    const windowCount = 9;
    const step = (totalSpan - winW) / (windowCount - 1);

    const glassColor = isLit ? '#fef08a' : '#0284c7';

    for (let i = 0; i < windowCount; i++) {
      const wx = startX + i * step;

      // Dark rubber window gasket surround
      ctx.fillStyle = '#0f172a';
      drawRoundedRect(ctx, wx, winY, winW, winH, 4);
      ctx.fill();

      // Tinted window glass (warm glow in dark, azure-blue reflection in daylight)
      ctx.fillStyle = glassColor;
      drawRoundedRect(ctx, wx + 1.5, winY + 1.5, winW - 3, winH - 3, 3);
      ctx.fill();

      // Middle window is the Emergency Exit (with red warning perimeter frame)
      if (i === 4) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.2;
        drawRoundedRect(ctx, wx + 2.5, winY + 2.5, winW - 5, winH - 5, 2);
        ctx.stroke();
      }

      // Glass diagonal reflection highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.moveTo(wx + 4, winY + winH - 2);
      ctx.lineTo(wx + 12, winY + winH - 2);
      ctx.lineTo(wx + winW - 4, winY + 2);
      ctx.lineTo(wx + winW - 12, winY + 2);
      ctx.closePath();
      ctx.fill();

      // Subtle seated passenger silhouette when interior is illuminated
      if (isLit && (i === 1 || i === 3 || i === 5 || i === 7)) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.arc(wx + winW * 0.45, winY + 8, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(wx + winW * 0.45 - 3.5, winY + 12, 7, 7);
      }
    }

    // ================= Golden-Yellow Destination Name Board =================
    // Centered above the middle window matching Image 1
    const boardW = 62;
    const boardH = 8;
    const boardX = -boardW * 0.5;
    const boardY = -72;

    ctx.fillStyle = '#facc15'; // Bright golden yellow
    drawRoundedRect(ctx, boardX, boardY, boardW, boardH, 1.5);
    ctx.fill();
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "bold 6.5px 'Rajdhani', 'Segoe UI', Arial, sans-serif";
    ctx.fillText('RAJDHANI EXPRESS', 0, boardY + boardH * 0.5 + 0.5);

    ctx.restore();
  }

  /**
   * 6. Fluted Stainless Steel Curved Roof with Longitudinal Corrugation Ribs & AC Pods.
   */
  renderRoofAndACPods(ctx, halfLen, roofY) {
    ctx.save();

    const carbodyW = halfLen * 2 - 20;

    // Curved Roof Profile Cap
    const roofH = 7;
    const roofGrad = ctx.createLinearGradient(0, roofY - roofH, 0, roofY);
    roofGrad.addColorStop(0.0, '#94a3b8');
    roofGrad.addColorStop(0.5, '#cbd5e1');
    roofGrad.addColorStop(1.0, '#64748b');

    ctx.fillStyle = roofGrad;
    drawRoundedRect(ctx, -halfLen + 10, roofY - roofH, carbodyW, roofH + 2, 4);
    ctx.fill();

    // Longitudinal Stainless Steel Fluted Roof Corrugations
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.0;
    for (let ry = roofY - roofH + 2; ry <= roofY - 1; ry += 2.2) {
      ctx.beginPath();
      ctx.moveTo(-halfLen + 14, ry);
      ctx.lineTo(halfLen - 14, ry);
      ctx.stroke();
    }

    // AC Unit Cooling Pods on Roof (tapered housing at ends)
    ctx.fillStyle = '#475569';
    drawRoundedRect(ctx, -halfLen * 0.45, roofY - roofH - 4, 64, 5, 2);
    ctx.fill();
    drawRoundedRect(ctx, halfLen * 0.2, roofY - roofH - 4, 64, 5, 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * 7. End Vestibule Flexible Accordion Diaphragm Gangway Bellows:
   * Provides seamless inter-car gangway connections with pleated rubber folds.
   */
  renderGangwayDiaphragms(ctx, halfLen, coachH) {
    ctx.save();

    const bellowsW = 10;
    const bellowsH = coachH - 4;
    const bellowsY = -coachH - 16;

    // Rear End Bellows (-halfLen)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfLen, bellowsY, bellowsW, bellowsH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.4;
    for (let py = bellowsY + 4; py < bellowsY + bellowsH - 2; py += 7) {
      ctx.beginPath();
      ctx.moveTo(-halfLen, py);
      ctx.lineTo(-halfLen + bellowsW, py);
      ctx.stroke();
    }

    // Front End Bellows (+halfLen)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(halfLen - bellowsW, bellowsY, bellowsW, bellowsH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.4;
    for (let py = bellowsY + 4; py < bellowsY + bellowsH - 2; py += 7) {
      ctx.beginPath();
      ctx.moveTo(halfLen - bellowsW, py);
      ctx.lineTo(halfLen, py);
      ctx.stroke();
    }

    ctx.restore();
  }
}
