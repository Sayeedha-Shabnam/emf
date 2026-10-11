/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { STANDARD_MATERIALS } from '../utils/materials';
import { ArrowLeftRight, Layers, SlidersHorizontal, Info } from 'lucide-react';

interface MaterialSelectorProps {
  medium1: {
    name: string;
    permittivity: number;
    refractiveIndex: number;
  };
  medium2: {
    name: string;
    permittivity: number;
    refractiveIndex: number;
  };
  onMedium1Change: (m: { name: string; permittivity: number; refractiveIndex: number }) => void;
  onMedium2Change: (m: { name: string; permittivity: number; refractiveIndex: number }) => void;
  onSwapMedia: () => void;
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  medium1,
  medium2,
  onMedium1Change,
  onMedium2Change,
  onSwapMedia,
}) => {
  const [m1SelectValue, setM1SelectValue] = useState<string>(
    STANDARD_MATERIALS.find((m) => Math.abs(m.refractiveIndex - medium1.refractiveIndex) < 0.005)?.id || 'custom'
  );
  const [m2SelectValue, setM2SelectValue] = useState<string>(
    STANDARD_MATERIALS.find((m) => Math.abs(m.refractiveIndex - medium2.refractiveIndex) < 0.005)?.id || 'custom'
  );

  const handleSelect1 = (id: string) => {
    setM1SelectValue(id);
    if (id === 'custom') return;
    const mat = STANDARD_MATERIALS.find((m) => m.id === id);
    if (mat) {
      onMedium1Change({
        name: mat.name,
        permittivity: mat.permittivity,
        refractiveIndex: mat.refractiveIndex,
      });
    }
  };

  const handleSelect2 = (id: string) => {
    setM2SelectValue(id);
    if (id === 'custom') return;
    const mat = STANDARD_MATERIALS.find((m) => m.id === id);
    if (mat) {
      onMedium2Change({
        name: mat.name,
        permittivity: mat.permittivity,
        refractiveIndex: mat.refractiveIndex,
      });
    }
  };

  const handlePermittivity1 = (val: number) => {
    if (isNaN(val) || val < 1) return;
    setM1SelectValue('custom');
    onMedium1Change({
      name: 'Custom Dielectric 1',
      permittivity: val,
      refractiveIndex: Math.sqrt(val),
    });
  };

  const handleIndex1 = (val: number) => {
    if (isNaN(val) || val < 1) return;
    setM1SelectValue('custom');
    onMedium1Change({
      name: 'Custom Dielectric 1',
      permittivity: val * val,
      refractiveIndex: val,
    });
  };

  const handlePermittivity2 = (val: number) => {
    if (isNaN(val) || val < 1) return;
    setM2SelectValue('custom');
    onMedium2Change({
      name: 'Custom Dielectric 2',
      permittivity: val,
      refractiveIndex: Math.sqrt(val),
    });
  };

  const handleIndex2 = (val: number) => {
    if (isNaN(val) || val < 1) return;
    setM2SelectValue('custom');
    onMedium2Change({
      name: 'Custom Dielectric 2',
      permittivity: val * val,
      refractiveIndex: val,
    });
  };

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-slate-200">
          <Layers className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold tracking-wide">Dielectric Media Configuration</h2>
        </div>
        <button
          onClick={onSwapMedia}
          title="Swap Medium 1 and Medium 2"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />
          <span>Swap Media (1 ⇄ 2)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Medium 1 Panel */}
        <div className="bg-slate-950/70 rounded-lg p-3.5 border border-sky-950/80 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-sky-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Medium 1 (Incident Region)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              n₁ = {medium1.refractiveIndex.toFixed(3)}
            </span>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Select Material Preset
            </label>
            <select
              value={m1SelectValue}
              onChange={(e) => handleSelect1(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {STANDARD_MATERIALS.map((mat) => (
                <option key={mat.id} value={mat.id}>
                  {mat.name} (n={mat.refractiveIndex.toFixed(2)}, εr={mat.permittivity.toFixed(2)})
                </option>
              ))}
              <option value="custom">Custom Material (Manual Input)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center justify-between">
                <span>Rel. Permittivity (εᵣ₁)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max="100"
                value={Number(medium1.permittivity.toFixed(3))}
                onChange={(e) => handlePermittivity1(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center justify-between">
                <span>Refractive Index (n₁)</span>
              </label>
              <input
                type="number"
                step="0.001"
                min="1"
                max="10"
                value={Number(medium1.refractiveIndex.toFixed(3))}
                onChange={(e) => handleIndex1(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Medium 2 Panel */}
        <div className="bg-slate-950/70 rounded-lg p-3.5 border border-emerald-950/80 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Medium 2 (Transmission Region)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              n₂ = {medium2.refractiveIndex.toFixed(3)}
            </span>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Select Material Preset
            </label>
            <select
              value={m2SelectValue}
              onChange={(e) => handleSelect2(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {STANDARD_MATERIALS.map((mat) => (
                <option key={mat.id} value={mat.id}>
                  {mat.name} (n={mat.refractiveIndex.toFixed(2)}, εr={mat.permittivity.toFixed(2)})
                </option>
              ))}
              <option value="custom">Custom Material (Manual Input)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center justify-between">
                <span>Rel. Permittivity (εᵣ₂)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max="100"
                value={Number(medium2.permittivity.toFixed(3))}
                onChange={(e) => handlePermittivity2(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center justify-between">
                <span>Refractive Index (n₂)</span>
              </label>
              <input
                type="number"
                step="0.001"
                min="1"
                max="10"
                value={Number(medium2.refractiveIndex.toFixed(3))}
                onChange={(e) => handleIndex2(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Optical Contrast Notice */}
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-md border border-slate-800/80">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Optical contrast ratio: <strong className="text-slate-200 font-mono">n₁/n₂ = {(medium1.refractiveIndex / medium2.refractiveIndex).toFixed(3)}</strong>
          {medium1.refractiveIndex > medium2.refractiveIndex ? (
            <span className="text-rose-400 font-medium ml-1">· Optically Denser to Rarer (TIR is possible)</span>
          ) : medium1.refractiveIndex < medium2.refractiveIndex ? (
            <span className="text-sky-400 font-medium ml-1">· Optically Rarer to Denser (No TIR, ray bends toward normal)</span>
          ) : (
            <span className="text-emerald-400 font-medium ml-1">· Matched Media (Zero interface reflection)</span>
          )}
        </span>
      </div>
    </div>
  );
};
