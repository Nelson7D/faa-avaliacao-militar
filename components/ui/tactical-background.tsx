'use client';

import React, { useEffect, useRef } from 'react';

interface TacticalBackgroundProps {
  variant?: 'login' | 'app';
  className?: string;
}

export function TacticalBackground({
  variant = 'app',
  className = '',
}: TacticalBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    let pulse = 0;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = variant === 'login' ? height * 0.32 : height * 0.52;

      // 1. Radar Conic Beam (Subtle ambient rotation)
      angle += 0.006;
      pulse = (pulse + 0.015) % (Math.PI * 2);

      const radarRadius = variant === 'login' ? Math.min(width, height) * 0.42 : Math.min(width, height) * 0.38;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Radar Concentric Circles
      const rings = variant === 'login' ? [0.2, 0.4, 0.65, 0.85, 1.0] : [0.25, 0.5, 0.75, 1.0];
      rings.forEach((r, idx) => {
        const ringRadius = radarRadius * r;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = idx === rings.length - 1 
          ? 'rgba(212, 175, 55, 0.22)' 
          : 'rgba(180, 195, 160, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Subtle crosshairs or tick marks
        if (idx === 2 || idx === 3) {
          ctx.beginPath();
          ctx.arc(0, 0, ringRadius + 3, angle, angle + 0.15);
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Rotating Radar Sweep Slice
      const sweepAngle = Math.PI / 4;
      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, radarRadius);
      grad.addColorStop(0, 'rgba(212, 175, 55, 0.12)');
      grad.addColorStop(0.7, 'rgba(117, 134, 82, 0.06)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radarRadius, angle, angle + sweepAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Sweep Leading Edge Line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle + sweepAngle) * radarRadius, Math.sin(angle + sweepAngle) * radarRadius);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Variant 'app': Render 3D Holographic Wireframe Globe/Sphere
      if (variant === 'app') {
        const sphereRadius = radarRadius * 0.72;

        // Longitudes
        for (let i = -3; i <= 3; i++) {
          const xRadius = (sphereRadius / 3.5) * Math.abs(i);
          const xOffset = (sphereRadius / 3.5) * i * Math.cos(angle * 0.4);
          ctx.beginPath();
          ctx.ellipse(xOffset * 0.5, 0, Math.max(2, sphereRadius - Math.abs(xOffset * 0.4)), sphereRadius, angle * 0.2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(180, 205, 170, 0.05)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Latitudes
        for (let j = -2; j <= 2; j++) {
          const yPos = (sphereRadius / 3) * j;
          const latRadius = Math.sqrt(Math.max(0, sphereRadius * sphereRadius - yPos * yPos));
          ctx.beginPath();
          ctx.ellipse(0, yPos, latRadius, latRadius * 0.28, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.07)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Glowing Cyan/White Top Flare
        const flareY = -sphereRadius * 0.95;
        const flareGrad = ctx.createRadialGradient(0, flareY, 0, 0, flareY, 70);
        flareGrad.addColorStop(0, 'rgba(180, 240, 255, 0.45)');
        flareGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.15)');
        flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = flareGrad;
        ctx.beginPath();
        ctx.arc(0, flareY, 70, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [variant]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden select-none -z-10 ${className}`}
      style={{
        background:
          variant === 'login'
            ? 'radial-gradient(circle at 50% 32%, #2F3E28 0%, #202B1B 35%, #10170F 70%, #070B06 100%)'
            : 'radial-gradient(ellipse at 50% 38%, #22301D 0%, #151F13 45%, #0C130A 80%, #060905 100%)',
      }}
    >
      {/* Dynamic Animated Canvas Radar / Sphere */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-90" />

      {/* 3D Wireframe Polygonal Shield (Left Side) */}
      <div className="absolute left-[-40px] md:left-[3%] bottom-[12%] md:bottom-[18%] w-[260px] md:w-[380px] h-[340px] md:h-[480px] opacity-25 md:opacity-35 pointer-events-none">
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none">
          <polygon
            points="150,20 270,70 270,240 150,380 30,240 30,70"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          {/* Wireframe Internal Facets */}
          <line x1="150" y1="20" x2="150" y2="380" stroke="#758652" strokeWidth="1" />
          <line x1="30" y1="70" x2="270" y2="70" stroke="#758652" strokeWidth="0.8" />
          <line x1="30" y1="240" x2="270" y2="240" stroke="#758652" strokeWidth="0.8" />
          <line x1="150" y1="150" x2="30" y2="70" stroke="#D4AF37" strokeWidth="0.8" />
          <line x1="150" y1="150" x2="270" y2="70" stroke="#D4AF37" strokeWidth="0.8" />
          <line x1="150" y1="150" x2="30" y2="240" stroke="#758652" strokeWidth="0.8" />
          <line x1="150" y1="150" x2="270" y2="240" stroke="#758652" strokeWidth="0.8" />
          <line x1="150" y1="150" x2="150" y2="380" stroke="#D4AF37" strokeWidth="1" />
          <circle cx="150" cy="150" r="3" fill="#D4AF37" />
          <circle cx="270" cy="70" r="2.5" fill="#D4AF37" />
          <circle cx="30" cy="70" r="2.5" fill="#D4AF37" />
          <circle cx="150" cy="380" r="3" fill="#D4AF37" />
        </svg>
      </div>

      {/* 3D Wireframe Polygonal Shield (Right Side) */}
      <div className="absolute right-[-40px] md:right-[3%] top-[12%] md:top-[15%] w-[260px] md:w-[380px] h-[340px] md:h-[480px] opacity-25 md:opacity-35 pointer-events-none">
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none">
          <polygon
            points="150,20 270,70 270,240 150,380 30,240 30,70"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          {/* Wireframe Internal Facets */}
          <line x1="150" y1="20" x2="150" y2="380" stroke="#758652" strokeWidth="1" />
          <line x1="30" y1="70" x2="270" y2="70" stroke="#758652" strokeWidth="0.8" />
          <line x1="30" y1="240" x2="270" y2="240" stroke="#758652" strokeWidth="0.8" />
          <line x1="150" y1="150" x2="30" y2="70" stroke="#D4AF37" strokeWidth="0.8" />
          <line x1="150" y1="150" x2="270" y2="70" stroke="#D4AF37" strokeWidth="0.8" />
          <line x1="150" y1="150" x2="30" y2="240" stroke="#758652" strokeWidth="0.8" />
          <line x1="150" y1="150" x2="270" y2="240" stroke="#758652" strokeWidth="0.8" />
          <line x1="150" y1="150" x2="150" y2="380" stroke="#D4AF37" strokeWidth="1" />
          <circle cx="150" cy="150" r="3" fill="#D4AF37" />
          <circle cx="270" cy="70" r="2.5" fill="#D4AF37" />
          <circle cx="30" cy="70" r="2.5" fill="#D4AF37" />
          <circle cx="150" cy="380" r="3" fill="#D4AF37" />
        </svg>
      </div>

      {/* Vignette Overlay for Depth */}
      <div className="absolute inset-0 bg-radial-vignette opacity-50" />
    </div>
  );
}
