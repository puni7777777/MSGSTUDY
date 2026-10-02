import { MODULE_1_CHALLENGES } from '../../content/challenges/module1-challenges.js';
import { normalizeMission, validateMission } from './missionSchema.js';

const CUSTOM_MISSIONS_STORAGE_KEY = 'teardown_lab_custom_missions_v1';

/**
 * Loads custom user missions from localStorage safely (browser-only)
 */
export function loadCustomMissionsFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_MISSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((m) => {
        try {
          return normalizeMission({ ...m, isCustom: true });
        } catch (e) {
          console.warn('Failed to load custom mission:', m?.id, e);
          return null;
        }
      }).filter(Boolean);
    }
  } catch (err) {
    console.error('Error loading custom missions from storage:', err);
  }
  return [];
}

/**
 * Saves custom user missions to localStorage safely
 */
export function saveCustomMissionsToStorage(missions) {
  if (typeof window === 'undefined') return;
  try {
    const cleanList = missions.map((m) => ({
      ...m,
      isCustom: true,
    }));
    window.localStorage.setItem(CUSTOM_MISSIONS_STORAGE_KEY, JSON.stringify(cleanList));
  } catch (err) {
    console.error('Error saving custom missions to storage:', err);
  }
}

/**
 * Gets all active missions (built-in + custom missions)
 */
export function getAllMissions(customMissions = []) {
  const customMap = new Map();
  customMissions.forEach((cm) => customMap.set(cm.id, cm));

  // Built-in missions (overridden if custom shares same id)
  const list = MODULE_1_CHALLENGES.map((ch) => customMap.get(ch.id) || ch);

  // Append new custom missions not in built-in
  customMissions.forEach((cm) => {
    if (!MODULE_1_CHALLENGES.some((ch) => ch.id === cm.id)) {
      list.push(cm);
    }
  });

  return list;
}

/**
 * Finds a mission by its ID
 */
export function getMissionById(id, customMissions = []) {
  const all = getAllMissions(customMissions);
  return all.find((m) => m.id === id) || all[0];
}

/**
 * Serializes the current active canvas state (nodes & members) into clean Universal Mission JSON format.
 * Enables 1-click "Save from Custom Sim" without writing code.
 */
export function serializeCurrentStateAsMission(nodes, members, meta = {}, constraints = {}) {
  const cleanId = (meta.title || 'custom_mission')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || `mission_${Date.now()}`;

  // Simplify nodes for export
  const exportNodes = (nodes || []).map((n) => {
    const nodeObj = {
      id: n.id,
      x: Number(n.x.toFixed(2)),
      y: Number(n.y.toFixed(2)),
    };
    if (n.z && Math.abs(n.z) > 0.001) {
      nodeObj.z = Number(n.z.toFixed(2));
    }
    if (n.supportType && n.supportType !== 'free') {
      nodeObj.support = n.supportType === 'roller_x' ? 'roller' : n.supportType;
    }
    if (n.fy && Math.abs(n.fy) > 0.001) {
      // Export in convenient kN if divisible by 1000, or exact
      nodeObj.loadY = Number((n.fy / 1000).toFixed(2));
    }
    if (n.fx && Math.abs(n.fx) > 0.001) {
      nodeObj.loadX = Number((n.fx / 1000).toFixed(2));
    }
    return nodeObj;
  });

  // Simplify members for export
  const exportMembers = (members || []).map((m) => {
    const memObj = {
      from: m.nodeAId,
      to: m.nodeBId,
    };
    if (m.materialId && m.materialId !== 'structural_steel_a36') {
      memObj.material = m.materialId.replace('structural_steel_a36', 'steel');
    }
    if (m.crossSection?.id) {
      memObj.section = m.crossSection.id;
    }
    return memObj;
  });

  const missionPayload = {
    $schema: 'https://teardownlab.com/schemas/mission.v1.json',
    id: cleanId,
    title: meta.title || 'Custom Engineered Truss',
    subtitle: meta.subtitle || 'User-designed structural configuration',
    difficulty: meta.difficulty || 'Intermediate',
    estimatedMinutes: Number(meta.estimatedMinutes) || 15,
    scenario: meta.scenario || 'Analyze this custom structural truss under external working loads.',
    constraints: {
      minFactorOfSafety: Number(constraints.minFactorOfSafety) || 1.5,
      maxMassKg: Number(constraints.maxMassKg) || 3000,
      maxBudgetDollars: Number(constraints.maxBudgetDollars) || 5000,
      maxDeflectionMm: Number(constraints.maxDeflectionMm) || 20.0,
    },
    nodes: exportNodes,
    members: exportMembers,
    tags: meta.tags || ['User Mission', 'Custom Sim'],
  };

  return missionPayload;
}

/**
 * Triggers a browser download of a mission as a clean .json file
 */
export function downloadMissionAsJsonFile(missionObject) {
  if (typeof window === 'undefined') return;

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(missionObject, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${missionObject.id || 'mission'}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
