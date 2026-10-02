'use client';

import React, { useState, useMemo } from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import { MATERIAL_DATABASE } from '../../core/materials';
import {
  Calculator,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import NumericStepperInput from './NumericStepperInput';

export default function TheoryCalculationPanel() {
  const selectedMemberId = useSimulationStore((s) => s.selectedMemberId);
  const members = useSimulationStore((s) => s.members);
  const solverResult = useSimulationStore((s) => s.solverResult);

  // Active formula tab: 'stress' | 'buckling' | 'fos' | 'deflection'
  const [activeTab, setActiveTab] = useState('stress');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Determine active member for telemetry injection
  const { activeMember, activeAnalysis, isCriticalFallback } = useMemo(() => {
    if (!members || members.length === 0) {
      return { activeMember: null, activeAnalysis: null, isCriticalFallback: false };
    }

    if (selectedMemberId) {
      const found = members.find((m) => m.id === selectedMemberId);
      if (found) {
        return {
          activeMember: found,
          activeAnalysis: solverResult?.members?.[found.id] || null,
          isCriticalFallback: false,
        };
      }
    }

    // Default to the member with highest stress demand ratio
    let critical = members[0];
    let maxRatio = -1;
    for (const m of members) {
      const a = solverResult?.members?.[m.id];
      if (a && a.stressRatio > maxRatio) {
        maxRatio = a.stressRatio;
        critical = m;
      }
    }
    return {
      activeMember: critical,
      activeAnalysis: solverResult?.members?.[critical?.id] || null,
      isCriticalFallback: true,
    };
  }, [members, selectedMemberId, solverResult]);

  const mat = activeMember
    ? MATERIAL_DATABASE[activeMember.materialId] || MATERIAL_DATABASE.structural_steel_a36
    : MATERIAL_DATABASE.structural_steel_a36;

  // Derive live default inputs from active member and material
  const defaultInputs = useMemo(() => {
    if (!activeMember || !activeAnalysis) {
      return {
        forceKN: 50.0,
        areaCm2: 14.2,
        lengthM: 3.0,
        modulusGPa: 200.0,
        inertiaCm4: 150.0,
        yieldStrengthMPa: 250.0,
        kFactor: 1.0,
      };
    }
    const fKN = Number((activeAnalysis.axialForce / 1000).toFixed(2));
    const aCm2 = Number((activeMember.crossSection.area * 10000).toFixed(2));
    const lM = Number((activeAnalysis.length || 3.0).toFixed(2));
    const eGPa = Number((mat.elasticModulus / 1e9).toFixed(1));
    const iCm4 = Number((activeMember.crossSection.momentOfInertia * 1e8).toFixed(2));
    const fyMPa = Number((mat.yieldStrength / 1e6).toFixed(1));

    return {
      forceKN: fKN,
      areaCm2: Math.max(0.1, aCm2),
      lengthM: Math.max(0.1, lM),
      modulusGPa: Math.max(1, eGPa),
      inertiaCm4: Math.max(0.1, iCm4),
      yieldStrengthMPa: Math.max(1, fyMPa),
      kFactor: 1.0,
    };
  }, [activeMember, activeAnalysis, mat]);

  // Track user overrides per member
  const [overrideState, setOverrideState] = useState({ memberId: null, overrides: {} });

  const isOverridden =
    overrideState.memberId === activeMember?.id && Object.keys(overrideState.overrides).length > 0;

  const inputs = useMemo(() => {
    const effectiveOverrides =
      overrideState.memberId === activeMember?.id ? overrideState.overrides : {};
    return {
      ...defaultInputs,
      ...effectiveOverrides,
    };
  }, [defaultInputs, overrideState, activeMember?.id]);

  // Handle manual input edits
  const handleInputChange = (field, val) => {
    const num = parseFloat(val);
    setOverrideState((prev) => ({
      memberId: activeMember?.id,
      overrides: {
        ...(prev.memberId === activeMember?.id ? prev.overrides : {}),
        [field]: isNaN(num) ? 0 : num,
      },
    }));
  };

  // Re-sync with live model values
  const handleResync = () => {
    setOverrideState({ memberId: activeMember?.id, overrides: {} });
  };

  // --- Dynamic Mathematical Calculations ---

  // 1. Axial Stress: sigma = F / A
  const fNetN = inputs.forceKN * 1000;
  const aNetM2 = Math.max(0.00001, inputs.areaCm2 * 1e-4);
  const sigmaPa = fNetN / aNetM2;
  const sigmaMPa = sigmaPa / 1e6;
  const absSigmaMPa = Math.abs(sigmaMPa);
  const stressRatio = inputs.yieldStrengthMPa > 0 ? absSigmaMPa / inputs.yieldStrengthMPa : 1;

  // 2. Euler Buckling: P_cr = (pi^2 * E * I) / (K * L)^2
  const eNetPa = Math.max(1, inputs.modulusGPa) * 1e9;
  const iNetM4 = Math.max(0.0001, inputs.inertiaCm4) * 1e-8;
  const effLM = Math.max(0.1, inputs.kFactor * inputs.lengthM);
  const pCrN = (Math.PI * Math.PI * eNetPa * iNetM4) / (effLM * effLM);
  const pCrKN = pCrN / 1000;
  const compForceKN = Math.max(0, -inputs.forceKN);
  const bucklingDemandRatio = pCrKN > 0 ? compForceKN / pCrKN : 0;

  // 3. Factor of Safety (FOS)
  const fosYield = absSigmaMPa > 0 ? inputs.yieldStrengthMPa / absSigmaMPa : 99.9;
  const fosBuckle = compForceKN > 0 ? pCrKN / compForceKN : 99.9;
  const governingFOS = inputs.forceKN < 0 ? Math.min(fosYield, fosBuckle) : fosYield;

  // 4. Elongation: dL = (F * L) / (E * A)
  const dLMm = ((fNetN * inputs.lengthM) / (eNetPa * aNetM2)) * 1000;
  const strainMicro = (dLMm / (inputs.lengthM * 1000)) * 1e6;

  return (
    <div className="w-80 sm:w-88 bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-lg shadow-2xl p-3 font-mono text-xs select-none">
      {/* Header with Title and Mode Indicator */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 text-xs tracking-wide">
                THEORY &amp; FORMULAS
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-1 py-0.5 rounded font-semibold">
                Scratchpad
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none">
              Analytical Scratchpad &bull; Injected Bar Telemetry
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Theory Panel' : 'Collapse Theory Panel'}
          aria-label={isCollapsed ? 'Expand Theory Panel' : 'Collapse Theory Panel'}
        >
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Member Telemetry Sync Banner */}
          <div className="mt-2.5 p-2 bg-slate-950/80 rounded border border-slate-800/80 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Injected Member:{' '}
                <strong className="text-cyan-300 font-bold">
                  {activeMember ? activeMember.id : 'None'}
                </strong>
                {isCriticalFallback && (
                  <span className="text-amber-400 font-semibold ml-1">(Max Stress)</span>
                )}
              </span>

              {isOverridden ? (
                <button
                  onClick={handleResync}
                  title="Reset to real-time FEA values"
                  aria-label="Reset to real-time FEA values"
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-semibold cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>Sync Live</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live FEA
                </span>
              )}
            </div>

            <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
              <span>{mat.name}</span>
              <span>{activeMember?.crossSection?.name}</span>
            </div>
          </div>

          {/* Formula Tab Switcher */}
          <div className="grid grid-cols-4 gap-1 mt-2.5 bg-slate-950/60 p-1 rounded border border-slate-800 text-[10px] text-center font-bold">
            <button
              onClick={() => setActiveTab('stress')}
              className={`py-1 rounded cursor-pointer transition-all ${
                activeTab === 'stress'
                  ? 'bg-cyan-400 text-cyan-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              &sigma; = F/A
            </button>
            <button
              onClick={() => setActiveTab('buckling')}
              className={`py-1 rounded cursor-pointer transition-all ${
                activeTab === 'buckling'
                  ? 'bg-cyan-400 text-cyan-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              P_cr
            </button>
            <button
              onClick={() => setActiveTab('fos')}
              className={`py-1 rounded cursor-pointer transition-all ${
                activeTab === 'fos'
                  ? 'bg-cyan-400 text-cyan-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FOS
            </button>
            <button
              onClick={() => setActiveTab('deflection')}
              className={`py-1 rounded cursor-pointer transition-all ${
                activeTab === 'deflection'
                  ? 'bg-cyan-400 text-cyan-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              &Delta;L
            </button>
          </div>

          {/* TAB 1: 1D AXIAL STRESS */}
          {activeTab === 'stress' && (
            <div className="mt-2.5 space-y-2">
              {/* Formula Display (Non-Editable) */}
              <div className="p-2 bg-slate-950 border border-cyan-500/40 rounded text-center">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                  Hooke&apos;s Law (1D Normal Stress)
                </span>
                <div className="text-base font-black text-cyan-300 tracking-wider my-0.5 select-text">
                  &sigma; = F / A
                </div>
                <span className="text-[10px] text-slate-400">
                  Stress (&sigma;) = Axial Force (F) / Cross-Section Area (A)
                </span>
              </div>

              {/* Injected Values (Editable Numeric Inputs) */}
              <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Injected Variables (Editable)
                  </span>
                  {isOverridden && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/30">
                      Scratchpad Override
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="theory-force-input" className="text-[10px] text-slate-400 block mb-0.5">
                      Force F (kN)
                    </label>
                    <NumericStepperInput
                      id="theory-force-input"
                      ariaLabel="Axial Force"
                      step={5}
                      value={inputs.forceKN}
                      onChange={(v) => handleInputChange('forceKN', v)}
                      precision={1}
                      accent="cyan"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {inputs.forceKN >= 0 ? '+ Tension' : '- Compression'}
                    </span>
                  </div>

                  <div>
                    <label htmlFor="theory-area-input" className="text-[10px] text-slate-400 block mb-0.5">
                      Area A (cm&sup2;)
                    </label>
                    <NumericStepperInput
                      id="theory-area-input"
                      ariaLabel="Cross Section Area"
                      step={0.5}
                      min={0.1}
                      value={inputs.areaCm2}
                      onChange={(v) => handleInputChange('areaCm2', v)}
                      precision={2}
                      accent="cyan"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      ={(inputs.areaCm2 * 1e-4).toFixed(5)} m&sup2;
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label htmlFor="theory-yield-input" className="text-[10px] text-slate-400">
                      Yield Strength &sigma;_y (MPa)
                    </label>
                    <span className="text-[10px] text-slate-400">{mat.name}</span>
                  </div>
                  <NumericStepperInput
                    id="theory-yield-input"
                    ariaLabel="Yield Strength"
                    step={10}
                    min={10}
                    value={inputs.yieldStrengthMPa}
                    onChange={(v) => handleInputChange('yieldStrengthMPa', v)}
                    precision={0}
                    accent="cyan"
                  />
                </div>
              </div>

              {/* Dynamic Recalculated Solution */}
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5 select-text">
                <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">
                  Real-Time Solution
                </span>

                <div className="text-xs text-slate-300 font-mono">
                  &sigma; = ({inputs.forceKN > 0 ? '+' : ''}{inputs.forceKN} &times; 10&sup3; N) / ({(inputs.areaCm2 * 1e-4).toFixed(5)} m&sup2;)
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                  <span className="text-slate-400 text-xs">Axial Stress:</span>
                  <span className="text-sm font-black text-cyan-300">
                    {absSigmaMPa.toFixed(2)} MPa{' '}
                    <span className="text-[10px] font-normal text-slate-400">
                      ({inputs.forceKN >= 0 ? 'Tension' : 'Compression'})
                    </span>
                  </span>
                </div>

                {/* Demand Progress Bar */}
                <div className="pt-1 select-none">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Demand Ratio (&sigma; / &sigma;_y):</span>
                    <strong className="text-slate-200">{(stressRatio * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, stressRatio * 100)}%` }}
                      className={`h-full rounded-full transition-all ${
                        stressRatio > 1.0
                          ? 'bg-red-500'
                          : stressRatio > 0.85
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Status Assessment Pill */}
                <div className="pt-1 select-text">
                  {stressRatio > 1.0 ? (
                    <div className="flex items-center gap-1.5 p-1 bg-red-950/80 text-red-300 border border-red-500/50 rounded text-[10px]">
                      <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                      <span>Plastic Yield Failure: Stress exceeds &sigma;_y!</span>
                    </div>
                  ) : stressRatio > 0.85 ? (
                    <div className="flex items-center gap-1.5 p-1 bg-amber-950/80 text-amber-300 border border-amber-500/50 rounded text-[10px]">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>High Stress Warning: Near material yield capacity!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 p-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 rounded text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Elastic &amp; Safe: Stress within allowable envelope.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EULER COLUMN BUCKLING */}
          {activeTab === 'buckling' && (
            <div className="mt-2.5 space-y-2">
              {/* Formula Display (Non-Editable) */}
              <div className="p-2 bg-slate-950 border border-amber-500/40 rounded text-center">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                  Euler Column Buckling Limit
                </span>
                <div className="text-base font-black text-amber-300 tracking-wider my-0.5 select-text">
                  P_cr = (&pi;&sup2; &middot; E &middot; I) / (K &middot; L)&sup2;
                </div>
                <span className="text-[10px] text-slate-400">
                  Critical Compressive Load before Lateral Buckling
                </span>
              </div>

              {/* Injected Variables (Editable Inputs) */}
              <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Injected Variables (Editable)
                  </span>
                  {isOverridden && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/30">
                      Scratchpad Override
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="theory-modulus-input" className="text-[10px] text-slate-400 block mb-0.5">
                      Modulus E (GPa)
                    </label>
                    <NumericStepperInput
                      id="theory-modulus-input"
                      ariaLabel="Modulus of Elasticity"
                      step={5}
                      min={1}
                      value={inputs.modulusGPa}
                      onChange={(v) => handleInputChange('modulusGPa', v)}
                      precision={1}
                      accent="amber"
                    />
                  </div>

                  <div>
                    <label htmlFor="theory-inertia-input" className="text-[10px] text-slate-400 block mb-0.5">
                      Inertia I (cm&#8308;)
                    </label>
                    <NumericStepperInput
                      id="theory-inertia-input"
                      ariaLabel="Moment of Inertia"
                      step={5}
                      min={0.1}
                      value={inputs.inertiaCm4}
                      onChange={(v) => handleInputChange('inertiaCm4', v)}
                      precision={2}
                      accent="amber"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="theory-length-input" className="text-[10px] text-slate-400 block mb-0.5">
                      Length L (m)
                    </label>
                    <NumericStepperInput
                      id="theory-length-input"
                      ariaLabel="Member Length"
                      step={0.2}
                      min={0.1}
                      value={inputs.lengthM}
                      onChange={(v) => handleInputChange('lengthM', v)}
                      precision={2}
                      accent="amber"
                    />
                  </div>

                  <div>
                    <label htmlFor="theory-kfactor-input" className="text-[10px] text-slate-400 block mb-0.5">
                      End Factor K
                    </label>
                    <NumericStepperInput
                      id="theory-kfactor-input"
                      ariaLabel="End Support Factor K"
                      step={0.1}
                      min={0.5}
                      max={2.0}
                      value={inputs.kFactor}
                      onChange={(v) => handleInputChange('kFactor', v)}
                      precision={1}
                      accent="amber"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="theory-current-force-input" className="text-[10px] text-slate-400 block mb-0.5">
                    Current Force F (kN) (Tension +, Comp -)
                  </label>
                  <NumericStepperInput
                    id="theory-current-force-input"
                    ariaLabel="Applied Force"
                    step={5}
                    value={inputs.forceKN}
                    onChange={(v) => handleInputChange('forceKN', v)}
                    precision={1}
                    accent="amber"
                  />
                </div>
              </div>

              {/* Dynamic Solution */}
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5 select-text">
                <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
                  Calculated Buckling Capacity
                </span>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">Euler Limit P_cr:</span>
                  <span className="text-sm font-black text-amber-300">
                    {pCrKN.toFixed(2)} kN
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span className="text-slate-400">Compressive Demand:</span>
                  <span className="font-semibold text-slate-100">
                    {compForceKN.toFixed(2)} kN
                  </span>
                </div>

                {inputs.forceKN >= 0 ? (
                  <div className="p-1.5 bg-blue-950/70 border border-blue-500/40 rounded text-[10px] text-blue-300">
                    Member is in tension! Euler buckling only occurs under compressive loads.
                  </div>
                ) : (
                  <>
                    <div className="pt-1 select-none">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                        <span>Buckling Utilization (|F| / P_cr):</span>
                        <strong className="text-slate-200">
                          {(bucklingDemandRatio * 100).toFixed(1)}%
                        </strong>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, bucklingDemandRatio * 100)}%` }}
                          className={`h-full rounded-full transition-all ${
                            bucklingDemandRatio >= 1.0
                              ? 'bg-red-500'
                              : bucklingDemandRatio > 0.8
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="pt-1 select-text">
                      {bucklingDemandRatio >= 1.0 ? (
                        <div className="flex items-center gap-1.5 p-1 bg-red-950/80 text-red-300 border border-red-500/50 rounded text-[10px]">
                          <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                          <span>Buckled! Compressive load exceeds critical Euler threshold!</span>
                        </div>
                      ) : bucklingDemandRatio > 0.8 ? (
                        <div className="flex items-center gap-1.5 p-1 bg-amber-950/80 text-amber-300 border border-amber-500/50 rounded text-[10px]">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Buckling Risk: Slender bar near Euler instability!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 p-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 rounded text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Stable: Member resists Euler buckling with safety margin.</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FACTOR OF SAFETY (FOS) */}
          {activeTab === 'fos' && (
            <div className="mt-2.5 space-y-2">
              {/* Formula Display (Non-Editable) */}
              <div className="p-2 bg-slate-950 border border-emerald-500/40 rounded text-center">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                  Factor of Safety (FOS) Margin
                </span>
                <div className="text-sm font-black text-emerald-300 tracking-wider my-0.5 select-text">
                  FOS = min(&sigma;_y / |&sigma;|, P_cr / |P_comp|)
                </div>
                <span className="text-[10px] text-slate-400">
                  Allowable Capacity Margin (Target &ge; 1.5 - 2.0)
                </span>
              </div>

              {/* Governing Parameter Sensitivity Controls */}
              <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Sensitivity Controls
                  </span>
                  {isOverridden && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/30">
                      Scratchpad Override
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="fos-force-input" className="text-[10px] text-slate-400 block mb-0.5">
                      Force F (kN)
                    </label>
                    <NumericStepperInput
                      id="fos-force-input"
                      ariaLabel="Force F for FOS"
                      step={5}
                      value={inputs.forceKN}
                      onChange={(v) => handleInputChange('forceKN', v)}
                      precision={1}
                      accent="cyan"
                    />
                  </div>
                  <div>
                    <label htmlFor="fos-area-input" className="text-[10px] text-slate-400 block mb-0.5">
                      Area A (cm&sup2;)
                    </label>
                    <NumericStepperInput
                      id="fos-area-input"
                      ariaLabel="Area A for FOS"
                      step={0.5}
                      min={0.1}
                      value={inputs.areaCm2}
                      onChange={(v) => handleInputChange('areaCm2', v)}
                      precision={2}
                      accent="cyan"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Comparison Cards */}
              <div className="grid grid-cols-2 gap-2 select-text">
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Yield FOS</span>
                  <span className="text-sm font-bold text-cyan-300">
                    {fosYield > 50 ? '>50' : fosYield.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {inputs.yieldStrengthMPa} / {absSigmaMPa.toFixed(1)} MPa
                  </span>
                </div>

                <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Buckling FOS</span>
                  <span className="text-sm font-bold text-amber-300">
                    {inputs.forceKN >= 0 ? 'N/A (Tens)' : fosBuckle > 50 ? '>50' : fosBuckle.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {pCrKN.toFixed(1)} / {compForceKN.toFixed(1)} kN
                  </span>
                </div>
              </div>

              {/* Governing FOS Result */}
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5 select-text">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Governing FOS:</span>
                  <span
                    className={`font-black text-base px-2 py-0.5 rounded border ${
                      governingFOS < 1.0
                        ? 'bg-red-950/80 text-red-400 border-red-500'
                        : governingFOS < 1.6
                        ? 'bg-amber-950/80 text-amber-400 border-amber-500'
                        : 'bg-emerald-950/80 text-emerald-400 border-emerald-500'
                    }`}
                  >
                    {governingFOS > 50 ? '>50' : governingFOS.toFixed(2)}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400">
                  Governing Limit Mode:{' '}
                  <strong className="text-slate-200">
                    {inputs.forceKN < 0 && fosBuckle < fosYield
                      ? 'Euler Buckling (Compression)'
                      : 'Material Yield Strength (Normal Stress)'}
                  </strong>
                </div>

                <div className="pt-1">
                  {governingFOS < 1.0 ? (
                    <div className="flex items-center gap-1.5 p-1 bg-red-950/80 text-red-300 border border-red-500/50 rounded text-[10px]">
                      <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                      <span>FAILURE: Demand exceeds rated capacity (FOS &lt; 1.0)!</span>
                    </div>
                  ) : governingFOS < 1.6 ? (
                    <div className="flex items-center gap-1.5 p-1 bg-amber-950/80 text-amber-300 border border-amber-500/50 rounded text-[10px]">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>WARNING: Marginal safety factor below 1.6 civil target!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 p-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 rounded text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>SAFE: Member satisfies rigorous engineering safety standards.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEFLECTION & STRAIN */}
          {activeTab === 'deflection' && (
            <div className="mt-2.5 space-y-2">
              {/* Formula Display (Non-Editable) */}
              <div className="p-2 bg-slate-950 border border-cyan-500/40 rounded text-center">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                  Axial Bar Elongation (Hooke&apos;s Law)
                </span>
                <div className="text-base font-black text-cyan-300 tracking-wider my-0.5 select-text">
                  &Delta;L = (F &middot; L) / (E &middot; A)
                </div>
                <span className="text-[10px] text-slate-400">
                  Elastic Extension or Contraction along Bar Axis
                </span>
              </div>

              {/* Injected Variables */}
              <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Sensitivity Controls
                  </span>
                  {isOverridden && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/30">
                      Scratchpad Override
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="deflection-force-input" className="text-[10px] text-slate-400 block mb-0.5">
                      Force F (kN)
                    </label>
                    <NumericStepperInput
                      id="deflection-force-input"
                      ariaLabel="Force for Deflection"
                      step={5}
                      value={inputs.forceKN}
                      onChange={(v) => handleInputChange('forceKN', v)}
                      precision={1}
                      accent="cyan"
                    />
                  </div>
                  <div>
                    <label htmlFor="deflection-length-input" className="text-[10px] text-slate-400 block mb-0.5">
                      Length L (m)
                    </label>
                    <NumericStepperInput
                      id="deflection-length-input"
                      ariaLabel="Length for Deflection"
                      step={0.2}
                      min={0.1}
                      value={inputs.lengthM}
                      onChange={(v) => handleInputChange('lengthM', v)}
                      precision={2}
                      accent="cyan"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Solution */}
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-2 select-text">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">Axial Deformation (&Delta;L):</span>
                  <span
                    className={`text-sm font-black ${
                      dLMm >= 0 ? 'text-cyan-300' : 'text-amber-400'
                    }`}
                  >
                    {dLMm > 0 ? '+' : ''}{dLMm.toFixed(3)} mm
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-300 border-t border-slate-800 pt-1">
                  <span className="text-slate-400">Axial Strain (&epsilon;):</span>
                  <span className="font-semibold text-slate-100">
                    {strainMicro.toFixed(1)} &mu;&epsilon;
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 leading-tight">
                  {dLMm > 0
                    ? 'Member elongates under tension load.'
                    : 'Member shortens under compressive thrust.'}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Instructions / Tip */}
          <div className="mt-2.5 flex items-start gap-1.5 text-[10px] text-slate-400 bg-slate-950/40 p-1.5 rounded border border-slate-800/60">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Click any bar in the 3D model to inject its live telemetry. You can edit any parameter above to perform &ldquo;what-if&rdquo; stress sensitivity calculations.
            </span>
          </div>
        </>
      )}
    </div>
  );
}
