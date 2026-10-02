import { MATERIAL_DATABASE, PRESET_SECTIONS, createSolidRoundSection, createHollowTubeSection } from '../materials.js';

/**
 * Universal Mission Schema & Normalizer Engine
 * 
 * Translates human-friendly, declarative JSON shorthand into complete,
 * mathematically verified FEA structural mission objects for The Teardown Lab.
 */

// Shorthand aliases for engineering materials
export const MATERIAL_ALIASES = {
  steel: 'structural_steel_a36',
  'a36': 'structural_steel_a36',
  'structural_steel': 'structural_steel_a36',
  'structural_steel_a36': 'structural_steel_a36',

  hsla: 'high_strength_steel',
  'hsla_steel': 'high_strength_steel',
  'high_strength_steel': 'high_strength_steel',
  'a572': 'high_strength_steel',

  aluminum: 'aluminum_6061_t6',
  'al_6061': 'aluminum_6061_t6',
  'al_6061_t6': 'aluminum_6061_t6',
  'aluminum_6061_t6': 'aluminum_6061_t6',

  titanium: 'titanium_ti6al4v',
  'ti_6al_4v': 'titanium_ti6al4v',
  'ti6al4v': 'titanium_ti6al4v',
  'titanium_ti6al4v': 'titanium_ti6al4v',

  carbon_fiber: 'carbon_fiber_composite',
  cfrp: 'carbon_fiber_composite',
  'carbon_fiber_composite': 'carbon_fiber_composite',

  timber: 'structural_timber',
  wood: 'structural_timber',
  glulam: 'structural_timber',
  'structural_timber': 'structural_timber',
};

// Shorthand aliases for standard cross sections
export const SECTION_ALIASES = {
  // Solid rounds
  round_30mm: PRESET_SECTIONS[0], // Solid Ø 30 mm
  round_50mm: PRESET_SECTIONS[1], // Solid Ø 50 mm
  round_80mm: PRESET_SECTIONS[2], // Solid Ø 80 mm
  'round_30': PRESET_SECTIONS[0],
  'round_50': PRESET_SECTIONS[1],
  'round_80': PRESET_SECTIONS[2],
  'solid_30mm': PRESET_SECTIONS[0],
  'solid_50mm': PRESET_SECTIONS[1],
  'solid_80mm': PRESET_SECTIONS[2],

  // Hollow tubes (high buckling resistance)
  tube_80x4mm: PRESET_SECTIONS[3], // Tube Ø 80×4 mm
  tube_120x5mm: PRESET_SECTIONS[4], // Tube Ø 120×5 mm
  'tube_80x4.0mm': PRESET_SECTIONS[3],
  'tube_120x5.0mm': PRESET_SECTIONS[4],
  'tube_80': PRESET_SECTIONS[3],
  'tube_120': PRESET_SECTIONS[4],
};

// Standard boundary conditions
export const SUPPORT_ALIASES = {
  pinned: { constraint: [1, 1, 1], supportType: 'pinned' },
  pin: { constraint: [1, 1, 1], supportType: 'pinned' },
  roller: { constraint: [0, 1, 1], supportType: 'roller_x' },
  roller_x: { constraint: [0, 1, 1], supportType: 'roller_x' },
  roller_y: { constraint: [1, 0, 1], supportType: 'roller_y' },
  fixed: { constraint: [1, 1, 1], supportType: 'fixed' },
  free: { constraint: [0, 0, 0], supportType: 'free' },
  none: { constraint: [0, 0, 0], supportType: 'free' },
};

/**
 * Resolves a material string to an active MATERIAL_DATABASE entry ID
 */
export function resolveMaterialId(materialInput) {
  if (!materialInput) return 'structural_steel_a36';
  const clean = String(materialInput).toLowerCase().trim().replace(/\s+/g, '_');
  const mapped = MATERIAL_ALIASES[clean];
  if (mapped && MATERIAL_DATABASE[mapped]) {
    return mapped;
  }
  if (MATERIAL_DATABASE[materialInput]) {
    return materialInput;
  }
  return 'structural_steel_a36';
}

/**
 * Resolves a cross-section input to a valid section object
 */
