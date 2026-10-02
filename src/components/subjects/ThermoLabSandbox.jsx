'use client';

import React, { useState, useMemo } from 'react';
import { Flame, Gauge, Zap, Wind, RotateCcw, Play, CheckCircle2 } from 'lucide-react';

export default function ThermoLabSandbox({ subject }) {
  // 2D Heat Diffusion Simulation States
  const [tLeft, setTLeft] = useState(450); // Kelvin
  const [tRight, setTRight] = useState(300); // Kelvin
  const [tTop, setTTop] = useState(380); // Kelvin
  const [tBottom, setTBottom] = useState(320); // Kelvin
  const [conductivity, setConductivity] = useState(50); // W/m-K (Structural Steel)
  const [activeCycle, setActiveCycle] = useState('rankine'); // 'rankine' | 'brayton'

  // Material thermal presets
  const materials = [
    { name: 'Structural Steel (A36)', k: 50 },
    { name: 'Aluminum 6061-T6', k: 167 },
    { name: 'Copper Alloy C11000', k: 390 },
    { name: 'Titanium Ti-6Al-4V', k: 7.2 },
    { name: 'Refractory Ceramic', k: 1.4 },
  ];

  // Discretized 2D grid temperature field (5x5 steady-state Laplace conduction)
  const gridTemps = useMemo(() => {
    const size = 5;
    const grid = [];
    for (let r = 0; r < size; r++) {
      const row = [];
      const vRatio = r / (size - 1);
      for (let c = 0; c < size; c++) {
        const hRatio = c / (size - 1);
        // Bilinear interpolation for steady-state conduction boundary values
        const tHoriz = tLeft * (1 - hRatio) + tRight * hRatio;
        const tVert = tTop * (1 - vRatio) + tBottom * vRatio;
        const temp = Math.round((tHoriz + tVert) / 2);
        row.push(temp);
      }
      grid.push(row);
    }
    return grid;
  }, [tLeft, tRight, tTop, tBottom]);

  // Heat flux calculation: q" = -k * dT/dx (Watts/m²)
  const deltaT = Math.abs(tLeft - tRight);
  const thickness = 0.05; // 50mm plate
  const heatFlux = Math.round((conductivity * deltaT) / thickness);

  // Power cycle thermodynamic calculations
  const cycleMetrics = useMemo(() => {
    if (activeCycle === 'rankine') {
      // Rankine steam power cycle model
      const tBoiler = 550; // °C
      const tCondenser = 45; // °C
      const pBoiler = 10; // MPa
      const pCondenser = 0.01; // MPa
      const carnotEff = 1 - (tCondenser + 273.15) / (tBoiler + 273.15);
      const actualEff = carnotEff * 0.68;
      const powerOutput = 350; // MW
      return {
        name: 'Superheated Rankine Steam Power Cycle',
        fluids: 'H₂O (Two-Phase Steam / Water)',
        efficiency: (actualEff * 100).toFixed(1),
        carnotLimit: (carnotEff * 100).toFixed(1),
        heatIn: (powerOutput / actualEff).toFixed(1),
        heatRejected: ((powerOutput / actualEff) * (1 - actualEff)).toFixed(1),
        powerOutput,
        states: [
          { state: '1 → 2', process: 'Isentropic Compression (Boiler Feed Pump)', p: '10 MPa', t: '48°C' },
          { state: '2 → 3', process: 'Constant-Pressure Heat Addition (Steam Generator)', p: '10 MPa', t: '550°C' },
          { state: '3 → 4', process: 'Isentropic Expansion (High/Low HP Turbines)', p: '0.01 MPa', t: '82°C' },
          { state: '4 → 1', process: 'Constant-Pressure Condensation (Water-Cooled)', p: '0.01 MPa', t: '45°C' },
        ],
      };
    } else {
      // Brayton gas turbine cycle model
      const pressureRatio = 16;
      const gamma = 1.4;
      const braytonEff = 1 - 1 / Math.pow(pressureRatio, (gamma - 1) / gamma);
      const actualEff = braytonEff * 0.72;
      const powerOutput = 180; // MW
      return {
        name: 'Industrial Brayton Open-Loop Gas Turbine',
        fluids: 'Dry Air / Combustion Gases',
        efficiency: (actualEff * 100).toFixed(1),
        carnotLimit: (braytonEff * 100).toFixed(1),
        heatIn: (powerOutput / actualEff).toFixed(1),
        heatRejected: ((powerOutput / actualEff) * (1 - actualEff)).toFixed(1),
        powerOutput,
        states: [
          { state: '1 → 2', process: 'Isentropic Compression (Axial Compressor)', p: '1.6 MPa', t: '410°C' },
          { state: '2 → 3', process: 'Constant-Pressure Combustion (Combustor)', p: '1.6 MPa', t: '1350°C' },
          { state: '3 → 4', process: 'Isentropic Expansion (Gas Turbine Expander)', p: '0.1 MPa', t: '580°C' },
          { state: '4 → 1', process: 'Atmospheric Exhaust & Fresh Intake', p: '0.1 MPa', t: '25°C' },
        ],
      };
    }
  }, [activeCycle]);

  // Helper color gradient for temperature field (Kelvin: 280 to 550)
  const getTempColor = (t) => {
    const minT = 280;
    const maxT = 550;
    const norm = Math.max(0, Math.min(1, (t - minT) / (maxT - minT)));
    if (norm < 0.25) return 'bg-blue-600 text-white';
    if (norm < 0.5) return 'bg-cyan-500 text-slate-950';
    if (norm < 0.75) return 'bg-amber-500 text-slate-950';
    return 'bg-red-600 text-white';
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-200 font-mono">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-bold">
                {subject.code}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {subject.subject}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Interactive Thermal Sandbox &bull; 2D Conduction FEA &bull; Power Cycles Simulator
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              Thermal Sandbox Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 2D Heat Conduction FEA Mesh (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Module 1: 2D Steady-State Heat Conduction FEA
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Fourier Law: q&quot; = -k &nabla;T
            </span>
          </div>

          {/* 2D Discretized Plate Grid View */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 mb-2 font-semibold">
              Top Boundary: {tTop} K ({(tTop - 273.15).toFixed(0)}°C)
            </div>

            <div className="flex items-center gap-3">
              <div className="text-[10px] text-slate-400 [writing-mode:vertical-lr] rotate-180 font-semibold">
                Left: {tLeft} K
              </div>

              {/* 5x5 FEA Nodes */}
              <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-900 rounded-lg border border-slate-700">
                {gridTemps.map((row, r) =>
                  row.map((t, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={`w-14 h-11 sm:w-16 sm:h-12 rounded flex flex-col items-center justify-center font-bold text-xs transition-all duration-200 shadow-inner ${getTempColor(
                        t
                      )}`}
                    >
                      <span>{t} K</span>
                      <span className="text-[9px] opacity-80">
                        {(t - 273.15).toFixed(0)}°C
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="text-[10px] text-slate-400 [writing-mode:vertical-lr] font-semibold">
                Right: {tRight} K
              </div>
            </div>

            <div className="text-[10px] text-slate-400 mt-2 font-semibold">
              Bottom Boundary: {tBottom} K ({(tBottom - 273.15).toFixed(0)}°C)
            </div>
          </div>

          {/* Telemetry and Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Conductive Heat Flux (q&quot;)
              </span>
              <span className="text-base font-bold text-orange-400">
                {heatFlux.toLocaleString()} W/m²
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Across 50mm plate
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Thermal Conductivity (k)
              </span>
              <span className="text-base font-bold text-cyan-400">
                {conductivity} W/m&bull;K
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Material resistance
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Temperature Gradient (&Delta;T)
              </span>
              <span className="text-base font-bold text-emerald-400">
                {deltaT} K
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Driving thermal potential
              </span>
            </div>
          </div>

          {/* Boundary Temperature Adjusters */}
          <div className="space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 text-xs">
            <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
              FEA Boundary Condition Controls
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 flex justify-between">
                  <span>Left Dirichlet Boundary (T_1):</span>
                  <span className="text-orange-300 font-bold">{tLeft} K</span>
                </label>
                <input
                  type="range"
                  min="300"
                  max="550"
                  step="5"
                  value={tLeft}
                  onChange={(e) => setTLeft(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 flex justify-between">
                  <span>Right Dirichlet Boundary (T_2):</span>
                  <span className="text-cyan-300 font-bold">{tRight} K</span>
                </label>
                <input
                  type="range"
                  min="280"
                  max="450"
                  step="5"
                  value={tRight}
                  onChange={(e) => setTRight(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>
            </div>

            {/* Material Presets */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1.5 uppercase">
                Preset Engineering Materials:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {materials.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => setConductivity(m.k)}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer border ${
                      conductivity === m.k
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {m.name} ({m.k} W/m-K)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Thermodynamic Power Cycles (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Module 2: Applied Power Cycles
              </h3>
            </div>
            {/* Cycle Selector Tabs */}
            <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
              <button
                onClick={() => setActiveCycle('rankine')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  activeCycle === 'rankine'
                    ? 'bg-orange-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rankine
              </button>
              <button
                onClick={() => setActiveCycle('brayton')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  activeCycle === 'brayton'
                    ? 'bg-orange-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Brayton
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">{cycleMetrics.name}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Working Fluid: <span className="text-cyan-300">{cycleMetrics.fluids}</span>
            </p>
          </div>

          {/* Efficiency Key Indicators */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                Thermal Efficiency (&eta;_th)
              </span>
              <span className="text-xl font-bold text-emerald-400">
                {cycleMetrics.efficiency}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Carnot Limit: {cycleMetrics.carnotLimit}%
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                Net Work Output (W_net)
              </span>
              <span className="text-xl font-bold text-cyan-400">
                {cycleMetrics.powerOutput} MW
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Heat In: {cycleMetrics.heatIn} MW
              </span>
            </div>
          </div>

          {/* Cycle State Points Table */}
          <div className="flex-1 bg-slate-950/60 rounded-lg border border-slate-800 p-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-2">
              Thermodynamic State Transitions
            </span>
            <div className="space-y-2 text-xs">
              {cycleMetrics.states.map((st, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]"
                >
                  <div>
                    <span className="font-bold text-orange-400 mr-2">{st.state}</span>
                    <span className="text-slate-300">{st.process}</span>
                  </div>
                  <div className="text-right text-[10px]">
                    <span className="text-cyan-400 font-bold block">{st.p}</span>
                    <span className="text-slate-400">{st.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Equation Badge */}
          <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-[11px] text-orange-300">
            <strong>First Law Control Volume:</strong> q_in - w_net = &Delta;h + &Delta;ke + &Delta;pe
          </div>
        </div>
      </div>

      {/* Curriculum Syllabus Modules Accordion */}
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
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
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
