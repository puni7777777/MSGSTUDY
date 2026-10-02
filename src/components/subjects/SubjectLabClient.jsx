'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import { getSubjectById } from '../../content/courses/subjects';
import CourseSubjectCardHeader from '../layout/CourseSubjectCardHeader';
import HeaderNav from '../hud/HeaderNav';
import TelemetryBar from '../hud/TelemetryBar';
import LoadScrubber from '../hud/LoadScrubber';
import BuilderToolbar from '../hud/BuilderToolbar';
import InspectorPanel from '../hud/InspectorPanel';
import SfdBmdDiagram from '../hud/SfdBmdDiagram';
import StressLegend from '../hud/StressLegend';
import ChallengeBriefingModal from '../hud/ChallengeBriefingModal';
import PostMortemModal from '../hud/PostMortemModal';
import TheoryModal from '../hud/TheoryModal';
import MissionStudioModal from '../hud/MissionStudioModal';
import UpcomingSubjectModal from '../layout/UpcomingSubjectModal';

// Specialized Subject Sandboxes
import ThermoLabSandbox from './ThermoLabSandbox';
import FluidLabSandbox from './FluidLabSandbox';
import MachineDesignSandbox from './MachineDesignSandbox';

// Dynamically import Three.js viewport for ME-201 client-only WebGL execution
const TrussViewport3D = dynamic(() => import('../canvas/TrussViewport3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-cyan-400 font-mono text-xs gap-3">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <span>INITIALIZING THREE.JS WEBGL KERNEL...</span>
    </div>
  ),
});

export default function SubjectLabClient({ subjectId }) {
  const activeSubject = getSubjectById(subjectId);
  const setActiveSubject = useSimulationStore((s) => s.setActiveSubject);

  useEffect(() => {
    if (activeSubject?.id) {
      setActiveSubject(activeSubject.id);
    }
  }, [activeSubject?.id, setActiveSubject]);

  // Case 1: ME-201 Engineering Statics & Truss FEA (The full 3D interactive laboratory)
  if (activeSubject.code === 'ME-201' || activeSubject.id === 'me-statics-fea') {
    return (
      <main className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-mono antialiased">
        {/* Master Subject & Course Laboratory Card */}
        <div className="flex-1 w-full min-h-0 flex flex-col bg-slate-900/90 backdrop-blur overflow-hidden ring-1 ring-slate-800/80">
          {/* Subject & Course Curriculum Metadata Card Header */}
          <CourseSubjectCardHeader subjectOverride={activeSubject} />

          {/* Laboratory Module Navigation & Mission Switcher */}
          <HeaderNav />

          {/* Real-time Engineering Telemetry HUD */}
          <TelemetryBar />

          {/* 3D Interactive Simulation Canvas Viewport */}
          <div className="relative flex-1 w-full h-full min-h-0 bg-slate-950 overflow-hidden">
            <TrussViewport3D />

            {/* Floating ANSYS Stress Contour Scale */}
            <StressLegend />

            {/* Floating CAD Builder / Theory Toolbar (Pinned above bottom panel with 16px margin) */}
            <div className="absolute top-4 bottom-4 left-4 z-20 flex flex-col pointer-events-none max-w-[calc(100vw-2rem)]">
              <div className="pointer-events-auto flex flex-col max-h-full">
                <BuilderToolbar />
              </div>
            </div>

            {/* Member & Joint Inspector */}
            <InspectorPanel />

            {/* Shear Force & Bending Moment Diagrams */}
            <SfdBmdDiagram />
          </div>

          {/* Bottom Load Scrubber & Destruction Trigger */}
          <LoadScrubber />
        </div>

        {/* Educational & Diagnostic Modals */}
        <ChallengeBriefingModal />
        <PostMortemModal />
        <TheoryModal />
        <MissionStudioModal />
        <UpcomingSubjectModal />
      </main>
    );
  }

  // Case 2: ME-204 Thermodynamics & Heat Transfer
  if (activeSubject.code === 'ME-204' || activeSubject.id === 'me-thermodynamics') {
    return (
      <main className="min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 p-3 sm:p-5 overflow-y-auto font-mono antialiased">
        <div className="max-w-7xl w-full mx-auto flex flex-col bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-800/80 mb-8">
          <CourseSubjectCardHeader subjectOverride={activeSubject} />
          <div className="p-4 sm:p-6">
            <ThermoLabSandbox subject={activeSubject} />
          </div>
        </div>
      </main>
    );
  }

  // Case 3: ME-301 Fluid Mechanics & Aerodynamics
  if (activeSubject.code === 'ME-301' || activeSubject.id === 'me-fluid-mechanics') {
    return (
      <main className="min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 p-3 sm:p-5 overflow-y-auto font-mono antialiased">
        <div className="max-w-7xl w-full mx-auto flex flex-col bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-800/80 mb-8">
          <CourseSubjectCardHeader subjectOverride={activeSubject} />
          <div className="p-4 sm:p-6">
            <FluidLabSandbox subject={activeSubject} />
          </div>
        </div>
      </main>
    );
  }

  // Case 4: ME-308 Machine Component Design & Fatigue
  if (activeSubject.code === 'ME-308' || activeSubject.id === 'me-machine-design') {
    return (
      <main className="min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 p-3 sm:p-5 overflow-y-auto font-mono antialiased">
        <div className="max-w-7xl w-full mx-auto flex flex-col bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-800/80 mb-8">
          <CourseSubjectCardHeader subjectOverride={activeSubject} />
          <div className="p-4 sm:p-6">
            <MachineDesignSandbox subject={activeSubject} />
          </div>
        </div>
      </main>
    );
  }

  // Fallback default
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 font-mono">
      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold text-red-400">Subject Not Found</h2>
        <p className="text-xs text-slate-400">Identifier: {subjectId}</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-colors"
        >
          Return to All Subjects Portal
        </Link>
      </div>
    </main>
  );
}
