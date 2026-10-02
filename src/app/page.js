'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SUBJECTS_CATALOG } from '../content/courses/subjects';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Cpu,
  Flame,
  Wind,
  Cog,
  Boxes,
  Compass,
  FileText,
  ShieldAlert,
  Binary,
} from 'lucide-react';

export default function EngineeringHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'active' | 'year2' | 'year3'

  // Icon mapping helper
  const getSubjectIcon = (iconName, accentColor) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-6 h-6 text-orange-400" />;
      case 'Wind':
        return <Wind className="w-6 h-6 text-sky-400" />;
      case 'Cog':
        return <Cog className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />;
      case 'Truss':
      default:
        return <Boxes className="w-6 h-6 text-cyan-400" />;
    }
  };

  // Filter and search subjects
  const filteredSubjects = useMemo(() => {
    return SUBJECTS_CATALOG.filter((subj) => {
      // Filter tab check
      if (selectedFilter === 'active' && subj.status !== 'active') return false;
      if (selectedFilter === 'year2' && !subj.level.includes('Year 2')) return false;
      if (selectedFilter === 'year3' && !subj.level.includes('Year 3')) return false;

      // Search query check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        subj.code.toLowerCase().includes(q) ||
        subj.subject.toLowerCase().includes(q) ||
        subj.shortTitle.toLowerCase().includes(q) ||
        subj.description.toLowerCase().includes(q) ||
        subj.topics.some((t) => t.toLowerCase().includes(q)) ||
        subj.prerequisites.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedFilter]);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-mono selection:bg-cyan-500 selection:text-slate-950 antialiased">
      {/* Top Academic Portal Bar */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & School Badge */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-colors">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  THE TEARDOWN LAB
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                  FailForward ME
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans tracking-wide">
                Dept. of Mechanical & Aerospace Engineering &bull; Virtual Labs
              </p>
            </div>
          </Link>

          {/* Quick Header Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/subjects/me-201"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all duration-150 shadow-md shadow-cyan-900/30 hover:shadow-cyan-500/20"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Launch ME-201 Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-12 sm:py-16 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950 overflow-hidden">
        {/* Subtle background engineering grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Accreditation Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-xs text-slate-300 mb-6 shadow-inner">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-semibold tracking-wide">
              ABET ACCREDITED COMPUTATIONAL CURRICULUM &bull; SPRING / FALL 2026
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-4xl leading-tight">
            Physics-First Virtual Engineering Laboratories
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed font-sans">
            Explore fundamental principles of finite element analysis, thermodynamics, subsonic aerodynamics, and machine design by building, testing, and intentionally breaking structures under catastrophic loads.
          </p>

          {/* Key Metrics Strip */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-cyan-400">4</span>
              <span className="text-[11px] text-slate-400 uppercase mt-0.5">Core Subjects</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">19</span>
              <span className="text-[11px] text-slate-400 uppercase mt-0.5">Lab Experiments</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-amber-400">60 FPS</span>
              <span className="text-[11px] text-slate-400 uppercase mt-0.5">WebGL FEA Kernel</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-purple-400">ANSYS</span>
              <span className="text-[11px] text-slate-400 uppercase mt-0.5">Universal Scale</span>
            </div>
          </div>
        </div>
      </section>

      {/* Course Catalog Section */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6">
        {/* Controls Bar: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'all', label: 'All Subjects (4)' },
              { id: 'active', label: 'Active 3D Labs (1)' },
              { id: 'year2', label: 'Year 2 (2)' },
              { id: 'year3', label: 'Year 3 (2)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search code, FEA, buckling, cycle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Subjects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSubjects.map((subj) => {
            const isMe201 = subj.code === 'ME-201';
            const destinationHref = `/subjects/${subj.slug || subj.id}`;

            return (
              <div
                key={subj.id}
                className="group relative flex flex-col bg-slate-900/85 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 overflow-hidden ring-1 ring-slate-800/60"
              >
                {/* Glow border gradient when active */}
                {isMe201 && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500" />
                )}

                {/* Top Card Bar: Subject Code + Status Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {getSubjectIcon(subj.icon, subj.accentColor)}
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold tracking-wider">
                        {subj.code}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        {subj.credits}
                      </span>
                    </div>
                  </div>

                  {subj.status === 'active' ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active 60 FPS Lab
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Preview Lab Live
                    </span>
                  )}
                </div>

                {/* Subject Title & Department */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                    {subj.subject}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    {subj.department} &bull; {subj.courseName}
                  </p>
                </div>

                {/* Subject Description */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4 flex-1">
                  {subj.description}
                </p>

                {/* Key Laboratory Features Highlights */}
                <div className="mb-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                    Core Laboratory Solvers & Capabilities:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {subj.features.slice(0, 3).map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Syllabus Topic Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {subj.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px] border border-slate-800"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[10px] text-slate-400">
                    <span className="block font-semibold text-slate-300">{subj.semester}</span>
                    <span>{subj.level}</span>
                  </div>

                  <Link
                    href={destinationHref}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isMe201
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-900/40 hover:shadow-cyan-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span>{isMe201 ? 'Launch 3D Virtual Lab' : 'Enter Course Lab & Preview'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredSubjects.length === 0 && (
          <div className="w-full p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No engineering subjects matched your filter</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the search query or selecting &quot;All Subjects&quot;.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-cyan-400 border border-slate-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Educational Philosophy & Laboratory Pedagogy */}
      <section className="w-full bg-slate-900/50 border-t border-slate-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="p-2 w-fit rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Compass className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                FailForward Pedagogy
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Conventional engineering curricula teach static equilibrium with safety factors that mask dynamic failure modes. The Teardown Lab encourages students to push structures past yield and examine the autopsy of buckling, redistribution cascades, and catastrophic collapse.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-2 w-fit rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <Binary className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                Matrix Structural Kernels
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Solvers run directly in-browser using compiled matrix arithmetic and WebGL pipelines. From direct stiffness formulation $[K]&#123;u&#125;=&#123;F&#125;$ to 2D finite difference conduction and thin airfoil theory, calculations adhere strictly to physical governing laws.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-2 w-fit rounded-lg bg-amber-500/10 border border-amber-500/30">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                Industry-Standard Visualization
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Featuring ANSYS-style continuous rainbow contour scales, customizable stress ranges for visualizing internal load flow, interactive Mohr&apos;s circles, and real-time SFD/BMD diagrams designed for mechanical and civil engineering coursework.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-800/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">The Teardown Lab</span>
            <span>&bull;</span>
            <span>FailForward Mechanical & Aerospace Engineering Virtual Labs</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Next.js 16 &bull; Three.js &bull; Tailwind CSS</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-mono">STATUS: OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