export function resolveCrossSection(sectionInput) {
  if (!sectionInput) {
    return PRESET_SECTIONS[1]; // Default: Solid Ø 50 mm
  }

  // If already a valid section object with area and momentOfInertia
  if (typeof sectionInput === 'object' && sectionInput.area && sectionInput.momentOfInertia) {
    return sectionInput;
  }

  // If custom parametric definition: { shape: 'round', diameterMm: 60 }
  if (typeof sectionInput === 'object') {
    if (sectionInput.shape === 'round' || sectionInput.shape === 'solid_round') {
      const radiusMeters = (sectionInput.diameterMm ? sectionInput.diameterMm / 2 : sectionInput.radiusMm || 25) / 1000;
      return createSolidRoundSection(radiusMeters);
    }
    if (sectionInput.shape === 'tube' || sectionInput.shape === 'hollow_tube') {
      const outerRadiusMeters = (sectionInput.diameterMm ? sectionInput.diameterMm / 2 : sectionInput.outerRadiusMm || 40) / 1000;
      const wallThicknessMeters = (sectionInput.thicknessMm || sectionInput.wallThicknessMm || 4) / 1000;
      return createHollowTubeSection(outerRadiusMeters, wallThicknessMeters);
    }
  }

  // If shorthand string alias: "tube_80x4mm"
  if (typeof sectionInput === 'string') {
    const clean = sectionInput.toLowerCase().trim().replace(/\s+/g, '_');
    if (SECTION_ALIASES[clean]) {
      return SECTION_ALIASES[clean];
    }
  }

  return PRESET_SECTIONS[1];
}

/**
 * Resolves support type and constraint array
 */
export function resolveSupport(supportInput, rawConstraint) {
  if (rawConstraint && Array.isArray(rawConstraint) && rawConstraint.length === 3) {
    const isPinned = rawConstraint[0] === 1 && rawConstraint[1] === 1;
    const isRoller = rawConstraint[0] === 0 && rawConstraint[1] === 1;
    return {
      constraint: rawConstraint,
      supportType: supportInput || (isPinned ? 'pinned' : isRoller ? 'roller_x' : 'free'),
    };
  }

  if (supportInput) {
    const clean = String(supportInput).toLowerCase().trim();
    if (SUPPORT_ALIASES[clean]) {
      return {
        constraint: [...SUPPORT_ALIASES[clean].constraint],
        supportType: SUPPORT_ALIASES[clean].supportType,
      };
    }
  }

  return {
    constraint: [0, 0, 0],
    supportType: 'free',
  };
}

/**
 * Default mechanics theory formulas automatically provided if none specified
 */
export const DEFAULT_THEORY_FORMULAS = [
  {
    name: "Hooke's Law (1D Axial Stress)",
    latex: '\\sigma = E \\cdot \\epsilon = \\frac{F}{A}',
    description: 'Relates internal axial force and cross-sectional area to stress in the member.',
    variableExplanation: {
      '\\sigma': 'Axial stress (Pa or MPa)',
      E: "Young's modulus of elasticity (Pa)",
      '\\epsilon': 'Strain (unitless elongation ratio)',
      F: 'Internal axial force (N)',
      A: 'Cross-sectional area (m²)',
    },
  },
  {
    name: 'Euler Critical Buckling Load',
    latex: 'P_{cr} = \\frac{\\pi^2 E I}{(K L)^2}',
    description: 'Maximum compressive load before a slender column buckles catastrophically.',
    variableExplanation: {
      'P_{cr}': 'Critical buckling force (N)',
      E: "Young's modulus (Pa)",
      I: 'Second moment of area (m⁴)',
      L: 'Unsupported member length (m)',
      K: 'Effective length factor (1.0 for pinned-pinned)',
    },
  },
  {
    name: 'Factor of Safety (FOS)',
    latex: '\\text{FOS} = \\min\\left(\\frac{\\sigma_{\\text{yield}}}{\\sigma_{\\max}}, \\frac{P_{cr}}{|P_{\\text{comp}}|}\\right)',
    description: 'Structural safety margin against yielding and Euler buckling.',
    variableExplanation: {
      '\\text{FOS}': 'Factor of Safety (dimensionless ratio)',
      '\\sigma_{\\text{yield}}': 'Material yield strength (Pa)',
      'P_{cr}': 'Euler critical buckling load (N)',
    },
  },
  {
    name: 'Axial Member Deformation',
    latex: '\\Delta L = \\frac{F \\cdot L}{E \\cdot A}',
    description: 'Total elastic elongation under tension or shortening under compressive thrust.',
    variableExplanation: {
      '\\Delta L': 'Elongation / shortening (m or mm)',
      F: 'Internal axial force (N)',
      L: 'Member length (m)',
      E: "Young's modulus (Pa)",
      A: 'Cross-sectional area (m²)',
    },
  },
];

