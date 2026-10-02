'use client';

import React, { useState } from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Info,
} from 'lucide-react';

export default function StressLegend() {
  const colorMode = useSimulationStore((s) => s.colorMode);
  const stressScaleMode = useSimulationStore((s) => s.stressScaleMode);
  const stressDisplayMetric = useSimulationStore((s) => s.stressDisplayMetric);
  const stressCustomMin = useSimulationStore((s) => s.stressCustomMin);
  const stressCustomMax = useSimulationStore((s) => s.stressCustomMax);
  const isStressScaleExpanded = useSimulationStore((s) => s.isStressScaleExpanded);
  const solverResult = useSimulationStore((s) => s.solverResult);

  const setStressScaleMode = useSimulationStore((s) => s.setStressScaleMode);
  const setStressDisplayMetric = useSimulationStore((s) => s.setStressDisplayMetric);
  const setStressCustomMin = useSimulationStore((s) => s.setStressCustomMin);
  const setStressCustomMax = useSimulationStore((s) => s.setStressCustomMax);
  const setStressLimits = useSimulationStore((s) => s.setStressLimits);
  const resetStressLimitsToAuto = useSimulationStore((s) => s.resetStressLimitsToAuto);
  const toggleStressScaleExpanded = useSimulationStore((s) => s.toggleStressScaleExpanded);

  // Hidden when viewing raw material mode
  if (colorMode === 'material') return null;

  // Tension / Compression mode
  if (colorMode === 'tension_compression') {
    return (
      <div className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-lg p-3 font-mono text-[11px] z-20 select-none shadow-2xl space-y-2 animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
            Internal Force
          </span>
          <span className="text-[9px] text-slate-500">Direction</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              <span className="text-slate-200">Tension (+)</span>
            </div>
            <span className="text-[10px] text-blue-400 font-semibold">Elongating</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
              <span className="text-slate-200">Compression (-)</span>
            </div>
            <span className="text-[10px] text-orange-400 font-semibold">Shortening</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-500" />
              <span className="text-slate-400">Zero-Force</span>
            </div>
            <span className="text-[10px] text-slate-500">Neutral</span>
          </div>
        </div>
      </div>
    );
  }

  // --- ANSYS Stress Spectrum Mode ---
  const extremes = solverResult.stressExtremes || {
    minStressMPa: 0,
    maxStressMPa: 0,
    minStressRatio: 0,
    maxStressRatio: 0,
  };

  const isMpa = stressDisplayMetric === 'stress_mpa';
  const peakVal = isMpa ? extremes.maxStressMPa : extremes.maxStressRatio;

  // Calculate effective bounds
  let effMin = 0;
  let effMax = isMpa ? 250 : 1.0;

  if (stressScaleMode === 'custom') {
    effMin = Number(stressCustomMin);
    effMax = Math.max(effMin + (isMpa ? 1.0 : 0.05), Number(stressCustomMax));
  } else {
    // Auto Mode: 0 to peak stress (+15% margin for visual headroom)
    effMin = 0;
    if (isMpa) {
      effMax = Math.max(10, Math.ceil((extremes.maxStressMPa || 50) * 1.15));
    } else {
      effMax = Math.max(1.0, Number(((extremes.maxStressRatio || 1.0) * 1.1).toFixed(2)));
    }
  }

  // Generate 7 discrete contour tick levels from Max (top) to Min (bottom)
  const stepsCount = 6; // 6 intervals = 7 tick marks
  const tickLevels = [];
  for (let i = 0; i <= stepsCount; i++) {
    const fraction = (stepsCount - i) / stepsCount; // 1.0 down to 0.0
    const val = effMin + (effMax - effMin) * fraction;
    tickLevels.push({
      fraction,
      val,
      label: isMpa ? `${val.toFixed(1)} MPa` : `${val.toFixed(2)}`,
    });
  }

  // Calculate current peak stress marker percentage on the vertical bar (0% at bottom, 100% at top)
  const peakPercent = Math.max(0, Math.min(100, ((peakVal - effMin) / (effMax - effMin)) * 100));

  // Quick step amount for adjustments
  const stepAmount = isMpa ? 10 : 0.1;

  const handleUpperChange = (newMax) => {
    const parsed = parseFloat(newMax);
    if (!isNaN(parsed) && parsed > effMin) {
      setStressCustomMax(parsed);
    }
  };

  const handleLowerChange = (newMin) => {
    const parsed = parseFloat(newMin);
    if (!isNaN(parsed) && parsed < effMax) {
      setStressCustomMin(parsed);
    }
  };

  const handleYieldCap = () => {
    if (isMpa) {
      setStressLimits(0, 250); // Structural Steel A36 yield = 250 MPa
    } else {
      setStressLimits(0, 1.0); // 1.0 = Yield threshold
    }
  };

  const handleFlowZoom = () => {
    // Zoom into the active flow by capping max at 60% of peak, highlighting subtle distribution
    const flowMax = Math.max(isMpa ? 5 : 0.2, peakVal * 0.6);
    setStressLimits(0, isMpa ? Math.round(flowMax) : Number(flowMax.toFixed(2)));
  };

  // Compact collapsed vertical strip
  if (!isStressScaleExpanded) {
    return (
      <div className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-lg p-2.5 font-mono text-[10px] z-20 select-none shadow-2xl flex flex-col items-center gap-2 animate-in fade-in duration-150">
        <button
          onClick={toggleStressScaleExpanded}
          title="Expand ANSYS Stress Contour Scale & Limit Controls"
          className="text-cyan-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider writing-mode-vertical">
          {isMpa ? `${effMax.toFixed(0)}` : `${effMax.toFixed(1)}`}
        </span>

        {/* Mini vertical color bar */}
        <div
          className="w-3.5 h-36 rounded-sm shadow-inner relative border border-slate-700/60"
          style={{
            background:
              'linear-gradient(to bottom, #dc2626 0%, #ea580c 14%, #f97316 28%, #eab308 42%, #84cc16 57%, #10b981 71%, #06b6d4 82%, #0284c7 92%, #1e40af 100%)',
          }}
        >
          {/* Current peak cursor on mini bar */}
          <div
            style={{ bottom: `${peakPercent}%` }}
            className="absolute left-0 right-0 h-1 bg-white border-y border-slate-950 shadow-md"
            title={`Structure Peak: ${isMpa ? `${peakVal.toFixed(1)} MPa` : peakVal.toFixed(2)}`}
          />
        </div>

        <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">
          {isMpa ? `${effMin.toFixed(0)}` : `${effMin.toFixed(1)}`}
        </span>

        <span className="text-[8px] text-slate-500 uppercase tracking-tighter">
          {isMpa ? 'MPa' : 'Ratio'}
        </span>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 w-72 max-h-[calc(100%-2rem)] overflow-y-auto bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl shadow-2xl p-2.5 sm:p-3 font-mono text-xs z-20 select-none animate-in fade-in duration-150">
      {/* Header & Controls */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">
            ANSYS Stress Scale
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${stressScaleMode === 'auto'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
          >
            {stressScaleMode}
          </span>
          <button
            onClick={toggleStressScaleExpanded}
            title="Minimize to compact bar"
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Metric Mode Toggle (MPa vs Demand Ratio) */}
      <div className="grid grid-cols-2 gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 mt-1.5 text-[10px]">
        <button
          onClick={() => setStressDisplayMetric('stress_mpa')}
          className={`py-0.5 rounded font-semibold transition-all cursor-pointer ${isMpa
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          Stress (MPa)
        </button>
        <button
          onClick={() => setStressDisplayMetric('demand_ratio')}
          className={`py-0.5 rounded font-semibold transition-all cursor-pointer ${!isMpa
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          Demand (&sigma;/&sigma;_y)
        </button>
      </div>

      {/* Upper Limit Range Controller */}
      <div className="mt-1.5 bg-slate-950/50 p-1.5 rounded-lg border border-slate-800/80">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
          <span className="uppercase font-semibold tracking-wider flex items-center gap-1 text-red-400 text-[9px]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Upper Limit (Max)
          </span>
          <span className="text-slate-400 text-[9px]">{isMpa ? 'MPa' : 'Ratio'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleUpperChange(effMax - stepAmount)}
            title="Decrease upper limit"
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold"
          >
            -
          </button>
          <input
            type="number"
            step={stepAmount}
            value={Number(effMax.toFixed(isMpa ? 1 : 2))}
            onChange={(e) => handleUpperChange(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-center text-red-400 font-bold text-xs focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => handleUpperChange(effMax + stepAmount)}
            title="Increase upper limit"
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Vertical ANSYS Rainbow Scale & Numerical Contours */}
      <div className="flex items-center gap-3 my-1.5 px-1 relative">
        {/* The Vertical Rainbow Bar */}
        <div
          className="w-5 h-36 rounded-md shadow-inner relative border border-slate-700/80 shrink-0"
          style={{
            background:
              'linear-gradient(to bottom, #dc2626 0%, #ea580c 14%, #f97316 28%, #eab308 42%, #84cc16 57%, #10b981 71%, #06b6d4 82%, #0284c7 92%, #1e40af 100%)',
          }}
        >
          {/* Real-time Peak Indicator needle */}
          <div
            style={{ bottom: `${peakPercent}%` }}
            className="absolute -left-1 -right-1 h-1 bg-white border border-slate-950 shadow-lg rounded-full z-10"
            title={`Structure Peak: ${isMpa ? `${peakVal.toFixed(1)} MPa` : peakVal.toFixed(2)}`}
          />
        </div>

        {/* Numerical Contour Levels */}
        <div className="flex-1 flex flex-col justify-between h-36 text-[9.5px] font-mono select-text py-0.5">
          {tickLevels.map((lvl, idx) => {
            const isTop = idx === 0;
            const isBottom = idx === tickLevels.length - 1;
            return (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-px bg-slate-600" />
                  <span
                    className={`font-semibold ${isTop
                        ? 'text-red-400 font-bold'
                        : isBottom
                          ? 'text-blue-400 font-bold'
                          : 'text-slate-300'
                      }`}
                  >
                    {lvl.label}
                  </span>
                </div>
                {isTop && <span className="text-[9px] text-red-400 uppercase font-bold">Max</span>}
                {isBottom && (
                  <span className="text-[9px] text-blue-400 uppercase font-bold">Min</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Peak Indicator Line */}
      <div className="bg-slate-950/60 px-2 py-1 rounded border border-slate-800 flex items-center justify-between text-[10px] mb-2.5">
        <span className="text-slate-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Structure Peak:
        </span>
        <span className="text-cyan-300 font-bold">
          {isMpa ? `${peakVal.toFixed(1)} MPa` : `${(peakVal * 100).toFixed(0)}% Yield`}
        </span>
      </div>

      {/* Lower Limit Range Controller */}
      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80 mb-2.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span className="uppercase font-semibold tracking-wider flex items-center gap-1 text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Lower Limit (Min)
          </span>
          <span className="text-slate-400">{isMpa ? 'MPa' : 'Ratio'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleLowerChange(effMin - stepAmount)}
            title="Decrease lower limit"
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold"
          >
            -
          </button>
          <input
            type="number"
            step={stepAmount}
            value={Number(effMin.toFixed(isMpa ? 1 : 2))}
            onChange={(e) => handleLowerChange(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-center text-blue-400 font-bold text-xs focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => handleLowerChange(effMin + stepAmount)}
            title="Increase lower limit"
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Quick Action Range Presets */}
      <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-800 text-[10px]">
        <button
          onClick={resetStressLimitsToAuto}
          title="Auto-scale range based on active peak load demand"
          className="flex items-center justify-center gap-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-cyan-400" />
          <span>Auto</span>
        </button>

        <button
          onClick={handleYieldCap}
          title="Set upper limit to 250 MPa yield stress"
          className="flex items-center justify-center gap-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
        >
          <span className="text-amber-400 font-bold">&sigma;_y</span>
          <span>Yield</span>
        </button>

        <button
          onClick={handleFlowZoom}
          title="Lower limit ceiling to make subtle low-stress force flows highly visible"
          className="flex items-center justify-center gap-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Flow</span>
        </button>
      </div>

      {/* Engineering Tip */}
      <div className="mt-2 text-[9px] text-slate-500 flex items-start gap-1 leading-tight">
        <Info className="w-3 h-3 shrink-0 text-slate-400 mt-0.5" />
        <span>
          Tip: Lowering Upper Limit spreads full rainbow contrast across low-stress members to
          reveal internal load transmission pathways.
        </span>
      </div>
    </div>
  );
}
