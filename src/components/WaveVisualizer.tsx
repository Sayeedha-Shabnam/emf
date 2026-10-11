/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { CalculationResults, SimulationParams } from '../types/electromagnetics';
import { Eye, EyeOff, Play, Pause, Waves, Sparkles, AlertTriangle } from 'lucide-react';

interface WaveVisualizerProps {
  params: SimulationParams;
  results: CalculationResults;
  onAngleChange: (angle: number) => void;
}

export const WaveVisualizer: React.FC<WaveVisualizerProps> = ({
  params,
  results,
  onAngleChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showWavefronts, setShowWavefronts] = useState<boolean>(true);
  const [showFieldVectors, setShowFieldVectors] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const timeRef = useRef<number>(0);
  const reqAnimRef = useRef<number | null>(null);

  // Drag interaction to change angle
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const midX = rect.width / 2;
    const midY = rect.height / 2;

    // Check if click is in upper-left quadrant (incident ray area)
    if (y < midY && x <= midX) {
      setIsDragging(true);
      updateAngleFromCoords(x, y, midX, midY);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;

    updateAngleFromCoords(x, y, midX, midY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const updateAngleFromCoords = (x: number, y: number, midX: number, midY: number) => {
    const dx = midX - x;
    const dy = midY - y;
    if (dy <= 2) return; // avoid degenerate horizontal
    // Angle to normal (which is vertical): tan(theta) = dx / dy
    const angleRad = Math.atan2(dx, dy);
    let angleDeg = (angleRad * 180) / Math.PI;
    angleDeg = Math.max(0, Math.min(89, Math.round(angleDeg * 10) / 10));
    onAngleChange(angleDeg);
  };

  // Animation Loop & Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying) {
        timeRef.current += dt * 3.5;
      }

      // Handle Canvas DPI
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      const midX = width / 2;
      const midY = height / 2;
      const boundaryY = midY;

      // Medium 1 (Top) Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, boundaryY);

      // Medium 2 (Bottom) Background - density tint based on n2
      const n2Ratio = Math.min(1, Math.max(0, (params.medium2.refractiveIndex - 1) / 3));
      ctx.fillStyle = `rgba(14, 30, 48, ${0.4 + n2Ratio * 0.4})`;
      ctx.fillRect(0, boundaryY, width, height - boundaryY);

      // Subtle engineering grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Dielectric Interface line (Boundary at y = boundaryY)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, boundaryY);
      ctx.lineTo(width, boundaryY);
      ctx.stroke();

      // Normal line (dashed vertical line through midX)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(midX, 20);
      ctx.lineTo(midX, height - 20);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Interface hatch markers on Medium 2 side
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      for (let hx = 20; hx < width; hx += 30) {
        ctx.beginPath();
        ctx.moveTo(hx, boundaryY);
        ctx.lineTo(hx - 8, boundaryY + 10);
        ctx.stroke();
      }

      // Angles in Radians
      const thetaI = (params.incidentAngleDeg * Math.PI) / 180;
      const thetaR = thetaI;
      const rayLength = Math.min(midX, midY) * 1.15;

      // 1. INCIDENT RAY (From Upper Left to Center)
      // Vector: (midX - L*sin(thetaI), midY - L*cos(thetaI)) -> (midX, midY)
      const incStartX = midX - rayLength * Math.sin(thetaI);
      const incStartY = midY - rayLength * Math.cos(thetaI);

      // Draw Incident Wavefront ripples if enabled
      if (showWavefronts) {
        const numWaves = 14;
        const waveSpacing = 28;
        const phaseOffset = (timeRef.current * 20) % waveSpacing;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;

        for (let i = 0; i < numWaves; i++) {
          const distAlong = i * waveSpacing + phaseOffset;
          if (distAlong > rayLength) continue;

          // Point along ray
          const px = incStartX + distAlong * Math.sin(thetaI);
          const py = incStartY + distAlong * Math.cos(thetaI);

          // Wavefront perpendicular to incident ray:
          // ray vector is (sin, cos), normal to it is (cos, -sin)
          const wx = 18 * Math.cos(thetaI);
          const wy = -18 * Math.sin(thetaI);

          ctx.beginPath();
          ctx.moveTo(px - wx, py - wy);
          ctx.lineTo(px + wx, py + wy);
          ctx.stroke();
        }
      }

      // Incident Ray Line
      ctx.strokeStyle = '#38bdf8'; // Sky blue
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(incStartX, incStartY);
      ctx.lineTo(midX, midY);
      ctx.stroke();

      // Arrow on Incident Ray
      drawArrow(ctx, (incStartX + midX) / 2, (incStartY + midY) / 2, Math.sin(thetaI), Math.cos(thetaI), '#38bdf8');

      // 2. REFLECTED RAY (From Center to Upper Right)
      // Direction: (sin(thetaR), -cos(thetaR))
      const reflEndX = midX + rayLength * Math.sin(thetaR);
      const reflEndY = midY - rayLength * Math.cos(thetaR);

      const R = results.reflectance;
      const reflAlpha = Math.max(0.12, Math.min(1.0, R));
      const reflWidth = Math.max(1, 3.5 * Math.sqrt(R));

      // Draw Reflected Wavefronts
      if (showWavefronts && R > 0.01) {
        const numWaves = 14;
        const waveSpacing = 28;
        const phaseOffset = (timeRef.current * 20) % waveSpacing;

        ctx.strokeStyle = `rgba(245, 158, 11, ${reflAlpha * 0.4})`;
        ctx.lineWidth = 1.5;

        for (let i = 0; i < numWaves; i++) {
          const distAlong = i * waveSpacing + phaseOffset;
          if (distAlong > rayLength) continue;

          const px = midX + distAlong * Math.sin(thetaR);
          const py = midY - distAlong * Math.cos(thetaR);

          // perpendicular to reflected ray (sin, -cos) -> (cos, sin)
          const wx = 18 * Math.cos(thetaR);
          const wy = 18 * Math.sin(thetaR);

          ctx.beginPath();
          ctx.moveTo(px - wx, py - wy);
          ctx.lineTo(px + wx, py + wy);
          ctx.stroke();
        }
      }

      // Reflected Ray Line (Amber / Golden Orange)
      ctx.strokeStyle = `rgba(245, 158, 11, ${reflAlpha})`;
      ctx.lineWidth = reflWidth;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(reflEndX, reflEndY);
      ctx.stroke();

      if (R > 0.05) {
        drawArrow(
          ctx,
          (midX + reflEndX) / 2,
          (midY + reflEndY) / 2,
          Math.sin(thetaR),
          -Math.cos(thetaR),
          `rgba(245, 158, 11, ${reflAlpha})`
        );
      }

      // 3. TRANSMITTED RAY OR EVANESCENT WAVE (Medium 2)
      if (!results.isTIR && results.transmissionAngleDeg !== null) {
        // Propagating Refracted Wave
        const thetaT = (results.transmissionAngleDeg * Math.PI) / 180;
        const transEndX = midX + rayLength * Math.sin(thetaT);
        const transEndY = midY + rayLength * Math.cos(thetaT);

        const T = results.transmittance;
        const transAlpha = Math.max(0.12, Math.min(1.0, T));
        const transWidth = Math.max(1, 3.5 * Math.sqrt(T));

        // Transmitted wavefronts (note wavelength scale n2/n1)
        if (showWavefronts && T > 0.01) {
          const waveSpacing = 28 * (params.medium1.refractiveIndex / params.medium2.refractiveIndex);
          const phaseOffset = (timeRef.current * 20 * (params.medium1.refractiveIndex / params.medium2.refractiveIndex)) % waveSpacing;
          const numWaves = Math.floor(rayLength / waveSpacing);

          ctx.strokeStyle = `rgba(16, 185, 129, ${transAlpha * 0.4})`;
          ctx.lineWidth = 1.5;

          for (let i = 0; i < numWaves; i++) {
            const distAlong = i * waveSpacing + phaseOffset;
            if (distAlong > rayLength) continue;

            const px = midX + distAlong * Math.sin(thetaT);
            const py = midY + distAlong * Math.cos(thetaT);

            const wx = 18 * Math.cos(thetaT);
            const wy = -18 * Math.sin(thetaT);

            ctx.beginPath();
            ctx.moveTo(px - wx, py - wy);
            ctx.lineTo(px + wx, py + wy);
            ctx.stroke();
          }
        }

        // Transmitted Ray Line (Emerald Green)
        ctx.strokeStyle = `rgba(16, 185, 129, ${transAlpha})`;
        ctx.lineWidth = transWidth;
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(transEndX, transEndY);
        ctx.stroke();

        if (T > 0.05) {
          drawArrow(
            ctx,
            (midX + transEndX) / 2,
            (midY + transEndY) / 2,
            Math.sin(thetaT),
            Math.cos(thetaT),
            `rgba(16, 185, 129, ${transAlpha})`
          );
        }

        // Transmission Angle Arc
        drawAngleArc(ctx, midX, midY, 65, Math.PI / 2, Math.PI / 2 - thetaT, '#10b981', `θt = ${results.transmissionAngleDeg.toFixed(1)}°`, false);
      } else {
        // TOTAL INTERNAL REFLECTION: EVANESCENT WAVE FIELD
        // Transmitted ray does not propagate into bulk; field decays exponentially e^(-alpha * y)
        // Draw evanescent decay field profile along the interface
        const fieldWidth = Math.min(width * 0.65, 360);
        const depthPixels = 75; // visual penetration depth
        const decayGrad = ctx.createLinearGradient(0, boundaryY, 0, boundaryY + depthPixels);
        decayGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)'); // Vivid red-orange warning/evanescent
        decayGrad.addColorStop(0.3, 'rgba(244, 63, 94, 0.22)');
        decayGrad.addColorStop(0.7, 'rgba(244, 63, 94, 0.08)');
        decayGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');

        ctx.fillStyle = decayGrad;
        ctx.fillRect(midX - 10, boundaryY, fieldWidth, depthPixels * 1.5);

        // Animated evanescent wavefront ripples propagating along x-axis only (surface wave)
        const numEvanescentRipples = 8;
        const xPeriod = 32;
        const xPhase = (timeRef.current * 25) % xPeriod;

        for (let i = 0; i < numEvanescentRipples; i++) {
          const rx = midX + i * xPeriod + xPhase;
          if (rx > width - 30) continue;

          // exponential decay curve along y
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(rx, boundaryY);
          ctx.bezierCurveTo(rx + 5, boundaryY + 25, rx + 15, boundaryY + 50, rx + 20, boundaryY + depthPixels);
          ctx.stroke();
        }

        // Evanescent Wave Marker Label
        ctx.fillStyle = '#f43f5e';
        ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillText('EVANESCENT FIELD (E ∝ e⁻ᵅᶻ)', midX + 30, boundaryY + 28);
        if (results.penetrationDepthMm !== null && isFinite(results.penetrationDepthMm)) {
          ctx.fillStyle = '#fda4af';
          ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.fillText(`Skin Depth dp = ${results.penetrationDepthMm.toFixed(2)} mm (No Real Power Flow)`, midX + 30, boundaryY + 45);
        }
      }

      // 4. ANGLE ARCS
      // Incident angle arc: from -pi/2 (upwards normal) towards incident ray (-pi/2 - thetaI)
      drawAngleArc(
        ctx,
        midX,
        midY,
        50,
        -Math.PI / 2,
        -Math.PI / 2 - thetaI,
        '#38bdf8',
        `θi = ${params.incidentAngleDeg.toFixed(1)}°`,
        true
      );

      // Reflected angle arc: from -pi/2 towards reflected ray (-pi/2 + thetaR)
      drawAngleArc(
        ctx,
        midX,
        midY,
        55,
        -Math.PI / 2,
        -Math.PI / 2 + thetaR,
        '#f59e0b',
        `θr = ${results.reflectionAngleDeg.toFixed(1)}°`,
        false
      );

      // 5. Point of Incidence marker
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(midX, midY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Drag Handle at Incident Ray tip
      ctx.fillStyle = isDragging ? '#38bdf8' : 'rgba(56, 189, 248, 0.9)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(incStartX, incStartY, isDragging ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 6. FIELD VECTORS OVERLAY (E & H directions for TE vs TM)
      if (showFieldVectors) {
        drawFieldVectors(ctx, incStartX, incStartY, thetaI, params.polarization, midX, midY);
      }

      // 7. Brewster Angle Visual Badge (When TM and near Brewster)
      if (results.isNearBrewster && params.polarization === 'TM') {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        const bBadgeX = midX + 35;
        const bBadgeY = midY - 65;
        roundRect(ctx, bBadgeX, bBadgeY, 190, 44, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = '600 11px ui-monospace, monospace';
        ctx.fillText('BREWSTER CONDITION', bBadgeX + 12, bBadgeY + 18);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px sans-serif';
        ctx.fillText('Reflectance R = 0.00% (Vanished)', bBadgeX + 12, bBadgeY + 34);
      }

      ctx.restore();

      reqAnimRef.current = requestAnimationFrame(render);
    };

    reqAnimRef.current = requestAnimationFrame(render);

    return () => {
      if (reqAnimRef.current) {
        cancelAnimationFrame(reqAnimRef.current);
      }
    };
  }, [params, results, isPlaying, showWavefronts, showFieldVectors, isDragging]);

  return (
    <div className="relative flex flex-col w-full h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Overlay Bar: Medium Titles & Quick Stats */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10 text-xs font-mono">
        {/* Medium 1 Info */}
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/70 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
          <span className="font-semibold text-sky-300">Medium 1: {params.medium1.name}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">n₁ = {params.medium1.refractiveIndex.toFixed(3)}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">εᵣ₁ = {params.medium1.permittivity.toFixed(2)}</span>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2">
          {results.isTIR ? (
            <div className="flex items-center gap-1.5 bg-rose-950/80 text-rose-300 border border-rose-700/80 px-2.5 py-1 rounded-md text-xs font-semibold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>TOTAL INTERNAL REFLECTION (TIR)</span>
            </div>
          ) : results.isNearBrewster ? (
            <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 px-2.5 py-1 rounded-md text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AT BREWSTER ANGLE (R = 0%)</span>
            </div>
          ) : (
            <div className="bg-slate-900/80 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-md text-xs">
              <span>Propagating Refraction</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Overlay Bar: Medium 2 Info */}
      <div className="absolute bottom-3 left-4 pointer-events-none z-10 text-xs font-mono">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/70 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-emerald-300">Medium 2: {params.medium2.name}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">n₂ = {params.medium2.refractiveIndex.toFixed(3)}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">εᵣ₂ = {params.medium2.permittivity.toFixed(2)}</span>
        </div>
      </div>

      {/* Interactive Controls Overlay at Bottom-Right */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 z-10 text-xs">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause Wave Animation' : 'Play Wave Animation'}
          className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <div className="w-px h-4 bg-slate-700" />

        <button
          onClick={() => setShowWavefronts(!showWavefronts)}
          title="Toggle Wavefront Ripples"
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            showWavefronts ? 'bg-sky-950 text-sky-300 border border-sky-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Waves className="w-3.5 h-3.5" />
          <span>Wavefronts</span>
        </button>

        <button
          onClick={() => setShowFieldVectors(!showFieldVectors)}
          title="Toggle E and H Field Polarization Vectors"
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            showFieldVectors ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {showFieldVectors ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>E & H Vectors</span>
        </button>
      </div>

      {/* Main High-Performance Canvas */}
      <div ref={containerRef} className="w-full h-full min-h-[380px] flex-1 cursor-crosshair relative">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
        />

        {/* Tip Badge */}
        <div className="absolute top-12 left-4 text-[11px] text-slate-500 font-mono pointer-events-none select-none">
          Click & drag incident ray to adjust θi
        </div>
      </div>
    </div>
  );
};

// Helper to draw clean directional arrows
function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dirX: number,
  dirY: number,
  color: string
) {
  const headLen = 10;
  const angle = Math.atan2(dirY, dirX);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + headLen * Math.cos(angle), y + headLen * Math.sin(angle));
  ctx.lineTo(x + headLen * Math.cos(angle - (Math.PI * 5) / 6), y + headLen * Math.sin(angle - (Math.PI * 5) / 6));
  ctx.lineTo(x + headLen * Math.cos(angle + (Math.PI * 5) / 6), y + headLen * Math.sin(angle + (Math.PI * 5) / 6));
  ctx.closePath();
  ctx.fill();
}

