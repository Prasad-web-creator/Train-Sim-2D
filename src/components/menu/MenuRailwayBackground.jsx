/**
 * MenuRailwayBackground.jsx
 * Cinematic coastal railway background for the Main Menu:
 * Displays the high-resolution panoramic coastal scenery with the heavy diesel locomotive,
 * subtle atmospheric lighting, vignette, and ambient sun motes particles.
 */

import React, { useRef, useEffect } from 'react';

export function MenuRailwayBackground() {
  const ref_canvas = useRef(null);

  useEffect(() => {
    const canvas = ref_canvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let animFrameId = null;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);

    // Floating sun motes / ambient dust particles
    const particleCount = 28;
    const arr_particles = [];
    for (let i = 0; i < particleCount; i++) {
      arr_particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.35,
        speedX: (Math.random() - 0.2) * 0.4,
        speedY: -(0.2 + Math.random() * 0.4),
        phase: Math.random() * Math.PI * 2,
      });
    }

    function render() {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      // Subtle warm sun glow bloom in upper right
      const sunGrad = ctx.createRadialGradient(
        width * 0.95,
        height * 0.1,
        20,
        width * 0.95,
        height * 0.1,
        width * 0.6
      );
      sunGrad.addColorStop(0, 'rgba(255, 230, 180, 0.18)');
      sunGrad.addColorStop(0.4, 'rgba(255, 200, 120, 0.07)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);

      // Render floating sun motes
      for (const p of arr_particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.phase += 0.02;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const dynamicAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 200, ${dynamicAlpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255, 220, 150, 0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrameId = requestAnimationFrame(render);
    }

    animFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div className="main-menu__background-wrap">
      {/* High-fidelity panoramic coastal background art matching reference */}
      <img
        src="/assets/menu/menu_coastal_bg.jpg"
        alt="Iron Rail Coastal Vista"
        className="main-menu__bg-image"
      />
      {/* Subtle vignette and contrast shading */}
      <div className="main-menu__bg-vignette" />
      {/* Soft floating sun rays / dust motes */}
      <canvas ref={ref_canvas} className="main-menu__bg-canvas" />
    </div>
  );
}

export default MenuRailwayBackground;