/**
 * Validates a raw mission JSON object
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
export function validateMission(raw) {
  const errors = [];
  const warnings = [];

  if (!raw || typeof raw !== 'object') {
    return { isValid: false, errors: ['Mission must be a valid JSON object.'], warnings: [] };
  }

  // Required identity fields
  if (!raw.id || typeof raw.id !== 'string') {
    errors.push("Missing required field 'id' (string identifier, e.g. 'fink_roof_truss').");
  }
  if (!raw.title || typeof raw.title !== 'string') {
    errors.push("Missing required field 'title' (e.g. 'The Fink Roof Truss').");
  }

  // Nodes check
  const rawNodes = raw.nodes || raw.initialNodes;
  if (!rawNodes || !Array.isArray(rawNodes) || rawNodes.length < 2) {
    errors.push("Mission must define an array of 'nodes' with at least 2 joints.");
  } else {
    const nodeIds = new Set();
    let hasSupport = false;

    rawNodes.forEach((n, idx) => {
      if (!n.id) {
        errors.push(`Node at index ${idx} is missing an 'id'.`);
      } else {
        if (nodeIds.has(n.id)) {
          errors.push(`Duplicate node id '${n.id}'.`);
        }
        nodeIds.add(n.id);
      }
      if (typeof n.x !== 'number' || typeof n.y !== 'number') {
        errors.push(`Node '${n.id || idx}' must specify numeric 'x' and 'y' coordinates in meters.`);
      }
      if (n.support || (n.constraint && n.constraint.some((c) => c === 1))) {
        hasSupport = true;
      }
    });

    if (!hasSupport) {
      warnings.push("No boundary support detected on any node. Structure will be free-floating and statically unstable unless supports are added.");
    }
  }

  // Members check
  const rawMembers = raw.members || raw.initialMembers;
  if (!rawMembers || !Array.isArray(rawMembers) || rawMembers.length === 0) {
    errors.push("Mission must define an array of 'members' connecting nodes.");
  } else if (rawNodes && Array.isArray(rawNodes)) {
    const validNodeIds = new Set(rawNodes.map((n) => n.id));
    rawMembers.forEach((m, idx) => {
      // Support array shorthand: ["n0", "n1"] or object { from, to } or { nodeAId, nodeBId }
      const nodeA = Array.isArray(m) ? m[0] : m.from || m.nodeAId;
      const nodeB = Array.isArray(m) ? m[1] : m.to || m.nodeBId;

      if (!nodeA || !nodeB) {
        errors.push(`Member at index ${idx} must specify connected nodes ('from' and 'to').`);
      } else {
        if (nodeA === nodeB) {
          errors.push(`Member at index ${idx} connects node '${nodeA}' to itself.`);
        }
        if (!validNodeIds.has(nodeA)) {
          errors.push(`Member at index ${idx} references undefined node '${nodeA}'.`);
        }
        if (!validNodeIds.has(nodeB)) {
          errors.push(`Member at index ${idx} references undefined node '${nodeB}'.`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Normalizes a raw Universal Mission JSON object into the complete runtime challenge format.
 */
