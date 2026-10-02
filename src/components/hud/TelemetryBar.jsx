'use client';

import React from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import { MODULE_1_CHALLENGES } from '../../content/challenges/module1-challenges';
import {
  ShieldAlert,
  ShieldCheck,
  Scale,
  DollarSign,
  Activity,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export default function TelemetryBar() {
  const solverResult = useSimulationStore((s) => s.solverResult);
  const activeChallengeId = useSimulationStore((s) => s.activeChallengeId);
  const loadMultiplier = useSimulationStore((s) => s.loadMultiplier);

  const challenge = MODULE_1_CHALLENGES.find((c) => c.id === activeChallengeId);
  const constraints = challenge?.constraints;

  const fos = solverResult.minFactorOfSafety;
  const targetFos = constraints?.minFactorOfSafety || 1.5;

  const isFosPassing = fos >= targetFos;
  const isMassPassing = !constraints || solverResult.totalMassKg <= constraints.maxMassKg;
  const isCostPassing = !constraints || solverResult.totalCostUsd <= constraints.maxBudgetDollars;
  const isDeflectionPassing =
    !constraints || solverResult.maxDeflectionMeters * 1000 <= constraints.maxDeflectionMm;

  const maxDeflectionMm = solverResult.maxDeflectionMeters * 1000;

  let fosBadgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  if (fos < 1.0 || solverResult.failedMembersCount > 0) {
    fosBadgeColor = 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
  } else if (fos < targetFos) {
    fosBadgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
  }

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono select-none">
      {/* Factor of Safety Gauge */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            Min Factor of Safety (FOS)
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-lg font-bold px-2 py-0.5 rounded border ${fosBadgeColor}`}
            >
              {solverResult.isStable ? fos.toFixed(2) : 'ERR: UNSTABLE'}
            </span>
            <span className="text-slate-400 text-[11px]">
              Target: &ge; {targetFos.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Structural Mass */}
      <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
        <Scale className={`w-4 h-4 ${isMassPassing ? 'text-slate-400' : 'text-red-400'}`} />
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Mass</span>
          <span className={`text-sm font-semibold ${isMassPassing ? 'text-slate-200' : 'text-red-400'}`}>
            {solverResult.totalMassKg.toFixed(1)} kg
            {constraints && (
              <span className="text-slate-400 text-[10px] font-normal ml-1">
                / {constraints.maxMassKg} kg
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Component Budget / Cost */}
      <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
        <DollarSign className={`w-4 h-4 ${isCostPassing ? 'text-slate-400' : 'text-red-400'}`} />
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Estimated Cost</span>
          <span className={`text-sm font-semibold ${isCostPassing ? 'text-slate-200' : 'text-red-400'}`}>
            ${solverResult.totalCostUsd.toFixed(0)}
            {constraints && (
              <span className="text-slate-400 text-[10px] font-normal ml-1">
                / ${constraints.maxBudgetDollars}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Max Deflection */}
      <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
        <Zap className={`w-4 h-4 ${isDeflectionPassing ? 'text-slate-400' : 'text-amber-400'}`} />
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Max Deflection</span>
          <span
            className={`text-sm font-semibold ${
              isDeflectionPassing ? 'text-slate-200' : 'text-amber-400'
            }`}
          >
            {maxDeflectionMm.toFixed(2)} mm
            {constraints && (
              <span className="text-slate-400 text-[10px] font-normal ml-1">
                (Limit: {constraints.maxDeflectionMm} mm)
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
        {!solverResult.isStable ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/80 border border-red-500 rounded text-red-300">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Mechanism Unstable</span>
          </div>
        ) : solverResult.failedMembersCount > 0 ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/80 border border-red-500 rounded text-red-300">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>{solverResult.failedMembersCount} Member(s) Failed</span>
          </div>
        ) : isFosPassing && isMassPassing && isCostPassing && isDeflectionPassing ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500 rounded text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Design Certified</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 border border-amber-500 rounded text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Violates Constraints</span>
          </div>
        )}

        <div className="text-slate-400 text-[11px]">
          Load: <span className="text-cyan-400 font-bold">{(loadMultiplier * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
