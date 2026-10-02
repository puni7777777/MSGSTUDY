'use client';

import React from 'react';
import confetti from 'canvas-confetti';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import { getAllMissions } from '../../core/missions/missionRegistry';
import {
  Award,
  CheckCircle2,
  XCircle,
  X,
  Target,
  Sparkles,
} from 'lucide-react';

export default function ChallengeBriefingModal() {
  const showChallengeModal = useSimulationStore((s) => s.showChallengeModal);
  const setShowChallengeModal = useSimulationStore((s) => s.setShowChallengeModal);
  const activeChallengeId = useSimulationStore((s) => s.activeChallengeId);
  const customMissions = useSimulationStore((s) => s.customMissions);
  const loadChallenge = useSimulationStore((s) => s.loadChallenge);
  const solverResult = useSimulationStore((s) => s.solverResult);

  if (!showChallengeModal) return null;

  const allMissions = getAllMissions(customMissions);
  const challenge =
    allMissions.find((c) => c.id === activeChallengeId) || allMissions[0];
  const constraints = challenge.constraints;

  const fos = solverResult.minFactorOfSafety;
  const mass = solverResult.totalMassKg;
  const cost = solverResult.totalCostUsd;
  const deflMm = solverResult.maxDeflectionMeters * 1000;

  const passFos = solverResult.isStable && fos >= constraints.minFactorOfSafety;
  const passMass = mass <= constraints.maxMassKg;
  const passCost = cost <= constraints.maxBudgetDollars;
  const passDefl = deflMm <= constraints.maxDeflectionMm;

  const isAllPassed = passFos && passMass && passCost && passDefl;

  const handleTestAndCelebrate = () => {
    if (isAllPassed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">{challenge.title}</h2>
              <span className="text-[11px] text-cyan-400">{challenge.subtitle}</span>
            </div>
          </div>
          <button
            onClick={() => setShowChallengeModal(false)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Challenge Selector */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
              Switch Challenge Mission
            </label>
            <select
              value={challenge.id}
              onChange={(e) => loadChallenge(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              {MODULE_1_CHALLENGES.map((c, i) => (
                <option key={c.id} value={c.id}>
                  Mission {i + 1}: {c.title} ({c.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* Scenario Briefing */}
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <span className="text-cyan-400 font-bold text-[11px] flex items-center gap-1.5 uppercase">
              <Target className="w-3.5 h-3.5" /> Mission Scenario
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">{challenge.scenario}</p>
          </div>

          {/* Pedagogical Insights */}
          <div className="bg-indigo-950/20 p-3.5 rounded-lg border border-indigo-500/30 space-y-2">
            <span className="text-indigo-300 font-bold text-[11px] uppercase">
              Key Engineering Principles
            </span>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              {challenge.pedagogicalTakeaways.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">&bull;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Live Criteria Checklist */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">
              Certification Criteria & Live Status
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {/* FOS */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between ${passFos
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}
              >
                <div>
                  <div className="text-[10px] uppercase opacity-75">Factor of Safety</div>
                  <div className="font-bold text-sm">
                    {fos.toFixed(2)} &ge; {constraints.minFactorOfSafety}
                  </div>
                </div>
                {passFos ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>

              {/* Mass */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between ${passMass
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}
              >
                <div>
                  <div className="text-[10px] uppercase opacity-75">Structural Mass</div>
                  <div className="font-bold text-sm">
                    {mass.toFixed(0)} kg &le; {constraints.maxMassKg} kg
                  </div>
                </div>
                {passMass ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>

              {/* Cost */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between ${passCost
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}
              >
                <div>
                  <div className="text-[10px] uppercase opacity-75">Component Budget</div>
                  <div className="font-bold text-sm">
                    ${cost.toFixed(0)} &le; ${constraints.maxBudgetDollars}
                  </div>
                </div>
                {passCost ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>

              {/* Deflection */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between ${passDefl
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}
              >
                <div>
                  <div className="text-[10px] uppercase opacity-75">Max Deflection</div>
                  <div className="font-bold text-sm">
                    {deflMm.toFixed(1)} mm &le; {constraints.maxDeflectionMm} mm
                  </div>
                </div>
                {passDefl ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAllPassed ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                ALL OBJECTIVES SATISFIED!
              </span>
            ) : (
              <span className="text-slate-400">Optimize members in the viewport to satisfy criteria.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestAndCelebrate}
              className={`px-4 py-2 rounded font-bold transition-all cursor-pointer ${isAllPassed
                  ? 'bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
            >
              Verify Certification
            </button>
            <button
              onClick={() => setShowChallengeModal(false)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold"
            >
              Continue Engineering
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
