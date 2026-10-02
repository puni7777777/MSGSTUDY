'use client';

import React from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import { Flame, RotateCcw, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LoadScrubber() {
  const loadMultiplier = useSimulationStore((s) => s.loadMultiplier);
  const deformationScale = useSimulationStore((s) => s.deformationScale);
  const colorMode = useSimulationStore((s) => s.colorMode);
  const isDestructionTesting = useSimulationStore((s) => s.isDestructionTesting);
  const destructionReport = useSimulationStore((s) => s.destructionReport);
  const currentCollapseStepIndex = useSimulationStore((s) => s.currentCollapseStepIndex);

  const setLoadMultiplier = useSimulationStore((s) => s.setLoadMultiplier);
  const setDeformationScale = useSimulationStore((s) => s.setDeformationScale);
  const setColorMode = useSimulationStore((s) => s.setColorMode);
  const runDestructionTest = useSimulationStore((s) => s.runDestructionTest);
  const stopDestructionTest = useSimulationStore((s) => s.stopDestructionTest);
  const setCollapseStep = useSimulationStore((s) => s.setCollapseStep);

  return (
    <div className="w-full bg-slate-900/95 border-t border-slate-800 py-3 pl-14 pr-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs select-none">
      {/* Load Multiplier Slider */}
      <div className="flex items-center gap-3 min-w-[280px]">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            Applied Load Demand
          </span>
          <span className="text-cyan-400 font-bold text-sm">
            {(loadMultiplier * 100).toFixed(0)}% Rated
          </span>
        </div>
        <input
          id="load-multiplier-slider"
          aria-label="Applied Load Demand"
          type="range"
          min="0"
          max="3.0"
          step="0.05"
          value={loadMultiplier}
          disabled={isDestructionTesting}
          onChange={(e) => setLoadMultiplier(parseFloat(e.target.value))}
          className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
        />
      </div>

      {/* Visual Deformation Scale */}
      <div className="flex items-center gap-3 min-w-[220px]">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            Deflection Scale
          </span>
          <span className="text-slate-300 font-bold text-sm">
            {deformationScale.toFixed(0)}×
          </span>
        </div>
        <input
          id="deflection-scale-slider"
          aria-label="Deflection Scale"
          type="range"
          min="1"
          max="200"
          step="5"
          value={deformationScale}
          onChange={(e) => setDeformationScale(parseFloat(e.target.value))}
          className="flex-1 accent-purple-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
        />
      </div>

      {/* View Color Mode Switcher */}
      <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded border border-slate-700 text-[11px]">
        <span className="px-2 text-slate-400 flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> Mode:
        </span>
        <button
          onClick={() => setColorMode('stress')}
          className={`px-2.5 py-1 rounded transition-colors ${colorMode === 'stress'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          Stress Heatmap
        </button>
        <button
          onClick={() => setColorMode('tension_compression')}
          className={`px-2.5 py-1 rounded transition-colors ${colorMode === 'tension_compression'
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          Tension / Compression
        </button>
        <button
          onClick={() => setColorMode('material')}
          className={`px-2.5 py-1 rounded transition-colors ${colorMode === 'material'
              ? 'bg-slate-600/40 text-slate-200 border border-slate-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          Material
        </button>
      </div>

      {/* Destructive Testing & Playback Controls */}
      <div className="flex items-center gap-2">
        {!isDestructionTesting ? (
          <button
            onClick={runDestructionTest}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded font-bold shadow-lg shadow-red-950/50 hover:shadow-red-900/60 transition-all cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-200 animate-bounce" />
            TEARDOWN TO FAILURE
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-red-950/70 border border-red-500/60 px-3 py-1.5 rounded">
            <span className="text-red-300 font-bold text-xs uppercase flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              Collapse Replay:
            </span>
            <button
              disabled={currentCollapseStepIndex === 0}
              onClick={() => setCollapseStep(currentCollapseStepIndex - 1)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-1 text-slate-200 font-bold">
              {currentCollapseStepIndex + 1} / {destructionReport?.collapseSteps.length || 1}
            </span>
            <button
              disabled={
                !destructionReport ||
                currentCollapseStepIndex >= destructionReport.collapseSteps.length - 1
              }
              onClick={() => setCollapseStep(currentCollapseStepIndex + 1)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={stopDestructionTest}
              className="ml-2 flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Exit Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
