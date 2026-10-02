'use client';

import React from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import { BookOpen, X } from 'lucide-react';

export default function TheoryModal() {
  const showFormulasModal = useSimulationStore((s) => s.showFormulasModal);
  const setShowFormulasModal = useSimulationStore((s) => s.setShowFormulasModal);

  if (!showFormulasModal) return null;

  const theoryCards = [
    {
      title: '1. The Direct Stiffness Method (DSM)',
      formula: '[K] * {u} = {F}',
      explanation:
        'The backbone of modern Finite Element Analysis (FEA). Each structural bar contributes an element stiffness matrix ke = (EA/L) * [lambda][lambda]^T into the global stiffness matrix [K]. By applying boundary conditions (pinned/roller supports), we invert the system to solve for exact 3D nodal displacements {u}.',
      variables: [
        '[K] : Global Structural Stiffness Matrix (N/m)',
        '{u} : Vector of 3D Nodal Displacements (m)',
        '{F} : Vector of Applied Point Forces & Reactions (N)',
      ],
    },
    {
      title: "2. Hooke's Law & 1D Axial Stress",
      formula: 'sigma = E * epsilon = F_axial / A',
      explanation:
        'Pin-jointed trusses experience pure axial loading (no transverse bending inside the bar). Tension elongates the member; compression shortens it. When axial stress exceeds yield strength (sigma_y), plastic deformation and tensile necking occur.',
      variables: [
        'sigma : Axial Normal Stress (Pa or MPa)',
        "E : Young's Modulus of Elasticity (e.g. 200 GPa for steel)",
        'epsilon : Engineering Strain (dL / L)',
        'A : Cross-Sectional Area (m²)',
      ],
    },
    {
      title: '3. Euler Column Buckling (Elastic Instability)',
      formula: 'P_cr = (pi^2 * E * I) / L^2',
      explanation:
        'Leonard Euler discovered that slender compressive columns buckle sideways at a load far below their crushing yield strength! Notice that critical buckling load is quadrupled if length is cut in half (1/L²), and is drastically increased by using hollow tubular profiles with larger second moment of area (I).',
      variables: [
        'P_cr : Critical Elastic Buckling Load (N)',
        'I : Second Moment of Area (pi * r^4 / 4 for solid rods, m⁴)',
        'L : Unsupported Member Length (m)',
      ],
    },
    {
      title: '4. Factor of Safety (FOS) & Failure Margin',
      formula: 'FOS = min( sigma_yield / sigma_max, P_cr / |P_comp| )',
      explanation:
        'Engineering codes require structures to carry substantially more than their rated service loads to account for material defects, wind gusts, and thermal expansion. In civil infrastructure, FOS is typically 1.5 to 2.0; in aerospace, it is tightly held around 1.25 to 1.5 to save mass.',
      variables: [
        'FOS >= 1.5 : Safe, code-compliant design',
        '1.0 <= FOS < 1.5 : Marginal / Under-designed',
        'FOS < 1.0 : Inevitable Yielding or Buckling Failure',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Engineering Mechanics & FEA Theory
              </h2>
              <span className="text-[11px] text-cyan-400">
                Module 1: Statics, Trusses & Stability
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowFormulasModal(false)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {theoryCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs">{card.title}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                  Principle {idx + 1}
                </span>
              </div>

              {/* Formula Callout */}
              <div className="p-2.5 bg-slate-900 border border-cyan-500/30 rounded text-center text-cyan-300 font-bold text-sm tracking-wider">
                {card.formula}
              </div>

              <p className="text-slate-300 text-[11px] leading-relaxed">{card.explanation}</p>

              <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80 space-y-1">
                {card.variables.map((v, vIdx) => (
                  <div key={vIdx} className="text-[10px] text-slate-400">
                    &bull; {v}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setShowFormulasModal(false)}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
