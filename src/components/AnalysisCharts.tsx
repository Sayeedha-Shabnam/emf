/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { AngleSweepDataPoint, PolarizationType } from '../types/electromagnetics';
import { LineChart as ChartIcon, BarChart3, Layers, Info } from 'lucide-react';

interface AnalysisChartsProps {
  sweepData: AngleSweepDataPoint[];
  currentAngle: number;
  polarization: PolarizationType;
  brewsterAngle: number;
  criticalAngle: number | null;
  onAngleSelect: (angle: number) => void;
}

export const AnalysisCharts: React.FC<AnalysisChartsProps> = ({
  sweepData,
  currentAngle,
  polarization,
  brewsterAngle,
  criticalAngle,
  onAngleSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'power' | 'comparison' | 'amplitude'>('power');

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <div className="text-slate-300 font-semibold mb-1 border-b border-slate-800 pb-1">
            Angle: {Number(label).toFixed(1)}°
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name}:
              </span>
              <span className="text-slate-100 font-bold tabular-nums">
                {(entry.value * 100).toFixed(2)}%
                {activeTab === 'amplitude' ? ` (${entry.value.toFixed(3)})` : ''}
              </span>
            </div>
          ))}
          {criticalAngle && Number(label) >= criticalAngle && (
            <div className="text-rose-400 text-[10px] mt-1 pt-1 border-t border-slate-800">
              Total Internal Reflection (TIR)
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col gap-3">
      {/* Chart Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-slate-200">
          <ChartIcon className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold tracking-wide">
            Angular Analysis & Fresnel Curves
          </h2>
        </div>

        {/* View Selection Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('power')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'power'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Power (R & T)
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'comparison'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            TE vs TM Comparison
          </button>
          <button
            onClick={() => setActiveTab('amplitude')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'amplitude'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Amplitude (|r| & |t|)
          </button>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="w-full h-[280px] sm:h-[320px] pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={sweepData}
            onClick={(state) => {
              if (state && state.activeLabel !== undefined) {
                onAngleSelect(Number(state.activeLabel));
              }
            }}
            margin={{ top: 12, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="angle"
              type="number"
              domain={[0, 90]}
              tickCount={10}
              stroke="#64748b"
              fontSize={11}
              unit="°"
            />
            <YAxis
              domain={[0, 1]}
              tickCount={6}
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
              iconType="circle"
              iconSize={8}
            />

            {/* Current Incident Angle Reference Cursor */}
            <ReferenceLine
              x={currentAngle}
              stroke="#38bdf8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              label={{
                value: `θᵢ = ${currentAngle.toFixed(1)}°`,
                fill: '#38bdf8',
                fontSize: 10,
                position: 'insideTopLeft',
              }}
            />

            {/* Brewster Angle Reference Line */}
            {brewsterAngle > 0 && brewsterAngle < 90 && (
              <ReferenceLine
                x={brewsterAngle}
                stroke="#818cf8"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: `θB = ${brewsterAngle.toFixed(1)}°`,
                  fill: '#818cf8',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
            )}

            {/* Critical Angle Reference Line (if exists) */}
            {criticalAngle !== null && criticalAngle < 90 && (
              <ReferenceLine
                x={criticalAngle}
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: `θc = ${criticalAngle.toFixed(1)}° (TIR)`,
                  fill: '#f43f5e',
                  fontSize: 10,
                  position: 'insideBottomRight',
                }}
              />
            )}

            {/* Tab 1: Current Polarization Power Curves (R and T) */}
            {activeTab === 'power' && (
              <>
                <Line
                  type="monotone"
                  dataKey={polarization === 'TE' ? 'R_TE' : 'R_TM'}
                  name={`Reflectance R (${polarization})`}
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#f59e0b' }}
                />
                <Line
                  type="monotone"
                  dataKey={polarization === 'TE' ? 'T_TE' : 'T_TM'}
                  name={`Transmittance T (${polarization})`}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#10b981' }}
                />
              </>
            )}

            {/* Tab 2: TE vs TM Comparison */}
            {activeTab === 'comparison' && (
              <>
                <Line
                  type="monotone"
                  dataKey="R_TE"
                  name="R_TE (s-polarization ⟂)"
                  stroke="#6366f1"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#6366f1' }}
                />
                <Line
                  type="monotone"
                  dataKey="R_TM"
                  name="R_TM (p-polarization ∥, Brewster Zero)"
                  stroke="#06b6d4"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#06b6d4' }}
                />
              </>
            )}

            {/* Tab 3: Amplitude Coefficients */}
            {activeTab === 'amplitude' && (
              <>
                <Line
                  type="monotone"
                  dataKey={polarization === 'TE' ? 'r_mag_TE' : 'r_mag_TM'}
                  name={`|r| Reflection Amplitude (${polarization})`}
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#fbbf24' }}
                />
                <Line
                  type="monotone"
                  dataKey={polarization === 'TE' ? 't_mag_TE' : 't_mag_TM'}
                  name={`|t| Transmission Amplitude (${polarization})`}
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#2dd4bf' }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Guide */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span>
            <span>Current θᵢ: {currentAngle.toFixed(1)}°</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-indigo-400 inline-block"></span>
            <span>Brewster θB: {brewsterAngle.toFixed(1)}°</span>
          </span>
          {criticalAngle !== null && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span>
              <span>Critical θc: {criticalAngle.toFixed(1)}°</span>
            </span>
          )}
        </div>
        <div className="text-slate-500 font-mono">
          Click plot to jump to angle
        </div>
      </div>
    </div>
  );
};
