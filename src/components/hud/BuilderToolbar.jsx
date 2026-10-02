'use client';

import React from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import {
  MousePointer,
  CircleDot,
  Minus,
  Trash2,
  Camera,
  RotateCcw,
  BookOpen,
  Award,
  BarChart2,
} from 'lucide-react';

export default function BuilderToolbar() {
  const builderTool = useSimulationStore((s) => s.builderTool);
  const cameraPreset = useSimulationStore((s) => s.cameraPreset);
  const showSfdBmd = useSimulationStore((s) => s.showSfdBmd);

  const setBuilderTool = useSimulationStore((s) => s.setBuilderTool);
  const setCameraPreset = useSimulationStore((s) => s.setCameraPreset);
  const resetCurrentChallenge = useSimulationStore((s) => s.resetCurrentChallenge);
  const setShowFormulasModal = useSimulationStore((s) => s.setShowFormulasModal);
  const setShowChallengeModal = useSimulationStore((s) => s.setShowChallengeModal);
  const toggleSfdBmd = useSimulationStore((s) => s.toggleSfdBmd);

  const tools = [
    { id: 'select', label: 'Inspect', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'add_node', label: '+ Joint', icon: <CircleDot className="w-4 h-4" /> },
    { id: 'add_member', label: '+ Bar', icon: <Minus className="w-4 h-4 stroke-[3]" /> },
    { id: 'delete', label: 'Erase', icon: <Trash2 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col gap-2 p-2 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg shadow-2xl font-mono text-xs select-none">
      {/* Primary CAD tools */}
      <div className="flex flex-col gap-1">
        <span className="text-[9px] text-slate-400 uppercase tracking-widest px-1">Tools</span>
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setBuilderTool(t.id)}
            title={t.label}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-all cursor-pointer ${
              builderTool === t.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="h-px bg-slate-800 my-1" />

      {/* Camera Presets */}
      <div className="flex flex-col gap-1">
        <span className="text-[9px] text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
          <Camera className="w-3 h-3" /> View
        </span>
        <div className="grid grid-cols-2 gap-1">
          {['front', 'iso', 'top', 'side'].map((preset) => (
            <button
              key={preset}
              onClick={() => setCameraPreset(preset)}
              className={`px-1.5 py-1 text-[10px] rounded uppercase font-semibold transition-colors ${
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
      <div className="flex flex-col gap-1">
        <button
          onClick={toggleSfdBmd}
          className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] transition-colors ${
            showSfdBmd
              ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SFD / BMD</span>
        </button>

        <button
          onClick={() => setShowChallengeModal(true)}
          className="flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-amber-300 hover:bg-amber-950/40 border border-amber-500/30 transition-colors"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Briefing</span>
        </button>

        <button
          onClick={() => setShowFormulasModal(true)}
          className="flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-cyan-300 hover:bg-cyan-950/40 border border-cyan-500/30 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Theory</span>
        </button>

        <button
          onClick={resetCurrentChallenge}
          title="Reset to challenge initial state"
          className="flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </div>
  );
}