export function normalizeMission(raw) {
  const validation = validateMission(raw);
  if (!validation.isValid) {
    throw new Error(`Invalid mission format: ${validation.errors.join('; ')}`);
  }

  const rawNodes = raw.nodes || raw.initialNodes || [];
  const rawMembers = raw.members || raw.initialMembers || [];

  // 1. Normalize Nodes
  const initialNodes = rawNodes.map((n, idx) => {
    const id = String(n.id || `n${idx}`);
    const x = Number(n.x) || 0;
    const y = Number(n.y) || 0;
    const z = Number(n.z) || 0;

    // Support load shortcuts: loadY in kN (e.g. -50 => -50000 N) or direct fy
    let fx = 0;
    let fy = 0;
    let fz = 0;

    if (n.loadX !== undefined) {
      fx = Number(n.loadX) * 1000;
    } else if (n.fx !== undefined) {
      fx = Number(n.fx);
    }

    if (n.loadY !== undefined) {
      fy = Number(n.loadY) * 1000;
    } else if (n.fy !== undefined) {
      fy = Number(n.fy);
    }

    if (n.loadZ !== undefined) {
      fz = Number(n.loadZ) * 1000;
    } else if (n.fz !== undefined) {
      fz = Number(n.fz);
    }

    const { constraint, supportType } = resolveSupport(n.support || n.supportType, n.constraint);

    return {
      id,
      x,
      y,
      z,
      fx,
      fy,
      fz,
      constraint,
      supportType,
    };
  });

  // 2. Normalize Members
  const initialMembers = rawMembers.map((m, idx) => {
    let id;
    let nodeAId;
    let nodeBId;
    let materialInput;
    let sectionInput;

    // Handle array shorthand: ["n0", "n1", "steel", "tube_80x4mm"]
    if (Array.isArray(m)) {
      nodeAId = String(m[0]);
      nodeBId = String(m[1]);
      materialInput = m[2];
      sectionInput = m[3];
      id = `m_${nodeAId}_${nodeBId}`;
    } else {
      nodeAId = String(m.from || m.nodeAId);
      nodeBId = String(m.to || m.nodeBId);
      materialInput = m.material || m.materialId;
      sectionInput = m.section || m.crossSection;
      id = String(m.id || `m_${nodeAId}_${nodeBId}`);
    }

    const materialId = resolveMaterialId(materialInput);
    const crossSection = resolveCrossSection(sectionInput);

    return {
      id,
      nodeAId,
      nodeBId,
      materialId,
      crossSection,
    };
  });

  // Calculate default environment dimensions from structure bounding box
  const xs = initialNodes.map((n) => n.x);
  const ys = initialNodes.map((n) => n.y);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 10);
  const span = Math.max(8, Math.ceil(maxX - minX));
  const maxY = Math.max(...ys, 3);
  const height = Math.max(3, Math.ceil(maxY * 1.2));

  const environment = {
    spanMeters: raw.environment?.spanMeters || span,
    heightMeters: raw.environment?.heightMeters || height,
    groundY: raw.environment?.groundY !== undefined ? raw.environment.groundY : 0,
    riverBedMeters: raw.environment?.riverBedMeters !== undefined ? raw.environment.riverBedMeters : -1,
    keepOutZones: raw.environment?.keepOutZones || [],
  };

  // 3. Normalize Constraints
  const constraints = {
    minFactorOfSafety: raw.constraints?.minFactorOfSafety || 1.5,
    maxMassKg: raw.constraints?.maxMassKg || 5000,
    maxBudgetDollars: raw.constraints?.maxBudgetDollars || 10000,
    maxDeflectionMm: raw.constraints?.maxDeflectionMm || 25.0,
  };

  // 4. Pedagogical Formulas
  const formulas = Array.isArray(raw.formulas) && raw.formulas.length > 0
    ? raw.formulas
    : DEFAULT_THEORY_FORMULAS;

  // 5. Pedagogical Takeaways
  const pedagogicalTakeaways = Array.isArray(raw.pedagogicalTakeaways) && raw.pedagogicalTakeaways.length > 0
    ? raw.pedagogicalTakeaways
    : [
        'Analyze internal axial forces: tension members (positive) vs compressive columns (negative).',
        'Verify Euler buckling criteria (P_cr) on all compressive members to prevent sudden bifurcation collapse.',
        'Ensure the overall Factor of Safety (FOS) satisfies the target safety margin.',
      ];

  return {
    id: raw.id,
    title: raw.title,
    subtitle: raw.subtitle || 'Structural mechanics engineering mission',
    module: raw.module || 'statics_trusses',
    difficulty: raw.difficulty || 'Intermediate',
    estimatedMinutes: raw.estimatedMinutes || 15,
    scenario: raw.scenario || 'Analyze and optimize this structural configuration to satisfy all safety and deflection constraints.',
    backgroundBriefing: raw.backgroundBriefing || 'Examine how load transfers across joints. Ensure no members exceed material yield limits or Euler critical buckling loads.',
    pedagogicalTakeaways,
    formulas,
    constraints,
    environment,
    initialNodes,
    initialMembers,
    suggestedLoadFactor: raw.suggestedLoadFactor || 1.0,
    tags: Array.isArray(raw.tags) ? raw.tags : ['Mechanics', 'Truss', 'FEA'],
    isCustom: Boolean(raw.isCustom),
  };
}
