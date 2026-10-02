'use client';

import React, { useState, useMemo } from 'react';
import { Wind, Gauge, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function FluidLabSandbox({ subject }) {
  // Wind tunnel parameters
  const [airfoilType, setAirfoilType] = useState('2412'); // '0012' | '2412' | '4412'
  const [alpha, setAlpha] = useState(6); // Angle of attack in degrees
  const [velocity, setVelocity] = useState(45); // Freestream velocity m/s
  const [chordLength] = useState(1.2); // Chord length in meters

  // Fluid physics properties (Standard Sea Level Air)
  const airDensity = 1.225; // kg/m³
  const dynamicViscosity = 1.81e-5; // Pa-s

  // Reynolds Number: Re = (ρ * V * c) / μ
  const reynoldsNumber = Math.round((airDensity * velocity * chordLength) / dynamicViscosity);

  // Aerodynamic calculations based on thin airfoil theory and empirical stall curve
  const aero = useMemo(() => {
    // Camber offsets for NACA profiles
    let cl0 = 0.0;
    let stallAlpha = 15;
    if (airfoilType === '2412') {
      cl0 = 0.24;
      stallAlpha = 16;
    } else if (airfoilType === '4412') {
      cl0 = 0.48;
      stallAlpha = 15;
    } else {
      // 0012 symmetric
      cl0 = 0.0;
      stallAlpha = 14;
    }

    const isStalled = alpha > stallAlpha;
    const liftSlope = 0.105; // ~2π per radian ≈ 0.11 per degree

    let cl = 0;
    let cd = 0;

    if (!isStalled) {
      cl = cl0 + liftSlope * alpha;
      const cd0 = 0.008;
      const inducedDragFactor = 0.045;
      cd = cd0 + inducedDragFactor * Math.pow(cl, 2);
    } else {
      // Stalled post-stall envelope
      const maxCl = cl0 + liftSlope * stallAlpha;
      const stallDrop = (alpha - stallAlpha) * 0.08;
      cl = Math.max(0.2, maxCl - stallDrop);
      cd = 0.05 + (alpha - stallAlpha) * 0.025; // Massive separated form drag
    }

    const liftForce = 0.5 * airDensity * Math.pow(velocity, 2) * chordLength * cl;
    const dragForce = 0.5 * airDensity * Math.pow(velocity, 2) * chordLength * cd;
    const ldRatio = cd > 0 ? (cl / cd).toFixed(1) : 0;

    return {
      cl: cl.toFixed(3),
      cd: cd.toFixed(4),
      ldRatio,
      liftForce: Math.round(liftForce),
      dragForce: Math.round(dragForce),
      isStalled,
      stallAlpha,
    };
  }, [airfoilType, alpha, velocity, chordLength]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-200 font-mono">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/40 text-xs font-bold">
                {subject.code}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {subject.subject}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Virtual Subsonic Wind Tunnel &bull; NACA 4-Digit Airfoil Flow &bull; Aerodynamic Polar Simulator
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-semibold flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 animate-pulse" />
              Wind Tunnel Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Virtual Wind Tunnel Visualization (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Module 1: Subsonic Wind Tunnel Airfoil Sandbox
              </h3>
            </div>
            {aero.isStalled ? (
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 animate-bounce" />
                STALL DETECTED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                ATTACHED FLOW
              </span>
            )}
          </div>

          {/* Wind Tunnel Streamlines SVG Visualizer */}
          <div className="relative w-full h-64 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
            {/* Background Wind Tunnel Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[16px_16px] opacity-40" />

            {/* Streamlines */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="streamlineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Multiple animated-like streamline paths over/under the airfoil */}
              {[-60, -40, -20, 0, 20, 40, 60].map((offset, idx) => {
                const yBase = 128 + offset;
                const deflection = aero.isStalled
                  ? offset < 0
                    ? -offset * 0.4
                    : offset * 0.8
                  : -alpha * (offset < 0 ? 1.8 : 0.8);
                const pathD = `M 10 ${yBase} Q 200 ${yBase + deflection} 500 ${yBase + deflection * 1.4
                  }`;

                return (
                  <path
                    key={idx}
                    d={pathD}
                    fill="none"
                    stroke={
                      aero.isStalled && offset < 0 && idx > 2
                        ? '#ef4444'
                        : 'url(#streamlineGrad)'
                    }
                    strokeWidth={aero.isStalled && offset < 0 && idx > 2 ? 1.5 : 1}
                    strokeDasharray={
                      aero.isStalled && offset < 0 && idx > 2 ? '4 4' : 'none'
                    }
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Airfoil SVG Profile (Centered and rotated by alpha) */}
            <div
              className="relative z-10 transition-transform duration-200"
              style={{ transform: `rotate(${-alpha}deg)` }}
            >
              <svg width="220" height="60" viewBox="0 0 220 60">
                {/* Airfoil Teardrop Path */}
                <path
                  d="M 200 30 Q 120 10 30 25 Q 10 30 30 35 Q 120 40 200 30 Z"
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  className="shadow-lg drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                />
                {/* Chord Line */}
                <line
                  x1="30"
                  y1="30"
                  x2="200"
                  y2="30"
                  stroke="#f8fafc"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
              </svg>
            </div>

            {/* Aerodynamic Vectors Overlay */}
            <div className="absolute top-3 left-3 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
              V_&infin; = {velocity} m/s &bull; &alpha; = {alpha}&deg;
            </div>

            {aero.isStalled && (
              <div className="absolute bottom-3 right-3 text-xs font-bold text-red-400 bg-red-950/80 px-2.5 py-1 rounded border border-red-800 flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" /> Flow Separation Over Upper Surface
              </div>
            )}
          </div>

          {/* Aerodynamic Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Lift Coefficient (C_L)
              </span>
              <span className="text-lg font-bold text-sky-400">{aero.cl}</span>
              <span className="text-[10px] text-slate-500 block">
                Lift: {aero.liftForce} N
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Drag Coefficient (C_D)
              </span>
              <span
                className={`text-lg font-bold ${aero.isStalled ? 'text-red-400' : 'text-amber-400'
                  }`}
              >
                {aero.cd}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Drag: {aero.dragForce} N
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Aerodynamic Efficiency (L/D)
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {aero.ldRatio}
              </span>
              <span className="text-[10px] text-slate-500 block">Glide ratio</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Reynolds Number (Re)
              </span>
              <span className="text-lg font-bold text-indigo-400">
                {(reynoldsNumber / 1e6).toFixed(2)} &times; 10⁶
              </span>
              <span className="text-[10px] text-slate-500 block">Fully turbulent</span>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 text-xs">
            <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
              Wind Tunnel Flight Controls
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 flex justify-between">
                  <span>Angle of Attack (&alpha;):</span>
                  <span className="text-sky-300 font-bold">{alpha}&deg;</span>
                </label>
                <input
                  type="range"
                  min="-4"
                  max="20"
                  step="1"
                  value={alpha}
                  onChange={(e) => setAlpha(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 flex justify-between">
                  <span>Freestream Airspeed (V_&infin;):</span>
                  <span className="text-cyan-300 font-bold">{velocity} m/s</span>
                </label>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={velocity}
                  onChange={(e) => setVelocity(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>
            </div>

            {/* NACA Airfoil Profile Selector */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1.5 uppercase">
                Select NACA 4-Digit Profile:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: '0012', label: 'NACA 0012 (Symmetric Foil - Zero Camber)' },
                  { id: '2412', label: 'NACA 2412 (Standard Subsonic 2% Camber)' },
                  { id: '4412', label: 'NACA 4412 (High-Lift Cambered 4% Foil)' },
                ].map((af) => (
                  <button
                    key={af.id}
                    onClick={() => setAirfoilType(af.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${airfoilType === af.id
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                  >
                    {af.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Aerodynamic Theory & Polar Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Module 2: Boundary Layer & Stall Mechanics
              </h3>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">
              Navier-Stokes & Circulation Theory of Lift
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Lift originates from bound circulation &Gamma; around the airfoil: L&apos; = &rho; &infin; V_&infin; &Gamma; (Kutta-Joukowski theorem).
            </p>
          </div>

          {/* Aerodynamic Regime Highlights */}
          <div className="space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs">
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <div>
                <span className="font-bold text-white block">Linear Lift Region (&alpha; &lt; 10&deg;)</span>
                <span className="text-[11px] text-slate-400">
                  Thin airfoil theory holds: dC_L/d&alpha; &approx; 2&pi; rad&minus;&sup1; (&approx; 0.11 deg&minus;&sup1;).
                </span>
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div>
                <span className="font-bold text-white block">Adverse Pressure Gradient Region</span>
                <span className="text-[11px] text-slate-400">
                  Deceleration along upper suction surface initiates boundary layer momentum deficiency.
                </span>
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <div>
                <span className="font-bold text-white block">Leading-Edge / Trailing-Edge Stall</span>
                <span className="text-[11px] text-slate-400">
                  Flow reversal at wall (&part;u/&part;y|_w &le; 0). Total pressure loss and drag surge.
                </span>
              </div>
            </div>
          </div>

          {/* Governing Equation Box */}
          <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-[11px] text-sky-300">
            <strong>Navier-Stokes (Momentum):</strong> &rho; ( &part;u/&part;t + u &bull; &nabla;u ) = -&nabla;p + &mu; &nabla;&sup2;u + &rho; g
          </div>
        </div>
      </div>

      {/* Curriculum Syllabus Modules */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Full Course Laboratory Syllabus & Learning Modules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subject.modules.map((m, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                  {m.week}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  Lab Unit {idx + 1}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-100">{m.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
