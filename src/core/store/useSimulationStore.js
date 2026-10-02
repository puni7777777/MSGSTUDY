import { create } from 'zustand';
import { PRESET_SECTIONS } from '../materials';
import { solveTrussFEA } from '../solvers/trussFea';
import { simulateDestructiveFailure } from '../solvers/progressiveCollapse';
import { MODULE_1_CHALLENGES } from '../../content/challenges/module1-challenges';

const defaultChallenge = MODULE_1_CHALLENGES[0];
const initialResult = solveTrussFEA(defaultChallenge.initialNodes, defaultChallenge.initialMembers, 1.0);

export const useSimulationStore = create((set, get) => ({
  nodes: defaultChallenge.initialNodes,
  members: defaultChallenge.initialMembers,
  selectedNodeId: null,
  selectedMemberId: null,

  loadMultiplier: 1.0,
  deformationScale: 40.0,
  colorMode: 'stress',
  builderTool: 'select',
  memberDraftStartNodeId: null,
  showGrid: true,
  showSfdBmd: true,
  showFormulasModal: false,
  showPostMortemModal: false,
  showChallengeModal: false,
  cameraPreset: 'front',

  // ANSYS Universal Stress Scale & Range Configuration
  stressScaleMode: 'auto', // 'auto' | 'custom'
  stressDisplayMetric: 'stress_mpa', // 'stress_mpa' | 'demand_ratio'
  stressCustomMin: 0,
  stressCustomMax: 250,
  isStressScaleExpanded: true,

  // Academic Course & Subject Metadata Configuration
  activeSubjectId: 'me-statics-fea',
  isCourseMetaCollapsed: false,
  upcomingSubjectPreview: null,

  solverResult: initialResult,
  destructionReport: null,
  isDestructionTesting: false,
  currentCollapseStepIndex: 0,

  activeChallengeId: defaultChallenge.id,

  loadChallenge: (challengeId) => {
    const ch = MODULE_1_CHALLENGES.find((c) => c.id === challengeId) || defaultChallenge;
    const result = solveTrussFEA(ch.initialNodes, ch.initialMembers, ch.suggestedLoadFactor);

    set({
      activeChallengeId: ch.id,
      nodes: ch.initialNodes.map((n) => ({ ...n, constraint: [...n.constraint] })),
      members: ch.initialMembers.map((m) => ({ ...m })),
      selectedNodeId: null,
      selectedMemberId: null,
      loadMultiplier: ch.suggestedLoadFactor,
      solverResult: result,
      destructionReport: null,
      isDestructionTesting: false,
      memberDraftStartNodeId: null,
      currentCollapseStepIndex: 0,
    });
  },

  resetCurrentChallenge: () => {
    const { activeChallengeId, loadChallenge } = get();
    loadChallenge(activeChallengeId);
  },

  setLoadMultiplier: (factor) => {
    const { nodes, members } = get();
    const result = solveTrussFEA(nodes, members, factor);
    set({
      loadMultiplier: factor,
      solverResult: result,
      isDestructionTesting: false,
      destructionReport: null,
    });
  },

  setDeformationScale: (scale) => set({ deformationScale: scale }),
  setColorMode: (mode) => set({ colorMode: mode }),
  setBuilderTool: (tool) => set({ builderTool: tool, memberDraftStartNodeId: null }),
  setMemberDraftStart: (nodeId) => set({ memberDraftStartNodeId: nodeId }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  toggleSfdBmd: () => set((s) => ({ showSfdBmd: !s.showSfdBmd })),
  setShowFormulasModal: (show) => set({ showFormulasModal: show }),
  setShowPostMortemModal: (show) => set({ showPostMortemModal: show }),
  setShowChallengeModal: (show) => set({ showChallengeModal: show }),

  setStressScaleMode: (mode) => set({ stressScaleMode: mode }),
  setStressDisplayMetric: (metric) => {
    set((state) => {
      const isMpa = metric === 'stress_mpa';
      const extremes = state.solverResult?.stressExtremes;
      const autoMax = isMpa
        ? Math.max(10, Math.ceil((extremes?.maxStressMPa || 50) * 1.15))
        : Math.max(1.0, Number(((extremes?.maxStressRatio || 1.0) * 1.1).toFixed(2)));
      return {
        stressDisplayMetric: metric,
        stressCustomMin: 0,
        stressCustomMax: autoMax,
      };
    });
  },
  setStressLimits: (min, max) => {
    set({
      stressScaleMode: 'custom',
      stressCustomMin: Number(min),
      stressCustomMax: Number(max),
    });
  },
  setStressCustomMin: (min) => set({ stressCustomMin: Number(min), stressScaleMode: 'custom' }),
  setStressCustomMax: (max) => set({ stressCustomMax: Number(max), stressScaleMode: 'custom' }),
  resetStressLimitsToAuto: () => set({ stressScaleMode: 'auto' }),
  toggleStressScaleExpanded: () => set((s) => ({ isStressScaleExpanded: !s.isStressScaleExpanded })),

  setActiveSubject: (id) => set({ activeSubjectId: id }),
  toggleCourseMetaCollapsed: () => set((s) => ({ isCourseMetaCollapsed: !s.isCourseMetaCollapsed })),
  setUpcomingSubjectPreview: (subject) => set({ upcomingSubjectPreview: subject }),

  selectNode: (id) => set({ selectedNodeId: id, selectedMemberId: null }),
  selectMember: (id) => set({ selectedMemberId: id, selectedNodeId: null }),

  addNode: (x, y, z, support = 'free') => {
    const id = `n_${Date.now()}_${Math.floor(Math.random() * 100)}`;
    const constraintMap = {
      free: [0, 0, 0],
      pinned: [1, 1, 1],
      roller_x: [0, 1, 1],
      roller_y: [1, 0, 1],
      fixed: [1, 1, 1],
    };

    const newNode = {
      id,
      x: Math.round(x * 2) / 2, // Snap to 0.5m grid
      y: Math.round(y * 2) / 2,
      z: Math.round(z * 2) / 2,
      fx: 0,
      fy: 0,
      fz: 0,
      constraint: constraintMap[support] || [0, 0, 0],
      supportType: support,
    };

    set((state) => {
      const nextNodes = [...state.nodes, newNode];
      const result = solveTrussFEA(nextNodes, state.members, state.loadMultiplier);
      return {
        nodes: nextNodes,
        solverResult: result,
        selectedNodeId: id,
        selectedMemberId: null,
      };
    });

    return id;
  },

  updateNodePosition: (id, x, y, z) => {
    set((state) => {
      const nextNodes = state.nodes.map((n) => (n.id === id ? { ...n, x, y, z } : n));
      const result = solveTrussFEA(nextNodes, state.members, state.loadMultiplier);
      return { nodes: nextNodes, solverResult: result };
    });
  },

  updateNodeLoad: (id, fx, fy, fz) => {
    set((state) => {
      const nextNodes = state.nodes.map((n) => (n.id === id ? { ...n, fx, fy, fz } : n));
      const result = solveTrussFEA(nextNodes, state.members, state.loadMultiplier);
      return { nodes: nextNodes, solverResult: result };
    });
  },

  updateNodeSupport: (id, support) => {
    const constraintMap = {
      free: [0, 0, 0],
      pinned: [1, 1, 1],
      roller_x: [0, 1, 1],
      roller_y: [1, 0, 1],
      fixed: [1, 1, 1],
    };

    set((state) => {
      const nextNodes = state.nodes.map((n) =>
        n.id === id ? { ...n, supportType: support, constraint: constraintMap[support] || [0, 0, 0] } : n
      );
      const result = solveTrussFEA(nextNodes, state.members, state.loadMultiplier);
      return { nodes: nextNodes, solverResult: result };
    });
  },

  deleteNode: (id) => {
    set((state) => {
      const nextNodes = state.nodes.filter((n) => n.id !== id);
      const nextMembers = state.members.filter((m) => m.nodeAId !== id && m.nodeBId !== id);
      const result = solveTrussFEA(nextNodes, nextMembers, state.loadMultiplier);
      return {
        nodes: nextNodes,
        members: nextMembers,
        solverResult: result,
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      };
    });
  },

  addMember: (nodeAId, nodeBId, materialId = 'structural_steel_a36', section = PRESET_SECTIONS[1]) => {
    if (nodeAId === nodeBId) return null;

    const existing = get().members.find(
      (m) => (m.nodeAId === nodeAId && m.nodeBId === nodeBId) || (m.nodeAId === nodeBId && m.nodeBId === nodeAId)
    );
    if (existing) return existing.id;

    const id = `m_${Date.now()}_${Math.floor(Math.random() * 100)}`;
    const newMember = {
      id,
      nodeAId,
      nodeBId,
      materialId,
      crossSection: section,
    };

    set((state) => {
      const nextMembers = [...state.members, newMember];
      const result = solveTrussFEA(state.nodes, nextMembers, state.loadMultiplier);
      return {
        members: nextMembers,
        solverResult: result,
        selectedMemberId: id,
        selectedNodeId: null,
      };
    });

    return id;
  },

  updateMemberMaterial: (id, materialId) => {
    set((state) => {
      const nextMembers = state.members.map((m) => (m.id === id ? { ...m, materialId } : m));
      const result = solveTrussFEA(state.nodes, nextMembers, state.loadMultiplier);
      return { members: nextMembers, solverResult: result };
    });
  },

  updateMemberSection: (id, section) => {
    set((state) => {
      const nextMembers = state.members.map((m) => (m.id === id ? { ...m, crossSection: section } : m));
      const result = solveTrussFEA(state.nodes, nextMembers, state.loadMultiplier);
      return { members: nextMembers, solverResult: result };
    });
  },

  deleteMember: (id) => {
    set((state) => {
      const nextMembers = state.members.filter((m) => m.id !== id);
      const result = solveTrussFEA(state.nodes, nextMembers, state.loadMultiplier);
      return {
        members: nextMembers,
        solverResult: result,
        selectedMemberId: state.selectedMemberId === id ? null : state.selectedMemberId,
      };
    });
  },

  runDestructionTest: () => {
    const { nodes, members, loadMultiplier } = get();
    const report = simulateDestructiveFailure(nodes, members, Math.max(1.0, loadMultiplier), 4.0, 30);

    if (report && report.collapseSteps.length > 0) {
      set({
        destructionReport: report,
        isDestructionTesting: true,
        currentCollapseStepIndex: 0,
        showPostMortemModal: true,
        solverResult: report.collapseSteps[0].solverResult,
        loadMultiplier: report.criticalFailureLoadMultiplier,
      });
    } else {
      alert('Incredible engineering! The structure survived up to 400% of design load without catastrophic yield or Euler buckling.');
    }
  },

  setCollapseStep: (stepIndex) => {
    const { destructionReport } = get();
    if (!destructionReport || !destructionReport.collapseSteps[stepIndex]) return;

    set({
      currentCollapseStepIndex: stepIndex,
      solverResult: destructionReport.collapseSteps[stepIndex].solverResult,
      loadMultiplier: destructionReport.collapseSteps[stepIndex].loadMultiplier,
    });
  },

  stopDestructionTest: () => {
    const { nodes, members } = get();
    const result = solveTrussFEA(nodes, members, 1.0);
    set({
      isDestructionTesting: false,
      destructionReport: null,
      loadMultiplier: 1.0,
      solverResult: result,
      showPostMortemModal: false,
    });
  },
}));
