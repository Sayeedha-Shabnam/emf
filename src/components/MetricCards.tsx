/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalculationResults, PolarizationType } from '../types/electromagnetics';
import { ShieldCheck, AlertCircle, Compass, Activity, Gauge, Flame } from 'lucide-react';

interface MetricCardsProps {
  results: CalculationResults;
  polarization: PolarizationType;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ results, polarization }) => {
  const isTE = polarization === 'TE';
  const rCoeff = isTE ? results.rTE : results.rTM;
  const tCoeff = isTE ? results.tTE : results.tTM;

  return (
    <div className="flex flex-col gap-3">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Incident & Reflection Angles */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              Angles (θᵢ / θᵣ)
            </span>
            <span className="text-[10px] font-mono text-slate-500">Law of Refl.</span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-mono font-bold text-sky-300 tabular-nums">
              {results.incidentAngleDeg.toFixed(2)}°
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              θᵣ = {results.reflectionAngleDeg.toFixed(2)}°
            </div>
          </div>
        </div>

        {/* Transmission Angle */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              Transmission Angle (θₜ)
            </span>
            <span className="text-[10px] font-mono text-slate-500">Snell's Law</span>
          </div>
          <div className="mt-2">
            {results.isTIR ? (
              <div className="text-base font-mono font-bold text-rose-400">
                None (TIR)
              </div>
            ) : results.transmissionAngleDeg !== null ? (
              <div className="text-xl font-mono font-bold text-emerald-300 tabular-nums">
                {results.transmissionAngleDeg.toFixed(2)}°
              </div>
            ) : (
              <div className="text-xl font-mono font-bold text-slate-500">N/A</div>
            )}
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
              {results.isTIR
                ? 'Evanescent wave only'
                : `n₁·sin(θᵢ) = n₂·sin(θₜ)`}
            </div>
          </div>
        </div>

        {/* Power Reflectance R */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Reflectance (R)
            </span>
            <span className="text-[10px] font-mono text-amber-500">|r|²</span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-mono font-bold text-amber-300 tabular-nums">
              {results.reflectancePercent.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Power fraction: {results.reflectance.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Power Transmittance T */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Transmittance (T)
            </span>
            <span className="text-[10px] font-mono text-emerald-500">1 - R</span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-mono font-bold text-emerald-300 tabular-nums">
              {results.transmittancePercent.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Power fraction: {results.transmittance.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Detailed Cards: Critical Angle, Brewster Angle, Coefficients */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Critical Angle & TIR Status */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span>Critical Angle (θc)</span>
            {results.criticalAngleDeg !== null ? (
              <span className="text-xs font-mono font-bold text-rose-400">
                {results.criticalAngleDeg.toFixed(2)}°
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-500">No Critical Angle</span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>TIR Status:</span>
              <span
                className={`font-semibold font-mono ${
                  results.isTIR ? 'text-rose-400' : 'text-slate-300'
                }`}
              >
                {results.isTIR ? 'Active (θᵢ > θc)' : results.criticalAngleDeg ? 'Not in TIR (θᵢ ≤ θc)' : 'N/A (n₁ ≤ n₂)'}
              </span>
            </div>
            {results.isTIR && results.penetrationDepthMm !== null && (
              <div className="flex justify-between text-rose-300 font-mono text-[11px] pt-1 border-t border-slate-800">
                <span>Penetration Depth (dp):</span>
                <span>{results.penetrationDepthMm.toFixed(3)} mm</span>
              </div>
            )}
          </div>
        </div>

        {/* Brewster Angle */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span>Brewster Angle (θB)</span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {results.brewsterAngleDeg.toFixed(2)}°
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Formula:</span>
              <span className="font-mono text-slate-300">arctan(n₂ / n₁)</span>
            </div>
            <div className="flex justify-between">
              <span>At θᵢ = θB:</span>
              <span
                className={`font-mono ${
                  results.isNearBrewster ? 'text-emerald-400 font-bold' : 'text-slate-400'
                }`}
              >
                {polarization === 'TM' ? 'R_TM = 0 (Total Transmission)' : 'R_TE ≠ 0 (No effect on TE)'}
              </span>
            </div>
          </div>
        </div>

        {/* Amplitude Coefficients (r and t) */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span>Amplitude Coefficients ({polarization})</span>
            <span className="text-[10px] font-mono text-slate-500">Fresnel Field Ratios</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Reflection (r):</span>
              <span className="text-amber-300 tabular-nums">
                |r| = {rCoeff.magnitude.toFixed(4)}
                {rCoeff.phaseDeg !== 0 ? ` ∠${rCoeff.phaseDeg.toFixed(1)}°` : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Transmission (t):</span>
              <span className="text-emerald-300 tabular-nums">
                |t| = {tCoeff.magnitude.toFixed(4)}
                {tCoeff.phaseDeg !== 0 ? ` ∠${tCoeff.phaseDeg.toFixed(1)}°` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Power Conservation & Wavelength Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/60 rounded-lg border border-slate-800 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Conservation of Energy:</span>
          <span className="text-emerald-400 font-semibold">
            R + T = {(results.reflectance + results.transmittance).toFixed(4)} (100.00%)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>λ₀ = {results.wavelength0Mm.toFixed(2)} mm</span>
          <span className="text-slate-600">|</span>
          <span>λ₁ = {results.wavelength1Mm.toFixed(2)} mm</span>
          <span className="text-slate-600">|</span>
          <span>λ₂ = {results.wavelength2Mm.toFixed(2)} mm</span>
        </div>
      </div>
    </div>
  );
};
