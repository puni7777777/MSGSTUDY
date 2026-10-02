'use client';

import React from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import { X, Calendar, BookOpen, Layers, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function UpcomingSubjectModal() {
  const upcomingSubjectPreview = useSimulationStore((s) => s.upcomingSubjectPreview);
  const setUpcomingSubjectPreview = useSimulationStore((s) => s.setUpcomingSubjectPreview);

  if (!upcomingSubjectPreview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 font-mono text-slate-100 select-none max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                {upcomingSubjectPreview.code}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Curriculum in Development
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1.5">
              {upcomingSubjectPreview.subject}
            </h2>
            <p className="text-xs text-slate-400">{upcomingSubjectPreview.department}</p>
          </div>

          <button
            onClick={() => setUpcomingSubjectPreview(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Details */}
        <div className="mt-4 space-y-4 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Course Description & Lab Objectives
            </span>
            <p className="text-slate-300 leading-relaxed">
              {upcomingSubjectPreview.description}
            </p>
          </div>

          {/* Grid Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                Scheduled Term
              </span>
              <span className="text-slate-200 font-bold text-sm">
                {upcomingSubjectPreview.semester}
              </span>
            </div>
            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                Academic Credits
              </span>
              <span className="text-slate-200 font-bold text-sm">
                {upcomingSubjectPreview.credits}
              </span>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-1">
              Course Prerequisites
            </span>
            <span className="text-cyan-300 font-medium">{upcomingSubjectPreview.prerequisites}</span>
          </div>

          {/* Planned Topics */}
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-2">
              Laboratory Syllabus Topics
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {upcomingSubjectPreview.topics.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/50 border border-slate-800 text-slate-300 text-[11px]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-white block mb-0.5">Active Laboratory Available Now:</strong>
              <span>
                You can currently run the live interactive 3D simulation for{' '}
                <strong>ME-201: Statics & FEA</strong> with real-time stiffness solvers and Euler buckling analysis.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setUpcomingSubjectPreview(null)}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Return to ME-201 Active Lab
          </button>
        </div>
      </div>
    </div>
  );
}
