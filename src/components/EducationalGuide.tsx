/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, HelpCircle, Radio, Network, Lightbulb, Compass, ChevronDown, ChevronUp } from 'lucide-react';

export const EducationalGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('snell');

  const sections = [
    {
      id: 'snell',
      title: '1. Why Waves Bend & Snell’s Law',
      icon: Compass,
      content: (
        <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            When an electromagnetic plane wave transitions from one dielectric medium to another,
            its phase velocity changes from <code className="text-sky-300">v₁ = c / n₁</code> to{' '}
            <code className="text-emerald-300">v₂ = c / n₂</code>. To maintain continuity of the
            tangential electric and magnetic fields across the boundary, the wave fronts must remain
            continuous at all points on the interface.
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-sky-300">
            n₁ · sin(θᵢ) = n₂ · sin(θₜ)
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>
              <strong className="text-slate-200">Optically Denser Medium (n₂ &gt; n₁):</strong> The wave slows down, bending <em className="text-emerald-400">toward</em> the surface normal (θₜ &lt; θᵢ).
            </li>
            <li>
              <strong className="text-slate-200">Optically Rarer Medium (n₂ &lt; n₁):</strong> The wave speeds up, bending <em className="text-rose-400">away from</em> the normal (θₜ &gt; θᵢ).
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'fresnel',
      title: '2. Fresnel Equations (TE vs TM Polarization)',
      icon: Radio,
      content: (
        <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            The amplitudes of the reflected and transmitted waves are dictated by Maxwell’s boundary
            conditions (continuity of tangential <strong className="text-slate-200">E</strong> and <strong className="text-slate-200">H</strong> fields):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-indigo-900/50">
              <span className="text-xs font-semibold text-indigo-400 block mb-1">
                TE Polarization (s-polarization ⟂)
              </span>
              <p className="text-[11px] text-slate-400 mb-2">
                Electric field vector is strictly perpendicular to the plane of incidence.
              </p>
              <div className="font-mono text-xs text-slate-200 space-y-1">
                <div>r_TE = (n₁ cos θᵢ - n₂ cos θₜ) / (n₁ cos θᵢ + n₂ cos θₜ)</div>
                <div>t_TE = (2 n₁ cos θᵢ) / (n₁ cos θᵢ + n₂ cos θₜ)</div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-sky-900/50">
              <span className="text-xs font-semibold text-sky-400 block mb-1">
                TM Polarization (p-polarization ∥)
              </span>
              <p className="text-[11px] text-slate-400 mb-2">
                Electric field vector lies within the plane of incidence.
              </p>
              <div className="font-mono text-xs text-slate-200 space-y-1">
                <div>r_TM = (n₂ cos θᵢ - n₁ cos θₜ) / (n₂ cos θᵢ + n₁ cos θₜ)</div>
                <div>t_TM = (2 n₁ cos θᵢ) / (n₂ cos θᵢ + n₁ cos θₜ)</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs text-amber-300">
            <strong>Power Conservation:</strong> Reflectance <code className="text-white">R = |r|²</code> and Transmittance{' '}
            <code className="text-white">T = (n₂ cos θₜ / n₁ cos θᵢ) |t|² = 1 - R</code>. Total energy is conserved!
          </div>
        </div>
      ),
    },
    {
      id: 'brewster',
      title: '3. Brewster Angle (Zero-Reflection Condition)',
      icon: Lightbulb,
      content: (
        <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            The <strong className="text-slate-100">Brewster Angle (θB)</strong>, also known as the polarizing angle, is the precise incident angle at which the reflection coefficient for parallel-polarized waves (TM) completely vanishes:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300">
            tan(θB) = n₂ / n₁   ⟹   θB = arctan(n₂ / n₁)
          </div>
          <p>
            <strong>Physical Mechanism:</strong> In Medium 2, oscillating atomic dipoles driven by the transmitted electric field re-radiate electromagnetic energy. For TM polarization at θᵢ = θB, the reflected ray direction is exactly collinear with the dipole oscillation axis. Because an electric dipole radiates zero power along its dipole axis, <strong className="text-emerald-400">no reflected wave can be generated</strong>. Thus, R_TM = 0 and 100% of the energy is transmitted.
          </p>
          <p className="text-slate-400 text-xs">
            <em>Note:</em> For non-magnetic media (μ₁ = μ₂ = μ₀), TE polarization has no real Brewster angle; reflection never drops to zero for TE.
          </p>
        </div>
      ),
    },
    {
      id: 'tir',
      title: '4. Total Internal Reflection & Evanescent Fields',
      icon: Network,
      content: (
        <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            When a wave travels from an optically denser medium into a rarer medium (<code className="text-rose-300">n₁ &gt; n₂</code>), Snell’s law requires the refracted angle θₜ to exceed the incident angle θᵢ.
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-rose-300 space-y-1">
            <div>θc = arcsin(n₂ / n₁)    (Critical Angle)</div>
            <div>When θᵢ &gt; θc  ⟹  Total Internal Reflection (TIR) occurs</div>
          </div>
          <p>
            <strong>Evanescent Wave:</strong> Although no real, propagating electromagnetic wave travels into the bulk of Medium 2 (transmittance T = 0, reflectance R = 100%), boundary conditions demand continuous field solutions. A bound surface wave is formed that propagates along the interface with exponential decay away from the boundary:
          </p>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
            E(z) = E₀ · e^(-αz) · e^(-j kₓ x), &nbsp; where penetration depth dp = 1 / α
          </div>
          <p className="text-slate-400 text-xs">
            The evanescent wave carries zero time-averaged real power into Medium 2 unless another dielectric is placed within its penetration depth (Frustrated TIR / Optical Tunneling).
          </p>
        </div>
      ),
    },
    {
      id: 'applications',
      title: '5. Real-World Engineering Applications',
      icon: BookOpen,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <h4 className="font-semibold text-sky-400 mb-1">Optical Fiber Waveguides</h4>
            <p className="text-slate-400 leading-snug">
              Telecommunication fibers use a silica core with higher refractive index (n ≈ 1.48) surrounded by cladding (n ≈ 1.46). Light signals propagate over thousands of kilometers virtually losslessly via continuous Total Internal Reflection.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <h4 className="font-semibold text-emerald-400 mb-1">Brewster Windows in Gas Lasers</h4>
            <p className="text-slate-400 leading-snug">
              Laser resonant cavities (e.g., He-Ne, Argon lasers) utilize optical end windows inclined at Brewster’s angle. The cavity beam passes through with zero reflection loss for the TM mode, naturally selecting linear polarization.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <h4 className="font-semibold text-amber-400 mb-1">Radar Radomes & Antennas</h4>
            <p className="text-slate-400 leading-snug">
              Aircraft radar domes are dielectric shells engineered to match free-space wave impedance (η₀ = 377 Ω) or operated at specific angles to prevent harmful back-reflections that would distort beam patterns and antenna return loss.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <h4 className="font-semibold text-indigo-400 mb-1">Polarizing Beam Splitters & Anti-Reflective Coatings</h4>
            <p className="text-slate-400 leading-snug">
              Dielectric prism cubes split unpolarized incoming light into purely transmitted TM (p-polarized) and purely reflected TE (s-polarized) components using thin-film dielectric interface stacks.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'glossary',
      title: '6. Mathematical Notation & Symbol Glossary',
      icon: HelpCircle,
      content: (
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto text-xs font-mono">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-1 px-2">Symbol</th>
                <th className="py-1 px-2">Quantity Name</th>
                <th className="py-1 px-2">SI Units</th>
                <th className="py-1 px-2">Definition / Formula</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-1.5 px-2 text-sky-400 font-bold">εᵣ</td>
                <td className="py-1.5 px-2">Relative Permittivity (Dielectric Constant)</td>
                <td className="py-1.5 px-2">Dimensionless</td>
                <td className="py-1.5 px-2">ε / ε₀</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-sky-400 font-bold">n</td>
                <td className="py-1.5 px-2">Refractive Index</td>
                <td className="py-1.5 px-2">Dimensionless</td>
                <td className="py-1.5 px-2">√(εᵣ · μᵣ) = √εᵣ (non-magnetic)</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-sky-400 font-bold">θᵢ, θᵣ, θₜ</td>
                <td className="py-1.5 px-2">Incident, Reflected, Transmitted Angles</td>
                <td className="py-1.5 px-2">Degrees / Radians</td>
                <td className="py-1.5 px-2">Angles relative to surface normal</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-indigo-400 font-bold">θB</td>
                <td className="py-1.5 px-2">Brewster Angle</td>
                <td className="py-1.5 px-2">Degrees</td>
                <td className="py-1.5 px-2">arctan(n₂ / n₁)</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-rose-400 font-bold">θc</td>
                <td className="py-1.5 px-2">Critical Angle</td>
                <td className="py-1.5 px-2">Degrees</td>
                <td className="py-1.5 px-2">arcsin(n₂ / n₁) when n₁ &gt; n₂</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-amber-400 font-bold">r, t</td>
                <td className="py-1.5 px-2">Fresnel Reflection & Transmission Coefficients</td>
                <td className="py-1.5 px-2">Dimensionless (Complex)</td>
                <td className="py-1.5 px-2">E_reflected / E_incident, E_transmitted / E_incident</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-amber-400 font-bold">R, T</td>
                <td className="py-1.5 px-2">Power Reflectance & Transmittance</td>
                <td className="py-1.5 px-2">% or Fraction [0, 1]</td>
                <td className="py-1.5 px-2">R = |r|², T = 1 - R</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-emerald-400 font-bold">dp</td>
                <td className="py-1.5 px-2">Evanescent Skin Depth / Penetration Depth</td>
                <td className="py-1.5 px-2">mm or m</td>
                <td className="py-1.5 px-2">1 / α = λ₀ / (2π √(n₁² sin²θᵢ - n₂²))</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 text-slate-200">
        <BookOpen className="w-4 h-4 text-sky-400" />
        <h2 className="text-sm font-semibold tracking-wide">
          ECE Theory & Electromagnetic Foundations
        </h2>
      </div>

      <div className="space-y-2">
        {sections.map((section) => {
          const isOpen = activeSection === section.id;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60 transition-colors"
            >
              <button
                onClick={() => setActiveSection(isOpen ? '' : section.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-900/80 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Icon className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{section.title}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isOpen && <div className="p-3 pt-1 border-t border-slate-800/80">{section.content}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
