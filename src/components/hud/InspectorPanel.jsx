'use client';

import React from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import { MATERIAL_DATABASE, PRESET_SECTIONS } from '../../core/materials';
import { X, Layers, Compass } from 'lucide-react';

export default function InspectorPanel() {
  const selectedNodeId = useSimulationStore((s) => s.selectedNodeId);
  const selectedMemberId = useSimulationStore((s) => s.selectedMemberId);
  const nodes = useSimulationStore((s) => s.nodes);
  const members = useSimulationStore((s) => s.members);
  const solverResult = useSimulationStore((s) => s.solverResult);

  const selectNode = useSimulationStore((s) => s.selectNode);
  const selectMember = useSimulationStore((s) => s.selectMember);
  const updateMemberMaterial = useSimulationStore((s) => s.updateMemberMaterial);
  const updateMemberSection = useSimulationStore((s) => s.updateMemberSection);
  const updateNodeSupport = useSimulationStore((s) => s.updateNodeSupport);
  const updateNodeLoad = useSimulationStore((s) => s.updateNodeLoad);

  if (!selectedNodeId && !selectedMemberId) {
    return null;
  }

  // Node Inspector View
  if (selectedNodeId) {
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;

    const disp = (solverResult.displacements && solverResult.displacements[node.id]) || [0, 0, 0];
    const dispMagMm = Math.sqrt(disp[0] * disp[0] + disp[1] * disp[1] + disp[2] * disp[2]) * 1000;
    const reaction = solverResult.reactions && solverResult.reactions[node.id];

    return (
      <div className="absolute top-4 right-4 w-80 max-h-[calc(100%-2rem)] overflow-y-auto bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-lg shadow-2xl p-4 font-mono text-xs z-30 select-none animate-in fade-in slide-in-from-right-4 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">Joint Inspector: {node.id}</span>
          </div>
          <button
            onClick={() => selectNode(null)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-3">
          {/* Coordinates */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2 rounded border border-slate-800 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">X</span>
              <span className="font-semibold text-slate-200">{node.x.toFixed(2)} m</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Y</span>
              <span className="font-semibold text-slate-200">{node.y.toFixed(2)} m</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Z</span>
              <span className="font-semibold text-slate-200">{node.z.toFixed(2)} m</span>
            </div>
          </div>

          {/* Support Boundary Condition */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
              Support Boundary Condition
            </label>
            <select
              value={node.supportType}
              onChange={(e) => updateNodeSupport(node.id, e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="free">Free (Internal Joint)</option>
              <option value="pinned">Pinned Support (Ux=0, Uy=0)</option>
              <option value="roller_x">Roller Support (Uy=0, Free X)</option>
              <option value="roller_y">Roller Support (Ux=0, Free Y)</option>
              <option value="fixed">Fixed Foundation (All Locked)</option>
            </select>
          </div>

          {/* Applied External Point Load */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
              Applied Point Force (kN)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] text-slate-400">Fx (Horizontal)</span>
                <input
                  type="number"
                  step="5"
                  value={(node.fx / 1000).toFixed(0)}
                  onChange={(e) =>
                    updateNodeLoad(node.id, parseFloat(e.target.value || '0') * 1000, node.fy, node.fz)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
                />
              </div>
              <div>
                <span className="text-[9px] text-slate-400">Fy (Vertical)</span>
                <input
                  type="number"
                  step="5"
                  value={(node.fy / 1000).toFixed(0)}
                  onChange={(e) =>
                    updateNodeLoad(node.id, node.fx, parseFloat(e.target.value || '0') * 1000, node.fz)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Real-Time FEA Telemetry for Joint */}
          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">
              Calculated Displacement
            </span>
            <div className="flex justify-between text-slate-300">
              <span>Total Deflection:</span>
              <span className="font-semibold text-cyan-300">{dispMagMm.toFixed(2)} mm</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>dx: {(disp[0] * 1000).toFixed(2)} mm</span>
              <span>dy: {(disp[1] * 1000).toFixed(2)} mm</span>
            </div>

            {reaction && (Math.abs(reaction.rx) > 10 || Math.abs(reaction.ry) > 10) && (
              <>
                <div className="h-px bg-slate-800 my-1" />
                <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">
                  Support Reaction Force
                </span>
                <div className="flex justify-between text-slate-300">
                  <span>Rx: {(reaction.rx / 1000).toFixed(1)} kN</span>
                  <span>Ry: {(reaction.ry / 1000).toFixed(1)} kN</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Member Inspector View
  const member = members.find((m) => m.id === selectedMemberId);
  if (!member) return null;

  const analysis = solverResult.members && solverResult.members[member.id];
  const mat = MATERIAL_DATABASE[member.materialId] || MATERIAL_DATABASE.structural_steel_a36;

  return (
    <div className="absolute top-4 right-4 w-84 max-h-[calc(100%-2rem)] overflow-y-auto bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-lg shadow-2xl p-4 font-mono text-xs z-30 select-none animate-in fade-in slide-in-from-right-4 duration-150">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">Member: {member.id}</span>
        </div>
        <button
          onClick={() => selectMember(null)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3 mt-3">
        {/* Nodes and Length */}
        <div className="flex justify-between bg-slate-950/60 p-2 rounded border border-slate-800 text-slate-300">
          <span>
            Joints: <strong className="text-cyan-300">{member.nodeAId} &rarr; {member.nodeBId}</strong>
          </span>
          <span>
            Length: <strong className="text-slate-100">{analysis ? analysis.length.toFixed(2) : '-'} m</strong>
          </span>
        </div>

        {/* Material Selection */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
            Material Alloy
          </label>
          <select
            value={member.materialId}
            onChange={(e) => updateMemberMaterial(member.id, e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {Object.values(MATERIAL_DATABASE).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.elasticModulus / 1e9} GPa, &sigma;y={m.yieldStrength / 1e6} MPa)
              </option>
            ))}
          </select>
        </div>

        {/* Cross-Section Profile */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
            Cross-Section Profile
          </label>
          <select
            value={member.crossSection.id}
            onChange={(e) => {
              const sec = PRESET_SECTIONS.find((s) => s.id === e.target.value);
              if (sec) updateMemberSection(member.id, sec);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {PRESET_SECTIONS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name} (Area: {(sec.area * 10000).toFixed(1)} cm²)
              </option>
            ))}
          </select>
        </div>

        {/* Mechanical Stress & Buckling Telemetry */}
        {analysis && (
          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Internal Force</span>
              <span
                className={`font-bold text-sm ${
                  analysis.axialForce > 0 ? 'text-blue-400' : 'text-orange-400'
                }`}
              >
                {(analysis.axialForce / 1000).toFixed(1)} kN
                <span className="text-[10px] font-normal ml-1">
                  ({analysis.axialForce > 0 ? 'Tension' : 'Compression'})
                </span>
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="text-[10px] text-slate-400">Axial Stress (&sigma;):</span>
              <span className="font-semibold">{(Math.abs(analysis.axialStress) / 1e6).toFixed(1)} MPa</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="text-[10px] text-slate-400">Yield Strength (&sigma;y):</span>
              <span>{(mat.yieldStrength / 1e6).toFixed(0)} MPa</span>
            </div>

            {analysis.axialForce < 0 && (
              <div className="flex justify-between items-center text-slate-300 border-t border-slate-800 pt-1">
                <span className="text-[10px] text-amber-400">Euler Buckling P_cr:</span>
                <span className="font-semibold text-amber-300">
                  {(analysis.eulerBucklingLoad / 1000).toFixed(1)} kN
                </span>
              </div>
            )}

            {/* Stress Demand / Capacity Bar */}
            <div className="pt-1">
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Demand vs Capacity</span>
                <span className="font-bold text-slate-200">
                  {(analysis.stressRatio * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, analysis.stressRatio * 100)}%` }}
                  className={`h-full rounded-full ${
                    analysis.stressRatio > 1.0
                      ? 'bg-red-500'
                      : analysis.stressRatio > 0.8
                      ? 'bg-amber-400'
                      : 'bg-cyan-400'
                  }`}
                />
              </div>
            </div>

            {/* Member Factor of Safety */}
            <div className="flex justify-between items-center pt-1 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Member FOS:</span>
              <span
                className={`font-bold text-sm px-2 py-0.5 rounded border ${
                  analysis.factorOfSafety < 1.0
                    ? 'bg-red-950/80 text-red-400 border-red-500'
                    : analysis.factorOfSafety < 1.6
                    ? 'bg-amber-950/80 text-amber-400 border-amber-500'
                    : 'bg-emerald-950/80 text-emerald-400 border-emerald-500'
                }`}
              >
                {analysis.factorOfSafety.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
