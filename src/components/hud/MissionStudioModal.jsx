'use client';

import React, { useState, useMemo } from 'react';
import { useSimulationStore } from '../../core/store/useSimulationStore';
import {
  getAllMissions,
  serializeCurrentStateAsMission,
  downloadMissionAsJsonFile,
} from '../../core/missions/missionRegistry';
import {
  validateMission,
  normalizeMission,
  MATERIAL_ALIASES,
  SECTION_ALIASES,
  SUPPORT_ALIASES,
} from '../../core/missions/missionSchema';
import {
  X,
  Sparkles,
  Upload,
  Download,
  BookOpen,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Play,
  Trash2,
  Copy,
  Check,
  FileCode,
  Layers,
} from 'lucide-react';

const STARTER_TEMPLATE_JSON = `{
  "$schema": "https://teardownlab.com/schemas/mission.v1.json",
  "id": "custom_truss_span",
  "title": "Custom Truss Span",
  "subtitle": "Span a 10m gap and support working loads",
  "difficulty": "Intermediate",
  "estimatedMinutes": 15,
  "scenario": "Design a lightweight truss to span across two support pillars.",
  "constraints": {
    "minFactorOfSafety": 1.5,
    "maxMassKg": 1500,
    "maxBudgetDollars": 3000,
    "maxDeflectionMm": 15.0
  },
  "nodes": [
    { "id": "n0", "x": 0, "y": 0, "support": "pinned" },
    { "id": "n1", "x": 5, "y": 0, "loadY": -45.0 },
    { "id": "n2", "x": 10, "y": 0, "support": "roller" },
    { "id": "n3", "x": 2.5, "y": 2.5 },
    { "id": "n4", "x": 7.5, "y": 2.5 }
  ],
  "members": [
    { "from": "n0", "to": "n1", "material": "steel", "section": "round_50mm" },
    { "from": "n1", "to": "n2", "material": "steel", "section": "round_50mm" },
    { "from": "n3", "to": "n4", "material": "steel", "section": "tube_80x4mm" },
    { "from": "n0", "to": "n3", "material": "steel", "section": "round_50mm" },
    { "from": "n3", "to": "n1", "material": "steel", "section": "round_30mm" },
    { "from": "n1", "to": "n4", "material": "steel", "section": "round_30mm" },
    { "from": "n4", "to": "n2", "material": "steel", "section": "round_50mm" }
  ]
}`;

