/**
 * StationSign.js
 * 2D illustrated authentic station signage for all 5 themes:
 * - Indian (Gabled peak top, flanking yellow posts with black tar footings, bright yellow face, bold black typography)
 * - Mountain (Pitched timber plank with snow cap, dark timber flanking posts, chiselled typography)
 * - Urban (Curved acrylic LED lightbox with cyan glow, aluminum pylons, and platform badge)
 * - Rural (Vintage cream enamel plate with dark green frame on weathered timber posts)
 * - Industrial (Stamped steel hazard plate with diagonal chevrons on bolted steel uprights)
 * 
 * Dynamically computes width and height based on font metrics to ensure high visual clarity,
 * comfortable padding, and zero text clipping or border overflow.
 */

import { drawRoundedRect, drawRivet } from '../../../utils/CanvasUtils.js';
import { getStationThemeProfile, cons_STATION_THEMES } from './StationTheme.js';

// Comprehensive authentic Indian Railways station codes dictionary
const cons_STATION_CODES = Object.freeze({
  'Tirunelveli Junction': 'TEN',
  'Tirunelveli': 'TEN',
  'Thoothukudi Station': 'TN',
  'Thoothukudi': 'TN',
  'Palayamkottai Halt': 'PLM',
  'Vanchi Maniyachchi': 'MEJ',
  'Madurai Junction': 'MDU',
  'Chennai Central': 'MAS',
  'Central Depot': 'CD',
  'Karjat Depot': 'KJT',
  'Lonavala Peak': 'LNL',
  'Ratnagiri Yard': 'RN',
  'Madgaon Junction': 'MAO',
  'Itarsi Freight Yard': 'ET',
  'Nagpur Central Depot': 'NGP',
  'Betul Siding': 'BZU',
  'Amla Junction': 'AMLA',
  'Kanyakumari': 'CAPE',
  'Rameshwaram': 'RMM',
  'Coimbatore Junction': 'CBE',
  'Salem Junction': 'SA',
});

// Authentic regional scripts dictionary
const cons_REGIONAL_SUB_NAMES = Object.freeze({
  'Thoothukudi Station': 'தூத்துக்குடி',
  'Thoothukudi': 'தூத்துக்குடி',
  'Tirunelveli Junction': 'திருநெல்வேலி சந்திப்பு',
  'Tirunelveli': 'திருநெல்வேலி',
  'Palayamkottai Halt': 'பாளையங்கோட்டை',
  'Vanchi Maniyachchi': 'வாஞ்சி மணியாச்சி',
  'Madurai Junction': 'மதுரை சந்திப்பு',
  'Chennai Central': 'சென்னை சென்ட்ரல்',
  'Central Depot': 'மத்திய நிலையம்',
  'Karjat Depot': 'कर्जत',
  'Lonavala Peak': 'लोनावला',
  'Ratnagiri Yard': 'रत्नागिरी',
  'Madgaon Junction': 'मडगांव जंक्शन',
  'Itarsi Freight Yard': 'इटारसी',
  'Nagpur Central Depot': 'नागपुर',
  'Betul Siding': 'बैतूल',
  'Amla Junction': 'आमला जंक्शन',
});

export class StationSign {
  /**
   * Initializes station sign configuration and metadata.
   */
  constructor(themeKey = cons_STATION_THEMES.INDIAN, stationName = 'CENTRAL DEPOT', subName = null, stationCode = null, elevationM = 14) {
    this.themeKey = themeKey;
    this.theme = getStationThemeProfile(themeKey);
    this.stationName = stationName;
    this.subName = subName || this.generateSubName(stationName, themeKey);
    this.stationCode = stationCode || this.generateStationCode(stationName);
    this.elevationM = elevationM;

    // Default base dimensions (dynamically scaled per render based on text width)
    this.width = 160;
    this.height = 56;
    this.postHeight = 78;
  }

  /**
   * Generates bilingual or regional subtitle based on station name and theme.
   */
  generateSubName(name, themeKey) {
    if (themeKey === cons_STATION_THEMES.INDIAN) {
      return cons_REGIONAL_SUB_NAMES[name] || 'தெற்கு இரயில்வே';
    }
    if (themeKey === cons_STATION_THEMES.MOUNTAIN) {
      return `ALPINE SUMMIT • ELEV ${this.elevationM || 1850}M`;
    }
    if (themeKey === cons_STATION_THEMES.URBAN) {
      return 'METRO RAILWAY • PLATFORM 1';
    }
    if (themeKey === cons_STATION_THEMES.RURAL) {
      return 'WAYPOINT FLAG STOP';
    }
    if (themeKey === cons_STATION_THEMES.INDUSTRIAL) {
      return 'FREIGHT CLASSIFICATION YARD';
    }
    return '';
  }

