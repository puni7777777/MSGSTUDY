'use client';

import React, { useEffect } from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import {
  MousePointer,
  CircleDot,
  Minus,
  Trash2,
  Camera,
  Grid,
  RotateCcw,
  BookOpen,
  Award,
  BarChart2,
  Wrench,
} from 'lucide-react';
import TheoryCalculationPanel from './TheoryCalculationPanel';

export default function BuilderToolbar() {
  const activeChallengeId = useSimulationStore((s) => s.activeChallengeId);
  const builderTool = useSimulationStore((s) => s.builderTool);
  const cameraPreset = useSimulationStore((s) => s.cameraPreset);
  const showSfdBmd = useSimulationStore((s) => s.showSfdBmd);
  const showGrid = useSimulationStore((s) => s.showGrid);

  const setBuilderTool = useSimulationStore((s) => s.setBuilderTool);
  const setCameraPreset = useSimulationStore((s) => s.setCameraPreset);
  const toggleGrid = useSimulationStore((s) => s.toggleGrid);
  const resetCurrentChallenge = useSimulationStore((s) => s.resetCurrentChallenge);
  const setShowFormulasModal = useSimulationStore((s) => s.setShowFormulasModal);
  const setShowChallengeModal = useSimulationStore((s) => s.setShowChallengeModal);
  const toggleSfdBmd = useSimulationStore((s) => s.toggleSfdBmd);

  // Global keyboard shortcut: 'G' toggles 1m reference grid & axes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        toggleGrid();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleGrid]);

  const isCustomSim = activeChallengeId === 'custom_sim';

  const tools = [
    { id: 'select', label: 'Inspect', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'add_node', label: '+ Joint', icon: <CircleDot className="w-4 h-4" /> },
    { id: 'add_member', label: '+ Bar', icon: <Minus className="w-4 h-4 stroke-3" /> },
    { id: 'delete', label: 'Erase', icon: <Trash2 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col gap-2 max-h-full overflow-y-auto font-mono text-xs select-none pr-1">
      {/* In 'custom_sim', render CAD Tools. In predefined models, render Theory & Injected Formulas Panel */}
      {isCustomSim ? (
        <div className="flex flex-col gap-1.5 p-2.5 bg-slate-900/95 backdrop-blur border border-cyan-500/40 rounded-lg shadow-2xl w-36">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <Wrench className="w-3 h-3" /> CAD Tools
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-1 py-0.5 rounded font-bold animate-pulse">
              ACTIVE
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-0.5">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setBuilderTool(t.id)}
                title={t.label}
                aria-label={t.label}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                  builderTool === t.id
                    ? 'bg-cyan-400 text-cyan-950 font-black shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-1 pt-1 border-t border-slate-800 text-[10px] text-slate-400 text-center leading-tight">
            Simulation-style controls enabled
          </div>
        </div>
      ) : (
        /* In place of the tools tab on predefined models, render the Theory tab with injected values */
        <TheoryCalculationPanel />
      )}

      {/* Control Actions & Overlays Bar */}
      <div
        className={`flex flex-col gap-1 p-2 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg shadow-2xl ${
          isCustomSim ? 'w-36' : 'w-80 sm:w-88'
        }`}
      >
        {/* Camera Presets & Reference Grid */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Camera className="w-3 h-3" /> View
            </span>
            <button
              type="button"
              onClick={toggleGrid}
              title={showGrid ? 'Hide 1m Ground Grid (Shortcut: G)' : 'Show 1m Ground Grid (Shortcut: G)'}
              aria-label={showGrid ? 'Hide 1m Ground Grid' : 'Show 1m Ground Grid'}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold transition-colors cursor-pointer border ${
                showGrid
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/80'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>Grid: {showGrid ? 'ON' : 'OFF'}</span>
            </button>
          </div>
          <div className={`grid ${isCustomSim ? 'grid-cols-2' : 'grid-cols-4'} gap-1`}>
            {['front', 'iso', 'top', 'side'].map((preset) => (
              <button
                key={preset}
                onClick={() => setCameraPreset(preset)}
                className={`px-1 py-1 text-[10px] rounded uppercase font-semibold transition-colors cursor-pointer ${
                  cameraPreset === preset
                    ? 'bg-slate-700 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-800 my-1" />

        {/* Diagram & Overlays */}
        <div className={`grid ${isCustomSim ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-4'} gap-1`}>
          <button
            onClick={toggleSfdBmd}
            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors cursor-pointer ${
              showSfdBmd
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>SFD / BMD</span>
          </button>

          <button
            onClick={() => setShowChallengeModal(true)}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs text-amber-300 hover:bg-amber-950/40 border border-amber-500/30 transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Briefing</span>
          </button>

          <button
            onClick={() => setShowFormulasModal(true)}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs text-cyan-300 hover:bg-cyan-950/40 border border-cyan-500/30 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Theory Manual</span>
          </button>

          <button
            onClick={resetCurrentChallenge}
            title="Reset to challenge initial state"
            aria-label="Reset to challenge initial state"
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
