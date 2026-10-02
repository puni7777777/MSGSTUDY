'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import { SUBJECTS_CATALOG, getSubjectById } from '../../content/courses/subjects';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Award,
  Sparkles,
  Info,
  ArrowLeft,
  LayoutGrid,
} from 'lucide-react';

export default function CourseSubjectCardHeader({ subjectOverride }) {
  const router = useRouter();
  const activeSubjectId = useSimulationStore((s) => s.activeSubjectId);
  const isCourseMetaCollapsed = useSimulationStore((s) => s.isCourseMetaCollapsed);
  const setActiveSubject = useSimulationStore((s) => s.setActiveSubject);
  const toggleCourseMetaCollapsed = useSimulationStore((s) => s.toggleCourseMetaCollapsed);

  const activeSubject =
    subjectOverride ||
    SUBJECTS_CATALOG.find((s) => s.id === activeSubjectId) ||
    SUBJECTS_CATALOG[0];

  const handleSubjectChange = (newSubjectId) => {
    const selected = getSubjectById(newSubjectId);
    if (!selected) return;

    setActiveSubject(selected.id);
    router.push(`/subjects/${selected.slug || selected.id}`);
  };

  return (
    <div className="relative z-40 w-full bg-slate-900/95 border-b border-slate-800 text-slate-100 font-mono select-none transition-all duration-200">
      {/* Top Academic Banner */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80">
        {/* Navigation & Subject Title */}
        <div className="flex items-center gap-3">
          {/* Back to All Subjects Portal Button */}
          <Link
            href="/"
            title="Return to All Engineering Subjects Portal"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-semibold">All Subjects</span>
          </Link>

          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold tracking-wide">
                {activeSubject.code}
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                {activeSubject.subject}
              </h1>
              {activeSubject.status === 'active' ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Virtual Lab (60 FPS)
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Interactive Lab Preview
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeSubject.department} &bull; {activeSubject.courseName}
            </p>
          </div>
        </div>

        {/* Multi-Subject Switcher & Collapse Toggle */}
        <div className="flex items-center gap-2">
          {/* Subject Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
            <LayoutGrid className="w-3 h-3 text-cyan-400 hidden sm:inline" />
            <span className="text-[10px] text-slate-400 uppercase tracking-widest hidden md:inline">
              Switch Course:
            </span>
            <select
              value={activeSubject.id}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="bg-transparent text-cyan-300 font-semibold text-xs focus:outline-none cursor-pointer pr-1"
            >
              {SUBJECTS_CATALOG.map((subj) => (
                <option
                  key={subj.id}
                  value={subj.id}
                  className="bg-slate-900 text-slate-200"
                >
                  {subj.code}: {subj.shortTitle} {subj.status === 'active' ? '(Active)' : '(Preview)'}
                </option>
              ))}
            </select>
          </div>

          {/* Details Expand/Collapse button */}
          <button
            onClick={toggleCourseMetaCollapsed}
            title={isCourseMetaCollapsed ? 'Expand course curriculum metadata' : 'Collapse metadata drawer'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">
              {isCourseMetaCollapsed ? 'Course Info' : 'Collapse'}
            </span>
            {isCourseMetaCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Course Metadata Drawer (Overlay Popover) */}
      {!isCourseMetaCollapsed && (
        <div className="absolute top-full left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-2xl px-4 py-3 text-xs animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-2.5">
            {/* Level & Term */}
            <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <Calendar className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Academic Term & Level
                </span>
                <span className="text-slate-200 font-medium text-[11px]">
                  {activeSubject.semester} &bull; {activeSubject.level}
                </span>
              </div>
            </div>

            {/* Credits & Workload */}
            <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <Award className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Credits & Structure
                </span>
                <span className="text-slate-200 font-medium text-[11px]">
                  {activeSubject.credits}
                </span>
              </div>
            </div>

            {/* Prerequisites */}
            <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <Layers className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Course Prerequisites
                </span>
                <span className="text-slate-200 font-medium text-[11px] truncate block" title={activeSubject.prerequisites}>
                  {activeSubject.prerequisites}
                </span>
              </div>
            </div>

            {/* Instruction Group */}
            <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Academic Division
                </span>
                <span className="text-slate-200 font-medium text-[11px] truncate block" title={activeSubject.instructor}>
                  {activeSubject.instructor}
                </span>
              </div>
            </div>
          </div>

          {/* Syllabus Topics & Synopsis */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-cyan-400" /> Syllabus Topics:
              </span>
              {activeSubject.topics.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 text-[10px] border border-slate-700/80 hover:border-cyan-500/40 transition-colors"
                >
                  #{t}
                </span>
              ))}
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Multi-Subject Navigation Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
