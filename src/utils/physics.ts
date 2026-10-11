/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AngleSweepDataPoint, CalculationResults, SimulationParams } from '../types/electromagnetics';

export const C_LIGHT = 2.99792458e8; // m/s (speed of light in vacuum)
export const ETA_0 = 376.730313; // Ohms (impedance of free space)

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Calculates all electromagnetic wave parameters for a given interface configuration.
 */
export function calculateElectromagneticWave(params: SimulationParams): CalculationResults {
  const n1 = Math.max(0.0001, params.medium1.refractiveIndex);
  const n2 = Math.max(0.0001, params.medium2.refractiveIndex);
  const thetaI_deg = Math.min(89.99, Math.max(0, params.incidentAngleDeg));
  const thetaI_rad = thetaI_deg * DEG2RAD;
  const f_Hz = Math.max(1e6, params.frequencyGHz * 1e9);

  // Wavelengths
  const lambda0_m = C_LIGHT / f_Hz;
  const lambda0_mm = lambda0_m * 1000;
  const lambda1_mm = lambda0_mm / n1;
  const lambda2_mm = lambda0_mm / n2;
  const k0 = (2 * Math.PI) / lambda0_m;

  // Law of Reflection
  const reflectionAngleDeg = thetaI_deg;

  // Brewster Angle: tan(theta_B) = n2 / n1
  const brewsterAngleRad = Math.atan2(n2, n1);
  const brewsterAngleDeg = brewsterAngleRad * RAD2DEG;

  // Critical Angle: sin(theta_c) = n2 / n1 (only if n1 > n2)
  let criticalAngleDeg: number | null = null;
  if (n1 > n2) {
    criticalAngleDeg = Math.asin(n2 / n1) * RAD2DEG;
  }

  // Snell's Law: n1 * sin(theta_i) = n2 * sin(theta_t)
  const sinThetaI = Math.sin(thetaI_rad);
  const cosThetaI = Math.cos(thetaI_rad);
  const sinThetaT = (n1 / n2) * sinThetaI;

  let isTIR = false;
  let transmissionAngleDeg: number | null = null;
  let evanescentDecayAlphaM1: number | null = null;
  let penetrationDepthMm: number | null = null;

  // Amplitude coefficients placeholders
  let rTE = { real: 0, imag: 0, magnitude: 0, phaseDeg: 0 };
  let tTE = { real: 0, imag: 0, magnitude: 0, phaseDeg: 0 };
  let rTM = { real: 0, imag: 0, magnitude: 0, phaseDeg: 0 };
  let tTM = { real: 0, imag: 0, magnitude: 0, phaseDeg: 0 };

  let R_TE = 0;
  let T_TE = 1;
  let R_TM = 0;
  let T_TM = 1;

  if (sinThetaT > 1.000000001) {
    // Total Internal Reflection (TIR)
    isTIR = true;
    transmissionAngleDeg = null;

    // Normal component of transmitted wavevector is imaginary: kz2 = -j * alpha
    const radicand = Math.max(0, Math.pow(n1 * sinThetaI, 2) - Math.pow(n2, 2));
    const alpha = k0 * Math.sqrt(radicand);
    evanescentDecayAlphaM1 = alpha;
    penetrationDepthMm = alpha > 0 ? (1 / alpha) * 1000 : Infinity;

    // Phase shift upon TIR
    // delta_TE = 2 * atan( sqrt(n1^2 sin^2(theta) - n2^2) / (n1 * cos(theta)) )
    const numTE = Math.sqrt(radicand);
    const denTE = Math.max(1e-12, n1 * cosThetaI);
    const phaseTE = -2 * Math.atan2(numTE, denTE); // radians

    rTE = {
      real: Math.cos(phaseTE),
      imag: Math.sin(phaseTE),
      magnitude: 1.0,
      phaseDeg: phaseTE * RAD2DEG,
    };
    tTE = { real: 0, imag: 0, magnitude: 0, phaseDeg: 0 };
    R_TE = 1.0;
    T_TE = 0.0;

    // delta_TM = 2 * atan( (n1^2 / n2^2) * sqrt(n1^2 sin^2(theta) - n2^2) / (n1 * cos(theta)) )
    const numTM = Math.pow(n1 / n2, 2) * numTE;
    const denTM = denTE;
    const phaseTM = -2 * Math.atan2(numTM, denTM);

    rTM = {
      real: Math.cos(phaseTM),
      imag: Math.sin(phaseTM),
      magnitude: 1.0,
      phaseDeg: phaseTM * RAD2DEG,
    };
    tTM = { real: 0, imag: 0, magnitude: 0, phaseDeg: 0 };
    R_TM = 1.0;
    T_TM = 0.0;
  } else {
    // Normal Propagating Refraction
    const clampedSinThetaT = Math.min(1.0, Math.max(0, sinThetaT));
    const thetaT_rad = Math.asin(clampedSinThetaT);
    transmissionAngleDeg = thetaT_rad * RAD2DEG;
    const cosThetaT = Math.cos(thetaT_rad);

    // Fresnel Equations for TE (Perpendicular / s-polarization)
    // r_TE = (n1*cos(theta_i) - n2*cos(theta_t)) / (n1*cos(theta_i) + n2*cos(theta_t))
    const denTE = n1 * cosThetaI + n2 * cosThetaT;
    const rTE_val = denTE !== 0 ? (n1 * cosThetaI - n2 * cosThetaT) / denTE : 0;
    const tTE_val = denTE !== 0 ? (2 * n1 * cosThetaI) / denTE : 0;

    rTE = {
      real: rTE_val,
      imag: 0,
      magnitude: Math.abs(rTE_val),
      phaseDeg: rTE_val < 0 ? 180 : 0,
    };
    tTE = {
      real: tTE_val,
      imag: 0,
      magnitude: Math.abs(tTE_val),
      phaseDeg: 0,
    };

    R_TE = Math.min(1.0, Math.max(0, Math.pow(rTE_val, 2)));
    // T = (n2 * cos(theta_t)) / (n1 * cos(theta_i)) * t^2
    // Due to energy conservation: T = 1 - R
    T_TE = Math.min(1.0, Math.max(0, 1 - R_TE));

    // Fresnel Equations for TM (Parallel / p-polarization)
    // Standard optics convention: r_TM = (n2*cos(theta_i) - n1*cos(theta_t)) / (n2*cos(theta_i) + n1*cos(theta_t))
    const denTM = n2 * cosThetaI + n1 * cosThetaT;
    const rTM_val = denTM !== 0 ? (n2 * cosThetaI - n1 * cosThetaT) / denTM : 0;
    const tTM_val = denTM !== 0 ? (2 * n1 * cosThetaI) / denTM : 0;

    rTM = {
      real: rTM_val,
      imag: 0,
      magnitude: Math.abs(rTM_val),
      phaseDeg: rTM_val < 0 ? 180 : 0,
    };
    tTM = {
      real: tTM_val,
      imag: 0,
      magnitude: Math.abs(tTM_val),
      phaseDeg: 0,
    };

    R_TM = Math.min(1.0, Math.max(0, Math.pow(rTM_val, 2)));
    T_TM = Math.min(1.0, Math.max(0, 1 - R_TM));
  }

  // Active polarization selected by user
  const isTE = params.polarization === 'TE';
  const rActive = isTE ? rTE : rTM;
  const tActive = isTE ? tTE : tTM;
  const reflectance = isTE ? R_TE : R_TM;
  const transmittance = isTE ? T_TE : T_TM;

  const isNearBrewster = Math.abs(thetaI_deg - brewsterAngleDeg) < 0.6 && !isTE;

  return {
    incidentAngleDeg: thetaI_deg,
    reflectionAngleDeg,
    transmissionAngleDeg,
    criticalAngleDeg,
    brewsterAngleDeg,
    isTIR,
    isNearBrewster,
    rTE,
    tTE,
    rTM,
    tTM,
    rActive,
    tActive,
    reflectance,
    transmittance,
    reflectancePercent: reflectance * 100,
    transmittancePercent: transmittance * 100,
    wavelength0Mm: lambda0_mm,
    wavelength1Mm: lambda1_mm,
    wavelength2Mm: lambda2_mm,
    evanescentDecayAlphaM1,
    penetrationDepthMm,
  };
}

