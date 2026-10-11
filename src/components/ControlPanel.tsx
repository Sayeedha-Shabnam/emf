/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PolarizationType } from '../types/electromagnetics';
import { PRESET_SCENARIOS, STANDARD_MATERIALS } from '../utils/materials';
import { Sliders, Radio, Compass, Zap, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
  incidentAngleDeg: number;
  polarization: PolarizationType;
  frequencyGHz: number;
  brewsterAngleDeg: number;
  criticalAngleDeg: number | null;
  onAngleChange: (angle: number) => void;
  onPolarizationChange: (pol: PolarizationType) => void;
  onFrequencyChange: (freq: number) => void;
  onSelectPreset: (presetId: string) => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  incidentAngleDeg,
  polarization,
  frequencyGHz,
  brewsterAngleDeg,
  criticalAngleDeg,
  onAngleChange,
  onPolarizationChange,
  onFrequencyChange,
  onSelectPreset,
  onReset,
}) => {
  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-slate-200">
          <Sliders className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold tracking-wide">Wave Simulation Parameters</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            title="Reset to default parameters"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-md border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Preset Demonstration Scenarios (ECE Benchmarks)</span>
        </label>
        <select
          onChange={(e) => {
            if (e.target.value) onSelectPreset(e.target.value);
          }}
          defaultValue=""
          className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="" disabled>
            Choose an interactive demonstration...
          </option>
          {PRESET_SCENARIOS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {p.subtitle}
            </option>
          ))}
        </select>
      </div>

      {/* Incident Angle Slider & Quick Snap */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Incident Angle (θᵢ)</span>
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              max="89.9"
              step="0.1"
              value={Number(incidentAngleDeg.toFixed(1))}
              onChange={(e) => onAngleChange(parseFloat(e.target.value) || 0)}
              className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-right font-mono text-xs text-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <span className="text-xs font-mono text-slate-400">deg (°)</span>
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max="89.9"
          step="0.1"
          value={incidentAngleDeg}
          onChange={(e) => onAngleChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />

        {/* Fine Stepper & Quick Snap Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-1 pt-1 text-[11px] font-mono">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAngleChange(Math.max(0, incidentAngleDeg - 1))}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              title="-1 Degree"
            >
              -1°
            </button>
            <button
              onClick={() => onAngleChange(Math.max(0, incidentAngleDeg - 0.1))}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              title="-0.1 Degree"
            >
              -0.1°
            </button>
            <button
              onClick={() => onAngleChange(Math.min(89.9, incidentAngleDeg + 0.1))}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              title="+0.1 Degree"
            >
              +0.1°
            </button>
            <button
              onClick={() => onAngleChange(Math.min(89.9, incidentAngleDeg + 1))}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              title="+1 Degree"
            >
              +1°
            </button>
          </div>

          {/* Snap Targets */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAngleChange(0)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              0° (Normal)
            </button>

            {brewsterAngleDeg > 0 && brewsterAngleDeg < 90 && (
              <button
                onClick={() => onAngleChange(Number(brewsterAngleDeg.toFixed(2)))}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  Math.abs(incidentAngleDeg - brewsterAngleDeg) < 0.2
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700 font-semibold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title={`Snap to Brewster Angle θB = ${brewsterAngleDeg.toFixed(2)}°`}
              >
                θB ({brewsterAngleDeg.toFixed(1)}°)
              </button>
            )}

            {criticalAngleDeg !== null && (
              <button
                onClick={() => onAngleChange(Number(criticalAngleDeg.toFixed(2)))}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  Math.abs(incidentAngleDeg - criticalAngleDeg) < 0.2
                    ? 'bg-rose-950 text-rose-300 border-rose-700 font-semibold'
                    : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-rose-900/60'
                }`}
                title={`Snap to Critical Angle θc = ${criticalAngleDeg.toFixed(2)}°`}
              >
                θc ({criticalAngleDeg.toFixed(1)}°)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Polarization Mode Selection */}
      <div className="flex flex-col gap-1.5 pt-1">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-indigo-400" />
          <span>Wave Polarization Mode</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* TE Button */}
          <button
            onClick={() => onPolarizationChange('TE')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              polarization === 'TE'
                ? 'bg-indigo-950/70 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-indigo-300">TE Polarization</span>
              <span className="text-[10px] font-mono uppercase bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded">
                s-pol (⟂)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Electric field <strong className="text-slate-300">E ⊥</strong> plane of incidence (perpendicular).
            </p>
          </button>

          {/* TM Button */}
          <button
            onClick={() => onPolarizationChange('TM')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              polarization === 'TM'
                ? 'bg-sky-950/70 border-sky-500/80 text-white shadow-sm ring-1 ring-sky-500/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-sky-300">TM Polarization</span>
              <span className="text-[10px] font-mono uppercase bg-sky-900/60 text-sky-300 px-1.5 py-0.5 rounded">
                p-pol (∥)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Electric field <strong className="text-slate-300">E ∥</strong> plane of incidence (exhibits Brewster zero).
            </p>
          </button>
        </div>
      </div>

      {/* Frequency Input in GHz */}
      <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
        <div>
          <label className="text-xs font-medium text-slate-300 block">
            Operating Frequency (f)
          </label>
          <span className="text-[11px] text-slate-500">
            Determines λ₀ and evanescent decay length
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0.1"
            max="1000"
            step="0.5"
            value={frequencyGHz}
            onChange={(e) => onFrequencyChange(Math.max(0.1, parseFloat(e.target.value) || 1))}
            className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <span className="text-xs font-mono text-slate-400">GHz</span>
        </div>
      </div>
    </div>
  );
};
