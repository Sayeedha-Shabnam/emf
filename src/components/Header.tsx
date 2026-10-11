/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Radio, Share2, Check, Download, GraduationCap, Cpu } from 'lucide-react';
import { CalculationResults, SimulationParams } from '../types/electromagnetics';

interface HeaderProps {
  params: SimulationParams;
  results: CalculationResults;
}

export const Header: React.FC<HeaderProps> = ({ params, results }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopySummary = () => {
    const summary = `
======================================================
ELECTROMAGNETIC WAVE PROPAGATION AT DIELECTRIC INTERFACES
ECE Computational Laboratory Experiment Report
======================================================
• Medium 1: ${params.medium1.name} (n1 = ${params.medium1.refractiveIndex.toFixed(4)}, εr1 = ${params.medium1.permittivity.toFixed(4)})
• Medium 2: ${params.medium2.name} (n2 = ${params.medium2.refractiveIndex.toFixed(4)}, εr2 = ${params.medium2.permittivity.toFixed(4)})
• Frequency: ${params.frequencyGHz} GHz (λ0 = ${results.wavelength0Mm.toFixed(2)} mm)
• Polarization: ${params.polarization} (${params.polarization === 'TE' ? 's-polarized / perpendicular' : 'p-polarized / parallel'})
• Incident Angle (θi): ${params.incidentAngleDeg.toFixed(2)}°
• Reflection Angle (θr): ${results.reflectionAngleDeg.toFixed(2)}°
• Transmission Angle (θt): ${results.isTIR ? 'None (TIR Active)' : `${results.transmissionAngleDeg?.toFixed(2)}°`}

Key Electromagnetic Boundary Metrics:
------------------------------------------------------
• Brewster Angle (θB): ${results.brewsterAngleDeg.toFixed(2)}°
• Critical Angle (θc): ${results.criticalAngleDeg ? `${results.criticalAngleDeg.toFixed(2)}°` : 'None (n1 <= n2)'}
• Total Internal Reflection (TIR): ${results.isTIR ? 'YES (Active)' : 'NO'}
${results.isTIR && results.penetrationDepthMm ? `• Evanescent Penetration Depth (dp): ${results.penetrationDepthMm.toFixed(3)} mm\n` : ''}
Power & Field Ratios:
------------------------------------------------------
• Reflectance (R): ${results.reflectancePercent.toFixed(2)}% (fraction: ${results.reflectance.toFixed(5)})
• Transmittance (T): ${results.transmittancePercent.toFixed(2)}% (fraction: ${results.transmittance.toFixed(5)})
• Energy Conservation: R + T = ${(results.reflectance + results.transmittance).toFixed(4)}
• Amplitude Refl. Coeff (r): |r| = ${results.rActive.magnitude.toFixed(4)} ∠${results.rActive.phaseDeg.toFixed(1)}°
• Amplitude Trans. Coeff (t): |t| = ${results.tActive.magnitude.toFixed(4)} ∠${results.tActive.phaseDeg.toFixed(1)}°
======================================================
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Electromagnetic Wave Propagation at Dielectric Interfaces
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold bg-sky-950 text-sky-400 border border-sky-800 rounded">
                ECE Lab
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive Snell’s Law, Fresnel Coefficients, Brewster Angle & Total Internal Reflection
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors shadow-sm"
            title="Copy experiment calculations to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Report Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Export Lab Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