/**
 * Computes sweep curve points from theta = 0 to 89.9 deg for graphing.
 * Accurately inserts key points (Brewster and Critical angles) to prevent aliasing.
 */
export function generateAngleSweepData(
  n1: number,
  n2: number,
  frequencyGHz: number
): AngleSweepDataPoint[] {
  const points: AngleSweepDataPoint[] = [];

  const anglesSet = new Set<number>();

  // Regular grid
  for (let a = 0; a <= 89; a += 1) {
    anglesSet.add(a);
  }
  anglesSet.add(89.8);

  // Add fine resolution near Brewster angle
  const brewster = Math.atan2(n2, n1) * RAD2DEG;
  if (brewster > 0 && brewster < 89.8) {
    anglesSet.add(Number((brewster - 0.5).toFixed(2)));
    anglesSet.add(Number(brewster.toFixed(2)));
    anglesSet.add(Number((brewster + 0.5).toFixed(2)));
  }

  // Add fine resolution near Critical angle if n1 > n2
  if (n1 > n2) {
    const crit = Math.asin(n2 / n1) * RAD2DEG;
    if (crit > 0 && crit < 89.8) {
      anglesSet.add(Number((crit - 0.5).toFixed(2)));
      anglesSet.add(Number((crit - 0.05).toFixed(2)));
      anglesSet.add(Number(crit.toFixed(2)));
      anglesSet.add(Number((crit + 0.05).toFixed(2)));
      anglesSet.add(Number((crit + 0.5).toFixed(2)));
    }
  }

  const sortedAngles = Array.from(anglesSet).sort((a, b) => a - b);

  for (const angle of sortedAngles) {
    const res = calculateElectromagneticWave({
      medium1: { name: 'M1', permittivity: n1 * n1, refractiveIndex: n1 },
      medium2: { name: 'M2', permittivity: n2 * n2, refractiveIndex: n2 },
      incidentAngleDeg: angle,
      polarization: 'TE',
      frequencyGHz,
    });

    points.push({
      angle,
      R_TE: Number((res.rTE.magnitude * res.rTE.magnitude).toFixed(4)),
      T_TE: Number((1 - res.rTE.magnitude * res.rTE.magnitude).toFixed(4)),
      R_TM: Number((res.rTM.magnitude * res.rTM.magnitude).toFixed(4)),
      T_TM: Number((1 - res.rTM.magnitude * res.rTM.magnitude).toFixed(4)),
      r_mag_TE: Number(res.rTE.magnitude.toFixed(4)),
      r_mag_TM: Number(res.rTM.magnitude.toFixed(4)),
      t_mag_TE: Number(res.tTE.magnitude.toFixed(4)),
      t_mag_TM: Number(res.tTM.magnitude.toFixed(4)),
      isTIR: res.isTIR,
    });
  }

  return points;
}
