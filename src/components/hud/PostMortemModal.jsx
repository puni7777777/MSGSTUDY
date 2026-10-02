'use client';

import React from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import {
  Flame,
  AlertTriangle,
  X,
  Wrench,
  RotateCcw,
} from 'lucide-react';

export default function PostMortemModal() {
  const showPostMortemModal = useSimulationStore((s) => s.showPostMortemModal);
  const setShowPostMortemModal = useSimulationStore((s) => s.setShowPostMortemModal);
  const destructionReport = useSimulationStore((s) => s.destructionReport);
  const stopDestructionTest = useSimulationStore((s) => s.stopDestructionTest);
  const currentCollapseStepIndex = useSimulationStore((s) => s.currentCollapseStepIndex);
  const setCollapseStep = useSimulationStore((s) => s.setCollapseStep);

  if (!showPostMortemModal || !destructionReport) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-red-500/50 rounded-xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-linear-to-r from-red-950/80 to-slate-900 border-b border-red-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600/20 border border-red-500 rounded-lg">
              <Flame className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-red-300 uppercase tracking-wider">
                Structural Teardown Autopsy
              </h2>
              <span className="text-[11px] text-slate-400">
                Failure initiated at {(destructionReport.criticalFailureLoadMultiplier * 100).toFixed(0)}% rated load
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowPostMortemModal(false)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Failure Summary Badge */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Initiating Member
              </span>
              <span className="text-sm font-bold text-red-400">
                {destructionReport.initiatingMemberId}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Primary Failure Mode
              </span>
              <span className="text-sm font-bold text-amber-400">
                {destructionReport.initiatingFailureMode}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Peak Axial Stress
              </span>
              <span className="text-sm font-semibold text-slate-200">
                {destructionReport.initiatingStressMPa.toFixed(1)} MPa
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Euler Buckling P_cr
              </span>
              <span className="text-sm font-semibold text-slate-200">
                {destructionReport.initiatingEulerPcrKN.toFixed(1)} kN
              </span>
            </div>
          </div>

          {/* Engineering Diagnosis */}
          <div className="bg-red-950/20 p-3.5 rounded-lg border border-red-500/30 space-y-1.5">
            <span className="text-red-300 font-bold text-[11px] flex items-center gap-1.5 uppercase">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              Engineering Mechanics Root Cause
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {destructionReport.engineeringDiagnosis}
            </p>
          </div>

          {/* Redesign Recommendation */}
          <div className="bg-cyan-950/20 p-3.5 rounded-lg border border-cyan-500/30 space-y-1.5">
            <span className="text-cyan-300 font-bold text-[11px] flex items-center gap-1.5 uppercase">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              Lead Engineer&apos;s Redesign Strategy
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {destructionReport.redesignRecommendation}
            </p>
          </div>

          {/* Progressive Failure Steps */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">
              Progressive Collapse Sequence
            </span>
            <div className="space-y-1.5">
              {destructionReport.collapseSteps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setCollapseStep(idx)}
                  className={`p-2 rounded border cursor-pointer transition-colors ${currentCollapseStepIndex === idx
                      ? 'bg-slate-800 border-red-500 text-slate-100'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                >
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>Step {idx + 1}: Load {(step.loadMultiplier * 100).toFixed(0)}%</span>
                    {step.isTotalCollapse ? (
                      <span className="text-red-400 uppercase">Catastrophic Collapse</span>
                    ) : (
                      <span className="text-amber-400">Local Yield</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={stopDestructionTest}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Design
          </button>
          <button
            onClick={() => setShowPostMortemModal(false)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition-colors"
          >
            Inspect in 3D Viewport
          </button>
        </div>
      </div>
    </div>
  );
}
