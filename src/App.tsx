/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PolarizationType, SimulationParams } from './types/electromagnetics';
import { PRESET_SCENARIOS, STANDARD_MATERIALS } from './utils/materials';
import { calculateElectromagneticWave, generateAngleSweepData } from './utils/physics';
import { Header } from './components/Header';
import { WaveVisualizer } from './components/WaveVisualizer';
import { MaterialSelector } from './components/MaterialSelector';
import { ControlPanel } from './components/ControlPanel';
import { MetricCards } from './components/MetricCards';
import { AnalysisCharts } from './components/AnalysisCharts';
import { EducationalGuide } from './components/EducationalGuide';

const DEFAULT_PARAMS: SimulationParams = {
  medium1: {
    name: 'Air (STP)',
    permittivity: 1.0006,
    refractiveIndex: 1.0003,
  },
  medium2: {
    name: 'Crown Glass (BK7)',
    permittivity: 2.31,
    refractiveIndex: 1.52,
  },
  incidentAngleDeg: 45.0,
  polarization: 'TE',
  frequencyGHz: 10.0,
};

export default function App() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);

  // Compute live physics results
  const results = useMemo(() => {
    return calculateElectromagneticWave(params);
  }, [params]);

  // Compute sweep data for charts
  const sweepData = useMemo(() => {
    return generateAngleSweepData(
      params.medium1.refractiveIndex,
      params.medium2.refractiveIndex,
      params.frequencyGHz
    );
  }, [params.medium1.refractiveIndex, params.medium2.refractiveIndex, params.frequencyGHz]);

  // Handlers
  const handleAngleChange = (angle: number) => {
    setParams((prev) => ({
      ...prev,
      incidentAngleDeg: Math.max(0, Math.min(89.9, angle)),
    }));
  };

  const handlePolarizationChange = (polarization: PolarizationType) => {
    setParams((prev) => ({
      ...prev,
      polarization,
    }));
  };

  const handleFrequencyChange = (frequencyGHz: number) => {
    setParams((prev) => ({
      ...prev,
      frequencyGHz,
    }));
  };

  const handleMedium1Change = (m: { name: string; permittivity: number; refractiveIndex: number }) => {
    setParams((prev) => ({
      ...prev,
      medium1: m,
    }));
  };

  const handleMedium2Change = (m: { name: string; permittivity: number; refractiveIndex: number }) => {
    setParams((prev) => ({
      ...prev,
      medium2: m,
    }));
  };

  const handleSwapMedia = () => {
    setParams((prev) => ({
      ...prev,
      medium1: { ...prev.medium2 },
      medium2: { ...prev.medium1 },
    }));
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (!preset) return;

    const m1 = STANDARD_MATERIALS.find((m) => m.id === preset.medium1Id);
    const m2 = STANDARD_MATERIALS.find((m) => m.id === preset.medium2Id);

    if (m1 && m2) {
      setParams({
        medium1: {
          name: m1.name,
          permittivity: m1.permittivity,
          refractiveIndex: m1.refractiveIndex,
        },
        medium2: {
          name: m2.name,
          permittivity: m2.permittivity,
          refractiveIndex: m2.refractiveIndex,
        },
        incidentAngleDeg: preset.incidentAngleDeg,
        polarization: preset.polarization,
        frequencyGHz: preset.frequencyGHz,
      });
    }
  };

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation & Status Bar */}
      <Header params={params} results={results} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Grid: Visualizer & Control Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 2D Wave Propagation Visualizer (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="h-[430px] sm:h-[480px]">
              <WaveVisualizer
                params={params}
                results={results}
                onAngleChange={handleAngleChange}
              />
            </div>

            {/* Dynamic Metric Display */}
            <MetricCards results={results} polarization={params.polarization} />
          </div>

          {/* Right Column: Parameters & Material Controls (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <ControlPanel
              incidentAngleDeg={params.incidentAngleDeg}
              polarization={params.polarization}
              frequencyGHz={params.frequencyGHz}
              brewsterAngleDeg={results.brewsterAngleDeg}
              criticalAngleDeg={results.criticalAngleDeg}
              onAngleChange={handleAngleChange}
              onPolarizationChange={handlePolarizationChange}
              onFrequencyChange={handleFrequencyChange}
              onSelectPreset={handleSelectPreset}
              onReset={handleReset}
            />

            <MaterialSelector
              medium1={params.medium1}
              medium2={params.medium2}
              onMedium1Change={handleMedium1Change}
              onMedium2Change={handleMedium2Change}
              onSwapMedia={handleSwapMedia}
            />
          </div>
        </div>

        {/* Middle Section: Angular Analysis & Fresnel Curves */}
        <section>
          <AnalysisCharts
            sweepData={sweepData}
            currentAngle={params.incidentAngleDeg}
            polarization={params.polarization}
            brewsterAngle={results.brewsterAngleDeg}
            criticalAngle={results.criticalAngleDeg}
            onAngleSelect={handleAngleChange}
          />
        </section>

        {/* Bottom Section: Educational Theory Guide & Formulations */}
        <section>
          <EducationalGuide />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Electromagnetic Wave Propagation Simulator · ECE Computational Physics
          </div>
          <div className="text-[11px] text-slate-600 font-mono">
            Boundary Conditions: ∇ × E = -∂B/∂t, ∇ × H = ∂D/∂t · Snell-Fresnel Model
          </div>
        </div>
      </footer>
    </div>
  );
}