// Helper to draw angle arcs with labels
function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  color: string,
  label: string,
  counterClockwise: boolean
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle, counterClockwise);
  ctx.stroke();

  // Label position
  const midAngle = (startAngle + endAngle) / 2;
  const lx = cx + (radius + 16) * Math.cos(midAngle);
  const ly = cy + (radius + 16) * Math.sin(midAngle);

  ctx.fillStyle = color;
  ctx.font = '500 11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, lx, ly);
}

// Helper to draw polarization field vectors (E and H)
function drawFieldVectors(
  ctx: CanvasRenderingContext2D,
  rayStartX: number,
  rayStartY: number,
  thetaI: number,
  polarization: 'TE' | 'TM',
  midX: number,
  midY: number
) {
  const sampleX = rayStartX * 0.45 + midX * 0.55;
  const sampleY = rayStartY * 0.45 + midY * 0.55;

  ctx.save();
  ctx.translate(sampleX, sampleY);

  if (polarization === 'TE') {
    // TE Mode (Perpendicular / s-pol):
    // E-field is perpendicular to plane of incidence (out-of-page circle with dot)
    // H-field is in the plane of incidence (perpendicular to k-ray)
    
    // E vector (Out-of-page icon: Circle with center dot)
    ctx.strokeStyle = '#f43f5e';
    ctx.fillStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-22, -12, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-22, -12, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '600 10px monospace';
    ctx.fillText('E ⊙ (TE)', -10, -9);

    // H vector (In plane, perpendicular to ray)
    const perpAngle = thetaI - Math.PI / 2;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(24 * Math.cos(perpAngle), 24 * Math.sin(perpAngle));
    ctx.stroke();
    drawArrow(ctx, 24 * Math.cos(perpAngle), 24 * Math.sin(perpAngle), Math.cos(perpAngle), Math.sin(perpAngle), '#a855f7');
    ctx.fillStyle = '#c084fc';
    ctx.fillText('H', 24 * Math.cos(perpAngle) + 6, 24 * Math.sin(perpAngle));

  } else {
    // TM Mode (Parallel / p-pol):
    // H-field is perpendicular to plane of incidence (out-of-page circle with dot)
    // E-field is in the plane of incidence
    
    // H vector (Out-of-page)
    ctx.strokeStyle = '#a855f7';
    ctx.fillStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-22, -12, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-22, -12, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '600 10px monospace';
    ctx.fillText('H ⊙ (TM)', -10, -9);

    // E vector (In plane, perpendicular to ray)
    const perpAngle = thetaI - Math.PI / 2;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(24 * Math.cos(perpAngle), 24 * Math.sin(perpAngle));
    ctx.stroke();
    drawArrow(ctx, 24 * Math.cos(perpAngle), 24 * Math.sin(perpAngle), Math.cos(perpAngle), Math.sin(perpAngle), '#f43f5e');
    ctx.fillStyle = '#fb7185';
    ctx.fillText('E', 24 * Math.cos(perpAngle) + 6, 24 * Math.sin(perpAngle));
  }

  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
