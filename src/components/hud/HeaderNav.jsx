'use client';

import React from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import { getAllMissions } from '../../core/missions/missionRegistry';
import {
  Award,
  BookOpen,
  Hammer,
  Sparkles,
} from 'lucide-react';

export default function HeaderNav() {
  const activeChallengeId = useSimulationStore((s) => s.activeChallengeId);
  const customMissions = useSimulationStore((s) => s.customMissions);
  const loadChallenge = useSimulationStore((s) => s.loadChallenge);
  const setShowChallengeModal = useSimulationStore((s) => s.setShowChallengeModal);
  const setShowFormulasModal = useSimulationStore((s) => s.setShowFormulasModal);
  const setShowMissionStudioModal = useSimulationStore((s) => s.setShowMissionStudioModal);

  const allMissions = getAllMissions(customMissions);
  const activeChallenge =
    allMissions.find((c) => c.id === activeChallengeId) || allMissions[0];

  return (
    <header className="w-full bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-4 font-mono select-none">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center">
          <Hammer className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-wider bg-linear-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              THE TEARDOWN LAB
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-slate-300 border border-slate-700">
              Module 1: Statics & FEA
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Interactive Physics Sandbox & Destructive Engineering
          </p>
        </div>
      </div>

      {/* Challenge Mission Switcher */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex flex-col text-right mr-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">Active Mission</span>
          <span className="text-xs font-bold text-slate-200">{activeChallenge.title}</span>
        </div>

        <select
          value={activeChallenge.id}
          onChange={(e) => loadChallenge(e.target.value)}
          aria-label="Select Active Mission"
          className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          {allMissions.map((ch, idx) => (
            <option key={ch.id} value={ch.id}>
              {idx + 1}. {ch.title} {ch.isCustom ? '★ (Custom)' : `(${ch.difficulty})`}
            </option>
          ))}
        </select>

        {/* Mission Studio Launcher Button */}
        <button
          onClick={() => setShowMissionStudioModal(true)}
          title="Open Mission Studio (Create, Import, Export Missions)"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 rounded-md text-xs font-bold transition-all shadow-sm shadow-cyan-500/10 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Studio</span>
        </button>

        {/* Mission Briefing Button */}
        <button
          onClick={() => setShowChallengeModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-xs font-semibold transition-colors cursor-pointer"
        >
          <Award className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Objectives</span>
        </button>

        {/* Theory Button */}
        <button
          onClick={() => setShowFormulasModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md text-xs font-semibold transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Formulas</span>
        </button>
      </div>
    </header>
  );
}