export default function MissionStudioModal() {
  const showMissionStudioModal = useSimulationStore((s) => s.showMissionStudioModal);
  const setShowMissionStudioModal = useSimulationStore((s) => s.setShowMissionStudioModal);
  const nodes = useSimulationStore((s) => s.nodes);
  const members = useSimulationStore((s) => s.members);
  const customMissions = useSimulationStore((s) => s.customMissions);
  const addCustomMission = useSimulationStore((s) => s.addCustomMission);
  const removeCustomMission = useSimulationStore((s) => s.removeCustomMission);
  const loadChallenge = useSimulationStore((s) => s.loadChallenge);
  const activeChallengeId = useSimulationStore((s) => s.activeChallengeId);

  // Active studio tab: 'canvas_export' | 'import_json' | 'library' | 'help'
  const [activeTab, setActiveTab] = useState('canvas_export');

  // Canvas Export Form State
  const [canvasTitle, setCanvasTitle] = useState('Custom Engineered Truss');
  const [canvasSubtitle, setCanvasSubtitle] = useState('Span structure designed in Custom Sim');
  const [canvasDifficulty, setCanvasDifficulty] = useState('Intermediate');
  const [canvasScenario, setCanvasScenario] = useState('Analyze this custom structural truss under external working loads.');
  const [canvasFos, setCanvasFos] = useState('1.5');
  const [canvasMass, setCanvasMass] = useState('2500');
  const [canvasBudget, setCanvasBudget] = useState('5000');
  const [canvasDeflection, setCanvasDeflection] = useState('20.0');

  // JSON Import State
  const [jsonInput, setJsonInput] = useState(STARTER_TEMPLATE_JSON);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [importNotification, setImportNotification] = useState(null);

  // All active missions (built-in + custom)
  const allMissions = useMemo(() => {
    return getAllMissions(customMissions);
  }, [customMissions]);

  // Validation for JSON tab
  const validationResult = useMemo(() => {
    if (!jsonInput.trim()) {
      return { isValid: false, errors: ['Please provide JSON content.'], warnings: [] };
    }
    try {
      const parsed = JSON.parse(jsonInput);
      return validateMission(parsed);
    } catch (e) {
      return { isValid: false, errors: [`JSON Syntax Error: ${e.message}`], warnings: [] };
    }
  }, [jsonInput]);

  if (!showMissionStudioModal) return null;

  // Handle saving current canvas as a mission
  const handleSaveCanvasMission = (shouldPlay = true) => {
    const serialized = serializeCurrentStateAsMission(
      nodes,
      members,
      {
        title: canvasTitle,
        subtitle: canvasSubtitle,
        difficulty: canvasDifficulty,
        scenario: canvasScenario,
      },
      {
        minFactorOfSafety: parseFloat(canvasFos) || 1.5,
        maxMassKg: parseFloat(canvasMass) || 2500,
        maxBudgetDollars: parseFloat(canvasBudget) || 5000,
        maxDeflectionMm: parseFloat(canvasDeflection) || 20.0,
      }
    );

    addCustomMission(serialized);
    if (shouldPlay) {
      setShowMissionStudioModal(false);
    } else {
      setImportNotification({ type: 'success', message: `Mission "${canvasTitle}" saved to your Library!` });
      setTimeout(() => setImportNotification(null), 3500);
    }
  };

  // Handle direct file download from canvas
  const handleDownloadCanvasMission = () => {
    const serialized = serializeCurrentStateAsMission(
      nodes,
      members,
      {
        title: canvasTitle,
        subtitle: canvasSubtitle,
        difficulty: canvasDifficulty,
        scenario: canvasScenario,
      },
      {
        minFactorOfSafety: parseFloat(canvasFos) || 1.5,
        maxMassKg: parseFloat(canvasMass) || 2500,
        maxBudgetDollars: parseFloat(canvasBudget) || 5000,
        maxDeflectionMm: parseFloat(canvasDeflection) || 20.0,
      }
    );
    downloadMissionAsJsonFile(serialized);
  };

  // Handle JSON Import
  const handleImportJson = () => {
    if (!validationResult.isValid) return;
    try {
      const parsed = JSON.parse(jsonInput);
      addCustomMission(parsed);
      setShowMissionStudioModal(false);
    } catch (err) {
      setImportNotification({ type: 'error', message: err.message });
    }
  };

  // Handle File Drop / Select
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setJsonInput(text);
      }
    };
    reader.readAsText(file);
  };

  // Copy template
  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(STARTER_TEMPLATE_JSON);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden font-mono text-xs flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-cyan-500/20 border border-cyan-500/40 rounded">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                MISSION STUDIO
                <span className="text-[10px] text-cyan-300 font-normal px-1.5 py-0.2 bg-cyan-950/60 rounded border border-cyan-500/30">
                  Universal No-Code Registry
                </span>
              </h2>
              <span className="text-[10px] text-slate-400">
                Author, export, import, and play custom structural mechanics missions
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowMissionStudioModal(false)}
            aria-label="Close Mission Studio modal"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 bg-slate-950 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('canvas_export')}
            className={`py-2 px-3 flex items-center justify-center gap-1.5 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'canvas_export'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Save from 3D Canvas</span>
          </button>
          <button
            onClick={() => setActiveTab('import_json')}
            className={`py-2 px-3 flex items-center justify-center gap-1.5 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'import_json'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import / Paste JSON</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`py-2 px-3 flex items-center justify-center gap-1.5 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'library'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Library ({allMissions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`py-2 px-3 flex items-center justify-center gap-1.5 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'help'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Syntax & Help Guide</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {importNotification && (
            <div
              className={`p-2.5 rounded border text-xs flex items-center gap-2 ${
                importNotification.type === 'error'
                  ? 'bg-red-950/70 border-red-500/40 text-red-300'
                  : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {importNotification.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              )}
              <span>{importNotification.message}</span>
            </div>
          )}

          {/* TAB 1: SAVE FROM 3D CANVAS */}
          {activeTab === 'canvas_export' && (
            <div className="space-y-3.5">
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Active Structure Detected</span>
                  <span className="font-bold text-slate-200 text-sm">
                    {nodes.length} Joints • {members.length} Members
                  </span>
                </div>
                <div className="flex gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-500/30">
                    Supports: {nodes.filter((n) => n.supportType && n.supportType !== 'free').length}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                    Point Loads: {nodes.filter((n) => Math.abs(n.fy) > 0 || Math.abs(n.fx) > 0).length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="mission-title" className="text-[10px] text-slate-400 block mb-1">
                    Mission Title
                  </label>
                  <input
                    id="mission-title"
                    type="text"
                    value={canvasTitle}
                    onChange={(e) => setCanvasTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-bold focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="mission-difficulty" className="text-[10px] text-slate-400 block mb-1">
                    Difficulty Level
                  </label>
                  <select
                    id="mission-difficulty"
                    value={canvasDifficulty}
                    onChange={(e) => setCanvasDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Introductory">Introductory</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="mission-subtitle" className="text-[10px] text-slate-400 block mb-1">
                  Subtitle / Mission Teaser
                </label>
                <input
                  id="mission-subtitle"
                  type="text"
                  value={canvasSubtitle}
                  onChange={(e) => setCanvasSubtitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="mission-scenario" className="text-[10px] text-slate-400 block mb-1">
                  Scenario & Pedagogical Briefing
                </label>
                <textarea
                  id="mission-scenario"
                  rows={2}
                  value={canvasScenario}
                  onChange={(e) => setCanvasScenario(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-300 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Target Constraints */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1.5">
                  Target Constraints (Pass/Fail Thresholds)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="constraint-min-fos" className="text-[10px] text-slate-400 block mb-0.5">Min FOS</label>
                    <input
                      id="constraint-min-fos"
                      type="number"
                      step="0.1"
                      value={canvasFos}
                      onChange={(e) => setCanvasFos(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-center"
                    />
                  </div>
                  <div>
                    <label htmlFor="constraint-max-mass" className="text-[10px] text-slate-400 block mb-0.5">Max Mass (kg)</label>
                    <input
                      id="constraint-max-mass"
                      type="number"
                      step="100"
                      value={canvasMass}
                      onChange={(e) => setCanvasMass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-center"
                    />
                  </div>
                  <div>
                    <label htmlFor="constraint-max-budget" className="text-[10px] text-slate-400 block mb-0.5">Max Budget ($)</label>
                    <input
                      id="constraint-max-budget"
                      type="number"
                      step="500"
                      value={canvasBudget}
                      onChange={(e) => setCanvasBudget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-center"
                    />
                  </div>
                  <div>
                    <label htmlFor="constraint-max-deflection" className="text-[10px] text-slate-400 block mb-0.5">Max Defl (mm)</label>
                    <input
                      id="constraint-max-deflection"
                      type="number"
                      step="1"
                      value={canvasDeflection}
                      onChange={(e) => setCanvasDeflection(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleSaveCanvasMission(true)}
                  className="flex-1 py-2 px-3 rounded bg-cyan-400 text-cyan-950 font-black hover:bg-cyan-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Play className="w-4 h-4 fill-cyan-950" />
                  <span>Save & Play Mission Now</span>
                </button>
                <button
                  onClick={handleDownloadCanvasMission}
                  className="py-2 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT / PASTE JSON */}
          {activeTab === 'import_json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Universal Mission JSON</span>
                <div className="flex gap-2">
                  <label htmlFor="mission-file-upload" className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-[10px] cursor-pointer flex items-center gap-1">
                    <FileCode className="w-3 h-3" />
                    <span>Upload File</span>
                    <input
                      id="mission-file-upload"
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleCopyTemplate}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] cursor-pointer flex items-center gap-1"
                  >
                    {copiedSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSuccess ? 'Copied!' : 'Copy Template'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={12}
                placeholder="Paste mission JSON here..."
                aria-label="Mission JSON Code Input"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-400 select-text leading-relaxed"
              />

              {/* Validation Status Strip */}
              <div
                className={`p-2 rounded border flex items-start gap-2 ${
                  validationResult.isValid
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}
              >
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block">
                    {validationResult.isValid
                      ? 'Valid Universal Mission Format — Ready to Install'
                      : 'Validation Issues Detected:'}
                  </span>
                  {!validationResult.isValid && (
                    <ul className="list-disc pl-4 text-[10px] space-y-0.5 mt-1 text-red-300/90">
                      {validationResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                  {validationResult.warnings.length > 0 && (
                    <ul className="list-disc pl-4 text-[10px] space-y-0.5 mt-1 text-amber-300/90">
                      {validationResult.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Install Button */}
              <button
                onClick={handleImportJson}
                disabled={!validationResult.isValid}
                className={`w-full py-2 px-3 rounded font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  validationResult.isValid
                    ? 'bg-cyan-400 text-cyan-950 hover:bg-cyan-300 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Install Mission & Launch in 3D</span>
              </button>
            </div>
          )}

          {/* TAB 3: MISSION LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-2">
                Available Missions in Active Session
              </span>
              <div className="space-y-2">
                {allMissions.map((m) => {
                  const isCurrent = m.id === activeChallengeId;
                  const isCustom = Boolean(m.isCustom);

                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-cyan-950/30 border-cyan-500/60 shadow-md shadow-cyan-950/50'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 truncate">{m.title}</span>
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                              isCustom
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {isCustom ? 'Custom' : 'Built-in'}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950 px-1 rounded border border-cyan-500/30">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{m.subtitle}</p>
                        <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                          <span>{m.initialNodes?.length || m.nodes?.length || 0} Joints</span>
                          <span>•</span>
                          <span>{m.initialMembers?.length || m.members?.length || 0} Bars</span>
                          <span>•</span>
                          <span>Difficulty: {m.difficulty}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => downloadMissionAsJsonFile(m)}
                          title="Download as JSON"
                          aria-label={`Download ${m.title} as JSON`}
                          className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {isCustom && (
                          <button
                            onClick={() => removeCustomMission(m.id)}
                            title="Delete custom mission"
                            aria-label={`Delete custom mission ${m.title}`}
                            className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            loadChallenge(m.id);
                            setShowMissionStudioModal(false);
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                              : 'bg-cyan-400 text-cyan-950 hover:bg-cyan-300 font-black'
                          }`}
                        >
                          {isCurrent ? 'Playing' : 'Play'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SYNTAX & HELP GUIDE (Detailed instructions) */}
          {activeTab === 'help' && (
            <div className="space-y-4 select-text">
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <h3 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Universal Mission JSON Authoring Cheat Sheet
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The Teardown Lab lets anyone author complete FEA missions without writing any code. Simply create a JSON file with <code className="text-cyan-300 font-bold">nodes</code> and <code className="text-cyan-300 font-bold">members</code>. The normalizer engine handles all mathematical cross-section properties, constraint matrices, and formulas automatically.
                </p>
              </div>

              {/* Support Types */}
              <div>
                <h4 className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-1">
                  1. Boundary Support Shortcuts (`support`)
                </h4>
                <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-cyan-300 block">&quot;pinned&quot;</span>
                    <span className="text-slate-400">Fixed X, Y, Z. Free to rotate.</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-cyan-300 block">&quot;roller&quot;</span>
                    <span className="text-slate-400">Fixed Y. Slides horizontally in X.</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-cyan-300 block">&quot;fixed&quot;</span>
                    <span className="text-slate-400">Cantilever clamp wall anchor.</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-slate-400 block">&quot;free&quot;</span>
                    <span className="text-slate-400">Default joint carrying load.</span>
                  </div>
                </div>
              </div>

              {/* Cross Sections */}
              <div>
                <h4 className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-1">
                  2. Cross-Section Presets (`section`)
                </h4>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-slate-200 block">&quot;round_30mm&quot;</span>
                    <span className="text-slate-400">Solid Ø 30 mm (Tension webs)</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-slate-200 block">&quot;round_50mm&quot;</span>
                    <span className="text-slate-400">Solid Ø 50 mm (General chords)</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-slate-200 block">&quot;round_80mm&quot;</span>
                    <span className="text-slate-400">Solid Ø 80 mm (Heavy load)</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-cyan-500/30 col-span-1">
                    <span className="font-bold text-cyan-300 block">&quot;tube_80x4mm&quot;</span>
                    <span className="text-slate-400">Tube Ø 80×4 mm (High buckling)</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-cyan-500/30 col-span-2">
                    <span className="font-bold text-cyan-300 block">&quot;tube_120x5mm&quot;</span>
                    <span className="text-slate-400">Tube Ø 120×5 mm (Maximum Euler buckling resistance)</span>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div>
                <h4 className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-1">
                  3. Material Shorthand (`material`)
                </h4>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-slate-200 block">&quot;steel&quot; (ASTM A36)</span>
                    <span className="text-slate-400">E = 200 GPa • &sigma;y = 250 MPa</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-slate-200 block">&quot;aluminum&quot; (6061-T6)</span>
                    <span className="text-slate-400">E = 69 GPa • Light weight</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-slate-200 block">&quot;titanium&quot; (Ti-6Al-4V)</span>
                    <span className="text-slate-400">&sigma;y = 880 MPa • Aerospace</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-slate-200 block">&quot;timber&quot; (Glulam)</span>
                    <span className="text-slate-400">E = 13 GPa • Low cost</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 col-span-2">
                    <span className="font-bold text-slate-200 block">&quot;carbon_fiber&quot; (CFRP)</span>
                    <span className="text-slate-400">E = 140 GPa • &rho; = 1600 kg/m³ (Featherweight)</span>
                  </div>
                </div>
              </div>

              {/* Loads & Units */}
              <div>
                <h4 className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-1">
                  4. Loads & Force Units
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                  Specify <code className="text-cyan-300">&quot;loadY&quot;: -50</code> on any node to apply a downward gravity load of <strong className="text-slate-200">50 kN (50,000 N)</strong>. Specify <code className="text-cyan-300">&quot;loadX&quot;: 20</code> for horizontal lateral/wind loads. All coordinates (<code className="text-slate-200">x</code>, <code className="text-slate-200">y</code>, <code className="text-slate-200">z</code>) are in meters.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                <span>Detailed guide located at: <code className="text-cyan-300 font-bold">docs/MISSION_AUTHORING_GUIDE.md</code></span>
                <button
                  onClick={handleCopyTemplate}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold cursor-pointer"
                >
                  {copiedSuccess ? 'Copied Template!' : 'Copy Starter Template JSON'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