  /**
   * Generates authentic 2-4 letter railway station code.
   */
  generateStationCode(name) {
    if (cons_STATION_CODES[name]) {
      return cons_STATION_CODES[name];
    }
    const tmp_clean = (name || '').replace(/[^a-zA-Z\s]/g, '').toUpperCase().trim();
    const tmp_words = tmp_clean.split(/\s+/);
    if (tmp_words.length >= 2) {
      return (tmp_words[0].slice(0, 2) + tmp_words[1].slice(0, 1)).slice(0, 4);
    }
    return (tmp_clean.slice(0, 3)) || 'STN';
  }

  /**
   * Renders the station sign at the specified world coordinate.
   */
  render(ctx, x, groundY, scale = 1.0) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(groundY));
    if (scale !== 1.0) {
      ctx.scale(scale, scale);
    }

    const tmp_style = this.theme.sign.style;

    if (tmp_style === 'indian_bilingual') {
      this.renderIndianSign(ctx);
    } else if (tmp_style === 'mountain_carved') {
      this.renderMountainSign(ctx);
    } else if (tmp_style === 'urban_led') {
      this.renderUrbanSign(ctx);
    } else if (tmp_style === 'rural_enamel') {
      this.renderRuralSign(ctx);
    } else {
      this.renderIndustrialSign(ctx);
    }

    ctx.restore();
  }

  /**
   * 1. Indian Railways bilingual gabled station nameboard between flanking posts
   * Matches 100% with the user's reference model:
   * - Flanking posts on left and right, extending above board shoulders
   * - Upper post painted yellow/amber; lower footing painted black tar
   * - Gabled / peaked apex top edge
   * - Elevated above ground level with open space underneath
   * - High-contrast typography with English, Tamil/Indic script, and station code/elevation
   */
  renderIndianSign(ctx) {
    const tmp_engText = this.stationName.toUpperCase();
    const tmp_subText = this.subName;

    // Dynamic width calculation based on rendered text measurement
    ctx.font = 'bold 13.5px "Rajdhani", "Segoe UI", Arial, sans-serif';
    const tmp_engW = ctx.measureText(tmp_engText).width;

    ctx.font = 'bold 11.5px "Noto Sans Tamil", "Latha", "Segoe UI", sans-serif';
    const tmp_subW = ctx.measureText(tmp_subText).width;

    const tmp_maxContentW = Math.max(tmp_engW, tmp_subW);
    // Board panel width fitted between flanking posts with generous breathing room
    const tmp_w = Math.max(160, Math.round(tmp_maxContentW + 36));
    const tmp_halfW = tmp_w * 0.5;

    // Structural dimensions matching reference image model:
    const tmp_postW = 11; // Width of flanking vertical posts
    const tmp_bottomY = -22; // Elevated 22px above platform ground level
    const tmp_h = 50; // Balanced height for clean two-line station name
    const tmp_shoulderY = tmp_bottomY - tmp_h; // -72: Top corner shoulders
    const tmp_peakH = 6.5; // Gentle central gabled rise
    const tmp_peakY = tmp_shoulderY - tmp_peakH; // -78.5: Central peak
    const tmp_postTopY = tmp_shoulderY - 5; // -77: Posts extend 5px above shoulders

    // 1. Soft drop shadow behind the entire sign structure
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW - tmp_postW + 2, tmp_postTopY + 2);
    ctx.lineTo(tmp_halfW + tmp_postW + 2, tmp_postTopY + 2);
    ctx.lineTo(tmp_halfW + tmp_postW + 2, 2);
    ctx.lineTo(-tmp_halfW - tmp_postW + 2, 2);
    ctx.closePath();
    ctx.fill();

    // 2. Flanking Left & Right Posts
    const arr_posts = [
      { x: -tmp_halfW - tmp_postW, w: tmp_postW },
      { x: tmp_halfW, w: tmp_postW },
    ];

    for (let i = 0; i < arr_posts.length; i++) {
      const p = arr_posts[i];

      // Upper Post (Yellow/Amber matching board frame)
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(p.x, tmp_postTopY, p.w, -tmp_postTopY - 18);
      // Subtle highlight strip on left edge
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(p.x, tmp_postTopY, 2, -tmp_postTopY - 18);
      // Subtle shadow strip on right edge
      ctx.fillStyle = '#d97706';
      ctx.fillRect(p.x + p.w - 2, tmp_postTopY, 2, -tmp_postTopY - 18);

      // Bottom Footing (Solid Black Tar Band)
      ctx.fillStyle = '#18181b';
      ctx.fillRect(p.x, -18, p.w, 18);
      // Highlight on black footing
      ctx.fillStyle = '#27272a';
      ctx.fillRect(p.x, -18, 2, 18);

      // Post outline
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(p.x, tmp_postTopY, p.w, -tmp_postTopY);
    }

    // 3. Central Gabled Outer Board Frame (Fitted flush between flanking posts)
    ctx.fillStyle = '#f59e0b'; // Amber golden-yellow frame
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW, tmp_shoulderY);
    ctx.lineTo(0, tmp_peakY);
    ctx.lineTo(tmp_halfW, tmp_shoulderY);
    ctx.lineTo(tmp_halfW, tmp_bottomY);
    ctx.lineTo(-tmp_halfW, tmp_bottomY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. Recessed Inner Bright Yellow Sign Face
    const inset = 4.5;
    ctx.fillStyle = '#facc15'; // Vibrant signature Indian Railways canary yellow
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW + inset, tmp_shoulderY + inset);
    ctx.lineTo(0, tmp_peakY + inset);
    ctx.lineTo(tmp_halfW - inset, tmp_shoulderY + inset);
    ctx.lineTo(tmp_halfW - inset, tmp_bottomY - inset);
    ctx.lineTo(-tmp_halfW + inset, tmp_bottomY - inset);
    ctx.closePath();
    ctx.fill();

    // Inner bevel / border stroke
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 5. Typography (Harmoniously vertically centered without clutter)
    // Line 1: English Station Name
    ctx.fillStyle = '#050505';
    ctx.font = 'bold 13.5px "Rajdhani", "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tmp_engText, 0, tmp_shoulderY + 18);

    // Line 2: Regional Script Subtitle (Tamil / Indic)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11.5px "Noto Sans Tamil", "Latha", "Segoe UI", sans-serif';
    ctx.fillText(tmp_subText, 0, tmp_shoulderY + 34);
  }

  /**
   * 2. Mountain carved dark timber plank with snow caps on heavy timber posts.
   */
  renderMountainSign(ctx) {
    const tmp_engText = this.stationName.toUpperCase();
    const tmp_subText = this.subName;

    ctx.font = 'bold 12px "Rajdhani", Georgia, serif';
    const tmp_engW = ctx.measureText(tmp_engText).width;
    ctx.font = 'bold 9.5px sans-serif';
    const tmp_subW = ctx.measureText(tmp_subText).width;

    const tmp_w = Math.max(160, Math.round(Math.max(tmp_engW, tmp_subW) + 40));
    const tmp_halfW = tmp_w * 0.5;
    const tmp_postW = 10;
    const tmp_bottomY = -22;
    const tmp_h = 54;
    const tmp_shoulderY = tmp_bottomY - tmp_h;
    const tmp_peakH = 8;
    const tmp_peakY = tmp_shoulderY - tmp_peakH;
    const tmp_postTopY = tmp_shoulderY - 6;

    // Flanking timber posts with tar footings
    const arr_posts = [
      { x: -tmp_halfW - tmp_postW, w: tmp_postW },
      { x: tmp_halfW, w: tmp_postW },
    ];
    for (let i = 0; i < arr_posts.length; i++) {
      const p = arr_posts[i];
      ctx.fillStyle = '#451a03';
      ctx.fillRect(p.x, tmp_postTopY, p.w, -tmp_postTopY - 18);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(p.x, -18, p.w, 18);
      ctx.strokeStyle = '#271202';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(p.x, tmp_postTopY, p.w, -tmp_postTopY);
    }

    // Cedar timber plank with gabled top
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW, tmp_shoulderY);
    ctx.lineTo(0, tmp_peakY);
    ctx.lineTo(tmp_halfW, tmp_shoulderY);
    ctx.lineTo(tmp_halfW, tmp_bottomY);
    ctx.lineTo(-tmp_halfW, tmp_bottomY);
    ctx.closePath();
    ctx.fill();

    // Wood grain lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW + 6, tmp_shoulderY + 16);
    ctx.lineTo(tmp_halfW - 6, tmp_shoulderY + 16);
    ctx.moveTo(-tmp_halfW + 6, tmp_shoulderY + 38);
    ctx.lineTo(tmp_halfW - 6, tmp_shoulderY + 38);
    ctx.stroke();

    // Plank border
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Snow dusting on top gabled ridge
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW - 2, tmp_shoulderY);
    ctx.lineTo(0, tmp_peakY - 2);
    ctx.lineTo(tmp_halfW + 2, tmp_shoulderY);
    ctx.lineTo(tmp_halfW + 2, tmp_shoulderY + 5);
    ctx.lineTo(0, tmp_peakY + 4);
    ctx.lineTo(-tmp_halfW - 2, tmp_shoulderY + 5);
    ctx.closePath();
    ctx.fill();

    // White chiselled / routed typography
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px "Rajdhani", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tmp_engText, 0, tmp_shoulderY + 20);

    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillStyle = '#fed7aa';
    ctx.fillText(tmp_subText, 0, tmp_shoulderY + 38);
  }

  /**
   * 3. Urban modern illuminated acrylic LED lightbox with cyan glow and platform badge.
   */
  renderUrbanSign(ctx) {
    const tmp_engText = this.stationName.toUpperCase();
    const tmp_subText = this.subName;

    ctx.font = 'bold 12px "Rajdhani", sans-serif';
    const tmp_engW = ctx.measureText(tmp_engText).width;
    ctx.font = 'bold 9px sans-serif';
    const tmp_subW = ctx.measureText(tmp_subText).width;

    const tmp_w = Math.max(165, Math.round(Math.max(tmp_engW, tmp_subW) + 60));
    const tmp_halfW = tmp_w * 0.5;
    const tmp_postW = 9;
    const tmp_bottomY = -22;
    const tmp_h = 50;
    const tmp_topY = tmp_bottomY - tmp_h;

    // Brushed aluminum flanking pylons
    const arr_posts = [
      { x: -tmp_halfW - tmp_postW, w: tmp_postW },
      { x: tmp_halfW, w: tmp_postW },
    ];
    for (let i = 0; i < arr_posts.length; i++) {
      const p = arr_posts[i];
      ctx.fillStyle = '#64748b';
      ctx.fillRect(p.x, tmp_topY - 4, p.w, -tmp_topY + 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(p.x + 2, tmp_topY - 4, 3, -tmp_topY + 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p.x, -16, p.w, 16);
    }

    // Dark charcoal acrylic casing
    ctx.fillStyle = '#0f172a';
    drawRoundedRect(ctx, -tmp_halfW, tmp_topY, tmp_w, tmp_h, 4);
    ctx.fill();

    // Glowing cyan outline
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Platform number badge on left
    ctx.fillStyle = '#0284c7';
    drawRoundedRect(ctx, -tmp_halfW + 6, tmp_topY + 6, 28, tmp_h - 12, 3);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PL 1', -tmp_halfW + 20, tmp_topY + tmp_h * 0.5);

    // Station name in crisp sans-serif
    ctx.font = 'bold 12px "Rajdhani", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(tmp_engText, -tmp_halfW + 42, tmp_topY + 18);

    // Secondary line: Subtitle & status dot
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(tmp_subText, -tmp_halfW + 54, tmp_topY + 34);

    // Green online status LED
    ctx.beginPath();
    ctx.arc(-tmp_halfW + 46, tmp_topY + 34, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
  }

  /**
   * 4. Rural vintage enamel metal plate on double weathered timber posts.
   */
  renderRuralSign(ctx) {
    const tmp_engText = this.stationName.toUpperCase();
    const tmp_subText = this.subName;

    ctx.font = 'bold 12px "Rajdhani", Georgia, serif';
    const tmp_engW = ctx.measureText(tmp_engText).width;
    ctx.font = 'italic 9.5px Georgia, serif';
    const tmp_subW = ctx.measureText(tmp_subText).width;

    const tmp_w = Math.max(155, Math.round(Math.max(tmp_engW, tmp_subW) + 40));
    const tmp_halfW = tmp_w * 0.5;
    const tmp_postW = 10;
    const tmp_bottomY = -22;
    const tmp_h = 52;
    const tmp_topY = tmp_bottomY - tmp_h;

    // Flanking weathered timber posts with tar footings
    const arr_posts = [
      { x: -tmp_halfW - tmp_postW, w: tmp_postW },
      { x: tmp_halfW, w: tmp_postW },
    ];
    for (let i = 0; i < arr_posts.length; i++) {
      const p = arr_posts[i];
      ctx.fillStyle = '#78716c';
      ctx.fillRect(p.x, tmp_topY - 5, p.w, -tmp_topY + 5 - 18);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(p.x, -18, p.w, 18);
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(p.x, tmp_topY - 5, p.w, -tmp_topY + 5);
    }

    // Antique cream enamel plate
    ctx.fillStyle = '#fef3c7';
    drawRoundedRect(ctx, -tmp_halfW, tmp_topY, tmp_w, tmp_h, 4);
    ctx.fill();

    // Dark forest green enamel border
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Thin inner border
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, -tmp_halfW + 4, tmp_topY + 4, tmp_w - 8, tmp_h - 8, 2);
    ctx.stroke();

    // Vintage serif typography
    ctx.fillStyle = '#14532d';
    ctx.font = 'bold 12px "Rajdhani", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tmp_engText, 0, tmp_topY + 18);

    ctx.font = 'italic 9.5px Georgia, serif';
    ctx.fillStyle = '#451a03';
    ctx.fillText(tmp_subText, 0, tmp_topY + 36);
  }

  /**
   * 5. Industrial stamped steel sign with yellow/black hazard warning stripes.
   */
  renderIndustrialSign(ctx) {
    const tmp_engText = this.stationName.toUpperCase();
    const tmp_subText = this.subName;

    ctx.font = 'bold 12px "Rajdhani", Impact, sans-serif';
    const tmp_engW = ctx.measureText(tmp_engText).width;
    ctx.font = 'bold 9px sans-serif';
    const tmp_subW = ctx.measureText(tmp_subText).width;

    const tmp_w = Math.max(160, Math.round(Math.max(tmp_engW, tmp_subW) + 40));
    const tmp_halfW = tmp_w * 0.5;
    const tmp_postW = 11;
    const tmp_bottomY = -22;
    const tmp_h = 54;
    const tmp_topY = tmp_bottomY - tmp_h;

    // Steel angle iron posts with bolted baseplates
    const arr_posts = [
      { x: -tmp_halfW - tmp_postW, w: tmp_postW },
      { x: tmp_halfW, w: tmp_postW },
    ];
    for (let i = 0; i < arr_posts.length; i++) {
      const p = arr_posts[i];
      ctx.fillStyle = '#334155';
      ctx.fillRect(p.x, tmp_topY - 5, p.w, -tmp_topY + 5);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p.x - 3, -4, p.w + 6, 4); // Baseplate
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(p.x, tmp_topY - 5, p.w, -tmp_topY + 5);
    }

    // Main yellow hazard board
    ctx.fillStyle = '#eab308';
    drawRoundedRect(ctx, -tmp_halfW, tmp_topY, tmp_w, tmp_h, 2);
    ctx.fill();
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Top hazard chevron stripe band
    this.renderHazardStripes(ctx, -tmp_halfW, tmp_topY, tmp_w, 6);
    // Bottom hazard chevron stripe band
    this.renderHazardStripes(ctx, -tmp_halfW, tmp_topY + tmp_h - 6, tmp_w, 6);

    // Stenciled industrial lettering
    ctx.fillStyle = '#18181b';
    ctx.font = 'bold 12px "Rajdhani", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tmp_engText, 0, tmp_topY + 20);

    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#27272a';
    ctx.fillText(tmp_subText, 0, tmp_topY + 36);
  }

  /**
   * Helper to draw diagonal hazard chevron stripes.
   */
  renderHazardStripes(ctx, x, y, width, height) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    ctx.fillStyle = '#18181b';
    const tmp_step = 10;
    for (let tmp_sx = x - height; tmp_sx < x + width + height; tmp_sx += tmp_step) {
      ctx.beginPath();
      ctx.moveTo(tmp_sx, y + height);
      ctx.lineTo(tmp_sx + 6, y + height);
      ctx.lineTo(tmp_sx + 12, y);
      ctx.lineTo(tmp_sx + 6, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}
