/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DielectricMaterial, PresetScenario } from '../types/electromagnetics';

export const STANDARD_MATERIALS: DielectricMaterial[] = [
  {
    id: 'vacuum',
    name: 'Vacuum',
    category: 'Gas/Vacuum',
    permittivity: 1.0,
    refractiveIndex: 1.0,
    description: 'Perfect free space, absolute baseline reference (εr = 1.000, n = 1.000).'
  },
  {
    id: 'air',
    name: 'Air (STP)',
    category: 'Gas/Vacuum',
    permittivity: 1.0006,
    refractiveIndex: 1.0003,
    description: 'Atmospheric air at sea level and standard temperature/pressure.'
  },
  {
    id: 'water',
    name: 'Distilled Water (Optical)',
    category: 'Dielectric/Polymer',
    permittivity: 1.77,
    refractiveIndex: 1.33,
    description: 'Purified water at optical frequencies (n ≈ 1.33).'
  },
  {
    id: 'teflon',
    name: 'PTFE (Teflon)',
    category: 'Dielectric/Polymer',
    permittivity: 2.1,
    refractiveIndex: 1.449,
    description: 'Low-loss fluoropolymer widely used in microwave printed circuits and radomes.'
  },
  {
    id: 'polyethylene',
    name: 'Polyethylene (PE)',
    category: 'Dielectric/Polymer',
    permittivity: 2.25,
    refractiveIndex: 1.50,
    description: 'Standard coaxial cable dielectric and RF insulator.'
  },
  {
    id: 'crown_glass',
    name: 'Crown Glass (BK7)',
    category: 'Glass/Optics',
    permittivity: 2.31,
    refractiveIndex: 1.52,
    description: 'Standard optical borosilicate glass for lenses, prisms, and windows.'
  },
  {
    id: 'fused_silica',
    name: 'Fused Silica (Quartz)',
    category: 'Glass/Optics',
    permittivity: 3.8,
    refractiveIndex: 1.949,
    description: 'High purity silicon dioxide used in optical fiber cores and UV optics.'
  },
  {
    id: 'flint_glass',
    name: 'Dense Flint Glass',
    category: 'Glass/Optics',
    permittivity: 2.76,
    refractiveIndex: 1.66,
    description: 'High refractive index optical glass with high dispersion.'
  },
  {
    id: 'fr4',
    name: 'FR-4 Epoxy Substrate',
    category: 'Dielectric/Polymer',
    permittivity: 4.4,
    refractiveIndex: 2.098,
    description: 'Ubiquitous woven glass-reinforced epoxy printed circuit board (PCB) substrate.'
  },
  {
    id: 'diamond',
    name: 'Diamond (C)',
    category: 'Semiconductor/Ceramic',
    permittivity: 5.86,
    refractiveIndex: 2.42,
    description: 'High-index crystalline carbon with exceptional thermal conductivity.'
  },
  {
    id: 'alumina',
    name: 'Alumina (Al₂O₃ Ceramic)',
    category: 'Semiconductor/Ceramic',
    permittivity: 9.8,
    refractiveIndex: 3.13,
    description: 'Dense structural ceramic used for microwave integrated circuits (MICs).'
  },
  {
    id: 'silicon',
    name: 'Silicon (Si - Undoped)',
    category: 'Semiconductor/Ceramic',
    permittivity: 11.9,
    refractiveIndex: 3.45,
    description: 'High-index semiconductor substrate for integrated photonics and terahertz optics.'
  },
  {
    id: 'gaas',
    name: 'Gallium Arsenide (GaAs)',
    category: 'Semiconductor/Ceramic',
    permittivity: 12.9,
    refractiveIndex: 3.59,
    description: 'Direct-bandgap semiconductor for high-speed MMICs and optoelectronic laser diodes.'
  }
];

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'air-glass-brewster',
    title: 'Air to Glass: Brewster Angle & Zero Reflection',
    subtitle: 'TM wave reflection vanishes completely at θB ≈ 56.7°',
    medium1Id: 'air',
    medium2Id: 'crown_glass',
    incidentAngleDeg: 56.7,
    polarization: 'TM',
    frequencyGHz: 10.0,
    description: 'Demonstrates Brewster polarizing angle when wave enters a denser medium. For TM polarization, reflection drops strictly to zero and 100% of power transmits.'
  },
  {
    id: 'glass-air-tir',
    title: 'Glass to Air: Total Internal Reflection (TIR)',
    subtitle: 'Wave trapped inside denser medium above θc ≈ 41.1°',
    medium1Id: 'crown_glass',
    medium2Id: 'air',
    incidentAngleDeg: 50.0,
    polarization: 'TE',
    frequencyGHz: 10.0,
    description: 'Wave travels from optically denser Medium 1 (n=1.52) to rarer Medium 2 (n=1.0). Since θi > θc (41.1°), 100% of power reflects and an evanescent wave forms at the interface.'
  },
  {
    id: 'critical-angle-grazing',
    title: 'Critical Angle Transition (θi = θc)',
    subtitle: 'Refracted wave skims along the boundary at θt = 90°',
    medium1Id: 'crown_glass',
    medium2Id: 'air',
    incidentAngleDeg: 41.1,
    polarization: 'TE',
    frequencyGHz: 10.0,
    description: 'At exactly the critical angle θc = arcsin(n2/n1), the transmission angle reaches 90°, where the transmitted ray propagates parallel to the interface.'
  },
  {
    id: 'optical-fiber',
    title: 'Optical Fiber Core to Cladding',
    subtitle: 'Waveguiding via high critical angle confinement',
    medium1Id: 'fused_silica',
    medium2Id: 'crown_glass',
    incidentAngleDeg: 65.0,
    polarization: 'TE',
    frequencyGHz: 28.0,
    description: 'Models electromagnetic wave guiding in dielectric optical fibers and waveguides with slight index contrast, sustaining TIR propagation.'
  },
  {
    id: 'pcb-radome',
    title: 'FR-4 Substrate to Air (Antenna Radome)',
    subtitle: 'Microwave radome reflection matching at 24 GHz',
    medium1Id: 'fr4',
    medium2Id: 'air',
    incidentAngleDeg: 30.0,
    polarization: 'TM',
    frequencyGHz: 24.0,
    description: 'Examines boundary reflection and wave impedance mismatch when microwave signals radiate from PCB substrate into open air.'
  },
  {
    id: 'matched-dielectrics',
    title: 'Impedance Matched Dielectrics (n1 = n2)',
    subtitle: 'Zero reflection boundary: R = 0, T = 1 across all angles',
    medium1Id: 'crown_glass',
    medium2Id: 'crown_glass',
    incidentAngleDeg: 45.0,
    polarization: 'TE',
    frequencyGHz: 10.0,
    description: 'When relative permittivity is identical, wave impedance is matched (η1 = η2). The wave transmits completely without refraction or reflection.'
  }
];
