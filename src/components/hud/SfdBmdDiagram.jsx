'use client';

import React, { useEffect, useRef } from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import { computeBeamDiagrams } from '../../core/solvers/beamDiagrams';
import { getAllMissions } from '../../core/missions/missionRegistry';
import { BarChart3, X } from 'lucide-react';

export default function SfdBmdDiagram() {
  const canvasRef = useRef(null);
  const showSfdBmd = useSimulationStore((s) => s.showSfdBmd);
  const toggleSfdBmd = useSimulationStore((s) => s.toggleSfdBmd);
  const nodes = useSimulationStore((s) => s.nodes);
  const loadMultiplier = useSimulationStore((s) => s.loadMultiplier);
  const activeChallengeId = useSimulationStore((s) => s.activeChallengeId);
  const customMissions = useSimulationStore((s) => s.customMissions);

  const allMissions = getAllMissions(customMissions);
  const challenge = allMissions.find((c) => c.id === activeChallengeId);
  const span = challenge?.environment?.spanMeters || 12;

  useEffect(() => {
    if (!showSfdBmd || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pointLoads = [];
    nodes.forEach((n) => {
      if (Math.abs(n.fy) > 10) {
        pointLoads.push({ x: Math.max(0, Math.min(span, n.x)), fy: n.fy * loadMultiplier });
      }
    });

    const diagrams = computeBeamDiagrams(span, pointLoads, 100);

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#090e1a';
    ctx.fillRect(0, 0, width, height);

    const padLeft = 45;
    const padRight = 20;
    const plotW = width - padLeft - padRight;
    const plotH = (height - 60) / 2;

    const toPxX = (x) => padLeft + (x / span) * plotW;

    // SFD
    const sfdTop = 25;
    const sfdZeroY = sfdTop + plotH / 2;
    const maxShear = Math.max(5, Math.abs(diagrams.maxShearKN));

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, sfdTop, plotW, plotH);

    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(padLeft, sfdZeroY);
    ctx.lineTo(padLeft + plotW, sfdZeroY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padLeft, sfdZeroY);
    diagrams.points.forEach((pt) => {
      const px = toPxX(pt.x);
      const py = sfdZeroY - (pt.shearKN / maxShear) * (plotH / 2 - 6);
      ctx.lineTo(px, py);
    });
    ctx.lineTo(padLeft + plotW, sfdZeroY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    diagrams.points.forEach((pt, idx) => {
      const px = toPxX(pt.x);
      const py = sfdZeroY - (pt.shearKN / maxShear) * (plotH / 2 - 6);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('SHEAR FORCE V(x)', padLeft + 6, sfdTop + 14);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`Max: ${Math.abs(diagrams.maxShearKN).toFixed(1)} kN`, padLeft + plotW - 90, sfdTop + 14);

    // BMD
    const bmdTop = sfdTop + plotH + 20;
    const bmdZeroY = bmdTop + 10;
    const maxMoment = Math.max(10, Math.abs(diagrams.maxMomentKNm));

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, bmdTop, plotW, plotH);

    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(padLeft, bmdZeroY);
    ctx.lineTo(padLeft + plotW, bmdZeroY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padLeft, bmdZeroY);
    diagrams.points.forEach((pt) => {
      const px = toPxX(pt.x);
      const py = bmdZeroY + (Math.abs(pt.momentKNm) / maxMoment) * (plotH - 20);
      ctx.lineTo(px, py);
    });
    ctx.lineTo(padLeft + plotW, bmdZeroY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.fill();

    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    diagrams.points.forEach((pt, idx) => {
      const px = toPxX(pt.x);
      const py = bmdZeroY + (Math.abs(pt.momentKNm) / maxMoment) * (plotH - 20);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('BENDING MOMENT M(x)', padLeft + 6, bmdTop + 14);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`M_max: ${Math.abs(diagrams.maxMomentKNm).toFixed(1)} kN*m`, padLeft + plotW - 110, bmdTop + 14);

    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText('0m', padLeft, bmdTop + plotH + 12);
    ctx.fillText(`${(span / 2).toFixed(1)}m`, padLeft + plotW / 2 - 10, bmdTop + plotH + 12);
    ctx.fillText(`${span.toFixed(1)}m`, padLeft + plotW - 15, bmdTop + plotH + 12);
  }, [showSfdBmd, nodes, loadMultiplier, span]);

  const isCustomSim = activeChallengeId === 'custom_sim';
  const leftPositionClass = isCustomSim ? 'sm:left-44' : 'sm:left-[23.5rem]';

  if (!showSfdBmd) return null;

  return (
    <div className={`absolute bottom-4 left-4 ${leftPositionClass} w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-lg shadow-2xl p-3 z-30 font-mono select-none animate-in fade-in slide-in-from-bottom-4 duration-150`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-slate-200">Global Span SFD & BMD</span>
        </div>
        <button
          onClick={toggleSfdBmd}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-2">
        <canvas
          ref={canvasRef}
          width={360}
          height={210}
          className="w-full h-auto block rounded border border-slate-800"
        />
      </div>

      <div className="mt-2 text-[10px] text-slate-400 leading-tight">
        Tip: Notice how top/bottom chord tension and compression directly mirror the moment envelope M(x) / h.
      </div>
    </div>
  );
}
