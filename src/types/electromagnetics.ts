/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PolarizationType = 'TE' | 'TM';

export interface DielectricMaterial {
  id: string;
  name: string;
  category: 'Gas/Vacuum' | 'Glass/Optics' | 'Dielectric/Polymer' | 'Semiconductor/Ceramic';
  permittivity: number; // relative permittivity epsilon_r
  refractiveIndex: number; // n = sqrt(epsilon_r)
  description: string;
}

export interface SimulationParams {
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
  incidentAngleDeg: number; // theta_i in degrees (0 to 89.99)
  polarization: PolarizationType;
  frequencyGHz: number; // f in GHz
}

export interface CalculationResults {
  incidentAngleDeg: number;
  reflectionAngleDeg: number;
  transmissionAngleDeg: number | null; // null if TIR occurs
  
  // Critical and Brewster angles
  criticalAngleDeg: number | null; // null if n1 <= n2
  brewsterAngleDeg: number; // Always exists for non-magnetic dielectrics: arctan(n2/n1)
  
  // Total Internal Reflection
  isTIR: boolean;
  isNearBrewster: boolean; // theta_i within 0.5 deg of Brewster for TM
  
  // Amplitude Reflection and Transmission Coefficients
  // For TE (s-pol)
  rTE: { real: number; imag: number; magnitude: number; phaseDeg: number };
  tTE: { real: number; imag: number; magnitude: number; phaseDeg: number };
  
  // For TM (p-pol)
  rTM: { real: number; imag: number; magnitude: number; phaseDeg: number };
  tTM: { real: number; imag: number; magnitude: number; phaseDeg: number };
  
  // Active Polarization coefficients
  rActive: { real: number; imag: number; magnitude: number; phaseDeg: number };
  tActive: { real: number; imag: number; magnitude: number; phaseDeg: number };
  
  // Power coefficients (Fraction of incident power)
  reflectance: number; // R in [0, 1]
  transmittance: number; // T in [0, 1]
  
  reflectancePercent: number; // R * 100
  transmittancePercent: number; // T * 100
  
  // Wave physics in each medium
  wavelength0Mm: number; // free space wavelength in mm
  wavelength1Mm: number; // medium 1 wavelength in mm
  wavelength2Mm: number; // medium 2 wavelength in mm
  
  // Evanescent wave parameters (if TIR)
  evanescentDecayAlphaM1: number | null; // alpha in m^-1
  penetrationDepthMm: number | null; // 1/alpha in mm
}

export interface AngleSweepDataPoint {
  angle: number; // 0 to 90 degrees
  R_TE: number;
  T_TE: number;
  R_TM: number;
  T_TM: number;
  r_mag_TE: number;
  r_mag_TM: number;
  t_mag_TE: number;
  t_mag_TM: number;
  isTIR: boolean;
}

export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  medium1Id: string;
  medium2Id: string;
  incidentAngleDeg: number;
  polarization: PolarizationType;
  frequencyGHz: number;
  description: string;
}
