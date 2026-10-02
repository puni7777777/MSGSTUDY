'use client';

import React, { useState, useMemo } from 'react';
import { Cog, Activity, ShieldAlert, CheckCircle2, Target } from 'lucide-react';

export default function MachineDesignSandbox({ subject }) {
  // Multiaxial stress states (MPa)
  const [sigmaX, setSigmaX] = useState(120); // Normal stress X (MPa)
  const [sigmaY, setSigmaY] = useState(40); // Normal stress Y (MPa)
  const [tauXY, setTauXY] = useState(55); // Shear stress XY (MPa)

  // Material Yield Strength
  const yieldStrength = 250; // MPa (ASTM A36 / 1020 Steel)
  const enduranceLimit = 130; // MPa (Rotary Bending Fatigue Limit S_e)

  // Mohr's circle and principal stresses calculation
  const mohr = useMemo(() => {
    const sigmaAvg = (sigmaX + sigmaY) / 2;
    const diff = (sigmaX - sigmaY) / 2;
    const radius = Math.sqrt(Math.pow(diff, 2) + Math.pow(tauXY, 2));

    const sigma1 = sigmaAvg + radius; // Major principal stress
    const sigma2 = sigmaAvg - radius; // Minor principal stress
    const tauMax = radius; // Maximum in-plane shear stress

    // Principal angle in degrees
    const thetaP = (0.5 * Math.atan2(2 * tauXY, sigmaX - sigmaY) * (180 / Math.PI)).toFixed(1);

    // von Mises Equivalent Stress: σ_v = √(σ1² - σ1*σ2 + σ2²)
    const vonMises = Math.sqrt(Math.pow(sigma1, 2) - sigma1 * sigma2 + Math.pow(sigma2, 2));
    const factorOfSafetyVonMises = (yieldStrength / vonMises).toFixed(2);

    // Tresca Max Shear Criterion: τ_max ≤ S_y / 2 => 2*τ_max ≤ S_y
    const factorOfSafetyTresca = (yieldStrength / (2 * tauMax)).toFixed(2);

    // Fatigue Assessment (Goodman Relation: σ_a / S_e + σ_m / S_ut = 1/n)
    const sigmaM = Math.max(0, sigmaAvg); // Mean stress
    const sigmaA = radius; // Alternating stress amplitude
    const sut = 400; // Ultimate tensile strength MPa
    const goodmanDemand = sigmaA / enduranceLimit + sigmaM / sut;
    const fatigueLifeStatus =
      goodmanDemand < 1.0 ? 'Infinite Life (> 10⁶ cycles)' : 'Finite Life (Failure Expected)';

    return {
      sigmaAvg: Math.round(sigmaAvg),
      radius: Math.round(radius),
      sigma1: Math.round(sigma1),
      sigma2: Math.round(sigma2),
      tauMax: Math.round(tauMax),
      thetaP,
      vonMises: Math.round(vonMises),
      factorOfSafetyVonMises,
      factorOfSafetyTresca,
      fatigueLifeStatus,
      goodmanDemand: goodmanDemand.toFixed(2),
      isYielded: vonMises > yieldStrength,
    };
  }, [sigmaX, sigmaY, tauXY, yieldStrength, enduranceLimit]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-200 font-mono">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold">
                {subject.code}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {subject.subject}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Interactive Mohr’s Stress Circle &bull; von Mises Yield Envelope &bull; High-Cycle Fatigue Analyzer
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5">
              <Cog className="w-3.5 h-3.5 animate-spin" />
              Machine Elements Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mohr's Circle Visualizer (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Module 1: Mohr’s Circle & Principal Stress Transformation
              </h3>
            </div>

            {mohr.isYielded ? (
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> YIELD VIOLATION
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ELASTIC SAFE REGIME
              </span>
            )}
          </div>

          {/* Mohr's Circle SVG Display */}
          <div className="relative w-full h-64 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] bg-size-[16px_16px] opacity-30" />

            <svg className="w-full h-full" viewBox="0 0 500 250">
              {/* Axes: Horizontal = Normal Stress σ, Vertical = Shear Stress τ */}
              <line x1="20" y1="125" x2="480" y2="125" stroke="#64748b" strokeWidth="1.5" />
              <line x1="250" y1="20" x2="250" y2="230" stroke="#64748b" strokeWidth="1.5" />

              {/* Axis Labels */}
              <text x="475" y="115" fill="#94a3b8" fontSize="11" textAnchor="end">
                Normal Stress &sigma; (MPa)
              </text>
              <text x="260" y="30" fill="#94a3b8" fontSize="11">
                Shear Stress &tau; (MPa)
              </text>

              {/* Origin Marker */}
              <circle cx="250" cy="125" r="3" fill="#cbd5e1" />
              <text x="242" y="140" fill="#64748b" fontSize="10">
                0
              </text>

              {/* Mohr's Circle */}
              {/* Scaling: Map 0 MPa to x=250. 1 MPa = 0.8 px */}
              {(() => {
                const scale = 0.75;
                const cx = 250 + mohr.sigmaAvg * scale;
                const cy = 125;
                const r = Math.max(5, mohr.radius * scale);

                const ptX = 250 + sigmaX * scale;
                const ptY = 125 - tauXY * scale; // Inverted for SVG Y

                const ptY2 = 250 + sigmaY * scale;
                const ptY2_y = 125 + tauXY * scale;

                const p1X = 250 + mohr.sigma1 * scale;
                const p2X = 250 + mohr.sigma2 * scale;

                return (
                  <g>
                    {/* Circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="rgba(245, 158, 11, 0.08)"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      className="transition-all duration-300"
                    />

                    {/* Diameter line connecting (σ_x, -τ_xy) and (σ_y, τ_xy) */}
                    <line
                      x1={ptX}
                      y1={ptY}
                      x2={ptY2}
                      y2={ptY2_y}
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />

                    {/* Point (σ_x, τ_xy) */}
                    <circle cx={ptX} cy={ptY} r="4" fill="#38bdf8" />
                    <text x={ptX + 6} y={ptY - 4} fill="#38bdf8" fontSize="10" fontWeight="bold">
                      X ({sigmaX}, {tauXY})
                    </text>

                    {/* Center Point */}
                    <circle cx={cx} cy={cy} r="3" fill="#f59e0b" />

                    {/* Principal Stress 1 */}
                    <circle cx={p1X} cy={cy} r="4" fill="#10b981" />
                    <text x={p1X + 4} y={cy + 16} fill="#10b981" fontSize="10" fontWeight="bold">
                      &sigma;₁ = {mohr.sigma1}
                    </text>

                    {/* Principal Stress 2 */}
                    <circle cx={p2X} cy={cy} r="4" fill="#a855f7" />
                    <text x={p2X - 55} y={cy + 16} fill="#a855f7" fontSize="10" fontWeight="bold">
                      &sigma;₂ = {mohr.sigma2}
                    </text>
                  </g>
                );
              })()}
            </svg>

            <div className="absolute top-2 left-2 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
              Center: &sigma;_avg = {mohr.sigmaAvg} MPa &bull; Radius: R = {mohr.radius} MPa
            </div>
          </div>

          {/* Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Major Principal (&sigma;₁)
              </span>
              <span className="text-lg font-bold text-emerald-400">{mohr.sigma1} MPa</span>
              <span className="text-[10px] text-slate-500 block">&theta;_p = {mohr.thetaP}&deg;</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Minor Principal (&sigma;₂)
              </span>
              <span className="text-lg font-bold text-purple-400">{mohr.sigma2} MPa</span>
              <span className="text-[10px] text-slate-500 block">Orthogonal plane</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Max In-Plane Shear (&tau;_max)
              </span>
              <span className="text-lg font-bold text-amber-400">{mohr.tauMax} MPa</span>
              <span className="text-[10px] text-slate-500 block">At 45&deg; to &sigma;₁</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                von Mises Stress (&sigma;_v)
              </span>
              <span
                className={`text-lg font-bold ${
                  mohr.isYielded ? 'text-red-400' : 'text-cyan-400'
                }`}
              >
                {mohr.vonMises} MPa
              </span>
              <span className="text-[10px] text-slate-500 block">
                Limit: {yieldStrength} MPa
              </span>
            </div>
          </div>

          {/* Controls: Stress Element Inputs */}
          <div className="space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 text-xs">
            <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
              Stress Tensor Element Inputs [&sigma;]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 flex justify-between">
                  <span>Normal Stress &sigma;_x:</span>
                  <span className="text-amber-300 font-bold">{sigmaX} MPa</span>
                </label>
                <input
                  type="range"
                  min="-150"
                  max="250"
                  step="5"
                  value={sigmaX}
                  onChange={(e) => setSigmaX(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 flex justify-between">
                  <span>Normal Stress &sigma;_y:</span>
                  <span className="text-amber-300 font-bold">{sigmaY} MPa</span>
                </label>
                <input
                  type="range"
                  min="-150"
                  max="250"
                  step="5"
                  value={sigmaY}
                  onChange={(e) => setSigmaY(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 flex justify-between">
                  <span>Shear Stress &tau;_xy:</span>
                  <span className="text-sky-300 font-bold">{tauXY} MPa</span>
                </label>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="5"
                  value={tauXY}
                  onChange={(e) => setTauXY(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Static & Fatigue Failure Criteria (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Module 2: Multiaxial Failure Envelopes
              </h3>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Ductile Static Failure Theories</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Comparing Distortion Energy (von Mises) vs Maximum Shear (Tresca).
            </p>
          </div>

          {/* Safety Factors Table */}
          <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <div>
                <span className="font-bold text-cyan-300 block">von Mises Factor of Safety</span>
                <span className="text-[10px] text-slate-400">n = S_y / &sigma;_v</span>
              </div>
              <span
                className={`text-base font-bold ${
                  Number(mohr.factorOfSafetyVonMises) >= 1.0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {mohr.factorOfSafetyVonMises}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <div>
                <span className="font-bold text-amber-300 block">Tresca Factor of Safety</span>
                <span className="text-[10px] text-slate-400">n = S_y / (2 &tau;_max)</span>
              </div>
              <span
                className={`text-base font-bold ${
                  Number(mohr.factorOfSafetyTresca) >= 1.0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {mohr.factorOfSafetyTresca}
              </span>
            </div>
          </div>

          {/* High-Cycle Fatigue Life Box */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Goodman High-Cycle Fatigue Life Prediction
            </span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Fatigue Demand Ratio:</span>
              <span className="font-bold text-amber-400">{mohr.goodmanDemand}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Predicted Life:</span>
              <span
                className={`font-bold ${
                  Number(mohr.goodmanDemand) < 1.0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {mohr.fatigueLifeStatus}
              </span>
            </div>
          </div>

          {/* Formula Callout */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
            <strong>Goodman Criterion:</strong> &sigma;_a / S_e + &sigma;_m / S_ut = 1 / n
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
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
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
