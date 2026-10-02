import { PRESET_SECTIONS } from '../../core/materials.js';

export const MODULE_1_CHALLENGES = [
  {
    id: 'warren_truss_bridge',
    title: 'The Warren Truss River Crossing',
    subtitle: 'Span a 12m river gorge and support heavy industrial freight without buckling.',
    module: 'statics_trusses',
    difficulty: 'Introductory',
    estimatedMinutes: 15,
    scenario:
      'A remote mining outpost requires a bridge over a 12-meter river gorge. Heavy ore haulers exert a vertical load of 60 kN at the center deck. You must engineer an efficient truss that keeps the deck stable, avoids Euler buckling on the top compressive chord, and satisfies environmental budget constraints.',
    backgroundBriefing:
      'Warren trusses alternate between tension and compression in diagonal web members. Top chords are in compression, while bottom chords are in tension. Notice how the top chord wants to buckle if made too slender!',
    pedagogicalTakeaways: [
      'Top chords carry high compressive loads and are vulnerable to Euler column buckling (P_cr = pi^2 * E * I / L^2).',
      'Bottom chords are in pure tension and only depend on cross-sectional area (sigma = F / A).',
      'Triangulated web members convert bending moments into direct axial tension/compression.',
    ],
    formulas: [
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
        latex: 'P_{cr} = \\frac{\\pi^2 E I}{L^2}',
        description: 'Maximum compressive load before a slender column buckles catastrophically.',
        variableExplanation: {
          'P_{cr}': 'Critical buckling force (N)',
          E: "Young's modulus (Pa)",
          I: 'Second moment of area (m⁴)',
          L: 'Unsupported member length (m)',
        },
      },
      {
        name: 'Factor of Safety (FOS)',
        latex: '\\text{FOS} = \\frac{\\text{Allowable Limit}}{\\text{Actual Demand}} = \\min\\left(\\frac{\\sigma_{\\text{yield}}}{\\sigma_{\\max}}, \\frac{P_{cr}}{|P_{\\text{comp}}|}\\right)',
        description: 'Standard engineering safety margin. Must remain >= 1.5 under worst-case loading.',
        variableExplanation: {
          '\\text{FOS}': 'Factor of Safety (dimensionless ratio)',
          '\\sigma_{\\text{yield}}': 'Material yield strength (Pa)',
          'P_{cr}': 'Euler critical buckling load (N)',
        },
      },
    ],
    constraints: {
      minFactorOfSafety: 1.6,
      maxMassKg: 1200,
      maxBudgetDollars: 2400,
      maxDeflectionMm: 12.0,
    },
    environment: {
      spanMeters: 12,
      heightMeters: 3,
      riverBedMeters: -1.5,
      keepOutZones: [
        {
          name: 'River Navigation Channel',
          min: [3.5, -2.5, -2],
          max: [8.5, 0.0, 2],
          color: 'rgba(56, 189, 248, 0.2)',
        },
      ],
      groundY: 0,
    },
    initialNodes: [
      { id: 'n0', x: 0, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [1, 1, 1], supportType: 'pinned' },
      { id: 'n1', x: 3, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'n2', x: 6, y: 0, z: 0, fx: 0, fy: -60000, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'n3', x: 9, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'n4', x: 12, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 1, 1], supportType: 'roller_x' },

      { id: 'n5', x: 1.5, y: 2.5, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'n6', x: 4.5, y: 2.5, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'n7', x: 7.5, y: 2.5, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'n8', x: 10.5, y: 2.5, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
    ],
    initialMembers: [
      { id: 'm_b1', nodeAId: 'n0', nodeBId: 'n1', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_b2', nodeAId: 'n1', nodeBId: 'n2', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_b3', nodeAId: 'n2', nodeBId: 'n3', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_b4', nodeAId: 'n3', nodeBId: 'n4', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },

      { id: 'm_t1', nodeAId: 'n5', nodeBId: 'n6', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },
      { id: 'm_t2', nodeAId: 'n6', nodeBId: 'n7', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },
      { id: 'm_t3', nodeAId: 'n7', nodeBId: 'n8', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },

      { id: 'm_w1', nodeAId: 'n0', nodeBId: 'n5', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_w2', nodeAId: 'n5', nodeBId: 'n1', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_w3', nodeAId: 'n1', nodeBId: 'n6', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_w4', nodeAId: 'n6', nodeBId: 'n2', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_w5', nodeAId: 'n2', nodeBId: 'n7', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_w6', nodeAId: 'n7', nodeBId: 'n3', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_w7', nodeAId: 'n3', nodeBId: 'n8', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_w8', nodeAId: 'n8', nodeBId: 'n4', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
    ],
    suggestedLoadFactor: 1.0,
    tags: ['Bridge', 'Buckling', 'Warren Truss', 'Statics'],
  },
  {
    id: 'custom_sim',
    title: 'Custom Sim (Full CAD Sandbox)',
    subtitle: 'Freeform simulation laboratory: create joints, connect bars, customize loads & supports.',
    module: 'statics_trusses',
    difficulty: 'Sandbox',
    estimatedMinutes: 30,
    scenario:
      'A fully unconstrained engineering playground. You have full CAD controls (+ Joint, + Bar, Erase, and Joint Load editing). Build your own 2D or 3D truss structures from scratch or modify the starter frame, apply arbitrary concentrated forces, configure boundary conditions, and test structural stability.',
    backgroundBriefing:
      'Unlike predefined challenges with fixed geometry, Custom Sim unlocks full simulation-style CAD controls. Use the + Joint tool to click and place nodes, the + Bar tool to connect them, and click on any joint in Inspect mode to configure custom applied forces (Fx, Fy) or support types (pinned, roller, fixed).',
    pedagogicalTakeaways: [
      'Experiment with structural determinacy: b + r = 2j for 2D trusses.',
      'Explore internal force distribution and load paths under eccentric loading.',
      'Test your own unique designs against progressive collapse and Euler buckling.',
    ],
    formulas: [
      {
        name: "Hooke's Law (1D Axial Stress)",
        latex: '\\sigma = \\frac{F}{A}',
        description: 'Relates internal axial force and cross-sectional area to stress in the member.',
        variableExplanation: {
          '\\sigma': 'Axial stress (Pa or MPa)',
          F: 'Internal axial force (N)',
          A: 'Cross-sectional area (m²)',
        },
      },
      {
        name: 'Euler Critical Buckling Load',
        latex: 'P_{cr} = \\frac{\\pi^2 E I}{(K L)^2}',
        description: 'Critical compressive buckling threshold for slender columns.',
        variableExplanation: {
          'P_{cr}': 'Critical buckling force (N)',
          E: "Young's modulus (Pa)",
          I: 'Second moment of area (m⁴)',
          L: 'Unsupported member length (m)',
        },
      },
    ],
    constraints: {
      minFactorOfSafety: 1.5,
      maxMassKg: 5000,
      maxBudgetDollars: 10000,
      maxDeflectionMm: 25.0,
    },
    environment: {
      spanMeters: 12,
      heightMeters: 5,
      riverBedMeters: -1.0,
      keepOutZones: [],
      groundY: 0,
    },
    initialNodes: [
      { id: 'cs_n0', x: 0, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [1, 1, 1], supportType: 'pinned' },
      { id: 'cs_n1', x: 3, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'cs_n2', x: 6, y: 0, z: 0, fx: 0, fy: -50000, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'cs_n3', x: 9, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'cs_n4', x: 12, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 1, 1], supportType: 'roller_x' },
      { id: 'cs_n5', x: 3, y: 3, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'cs_n6', x: 9, y: 3, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
    ],
    initialMembers: [
      { id: 'cs_m1', nodeAId: 'cs_n0', nodeBId: 'cs_n1', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'cs_m2', nodeAId: 'cs_n1', nodeBId: 'cs_n2', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'cs_m3', nodeAId: 'cs_n2', nodeBId: 'cs_n3', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'cs_m4', nodeAId: 'cs_n3', nodeBId: 'cs_n4', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'cs_m5', nodeAId: 'cs_n0', nodeBId: 'cs_n5', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[2] },
      { id: 'cs_m6', nodeAId: 'cs_n5', nodeBId: 'cs_n6', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },
      { id: 'cs_m7', nodeAId: 'cs_n6', nodeBId: 'cs_n4', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[2] },
      { id: 'cs_m8', nodeAId: 'cs_n1', nodeBId: 'cs_n5', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'cs_m9', nodeAId: 'cs_n2', nodeBId: 'cs_n5', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'cs_m10', nodeAId: 'cs_n2', nodeBId: 'cs_n6', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'cs_m11', nodeAId: 'cs_n3', nodeBId: 'cs_n6', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
    ],
    suggestedLoadFactor: 1.0,
    tags: ['Custom Sim', 'CAD Builder', 'Interactive FEA', 'Freeform'],
  },
  {
    id: 'high_rise_crane_jib',
    title: 'The High-Rise Tower Crane Jib',
    subtitle: 'Cantilever truss design: balance tip payloads with tie-backs and counterweights.',
    module: 'statics_trusses',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    scenario:
      'A construction site tower crane has a 14-meter working jib lifting precast concrete panels weighing 35 kN at its extreme tip. Without adequate triangulation and top tension tie-rods, the cantilever arm will experience massive downward deflection and shear failure at the mast connection.',
    backgroundBriefing:
      'Unlike bridges where the top chord is in compression, cantilever crane jibs place the top chord in high tension, while the bottom chord undergoes severe compression where it meets the central mast.',
    pedagogicalTakeaways: [
      'In cantilevered structures, bending stresses reverse: the top chord is in tension, the bottom chord is in compression.',
      'The critical stress concentration point is located at the lower connection to the vertical mast.',
      'A stay-cable / tie-rod from the crane apex reduces internal bending moments by converting them to axial mast compression.',
    ],
    formulas: [
      {
        name: 'Cantilever Tip Deflection Approximation',
        latex: '\\delta_{\\text{tip}} \\approx \\frac{F L^3}{3 E I_{\\text{eff}}}',
        description: 'Demonstrates cubic sensitivity to cantilever reach length.',
        variableExplanation: {
          '\\delta_{\\text{tip}}': 'Deflection at crane tip (m)',
          F: 'Tip hook load (N)',
          L: 'Jib reach length (m)',
          'I_{\\text{eff}}': 'Effective moment of inertia of truss cross-section',
        },
      },
    ],
    constraints: {
      minFactorOfSafety: 1.8,
      maxMassKg: 1500,
      maxBudgetDollars: 3500,
      maxDeflectionMm: 25.0,
    },
    environment: {
      spanMeters: 16,
      heightMeters: 6,
      keepOutZones: [],
      groundY: 0,
    },
    initialNodes: [
      { id: 'c_m1', x: 0, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [1, 1, 1], supportType: 'fixed' },
      { id: 'c_m2', x: 2, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [1, 1, 1], supportType: 'fixed' },
      { id: 'c_j0', x: 0, y: 4, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'c_j1', x: 2, y: 4, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'c_apex', x: 1, y: 7, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },

      { id: 'j_b1', x: 5, y: 4, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'j_b2', x: 8, y: 4, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'j_b3', x: 11, y: 4, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'j_tip', x: 14, y: 4, z: 0, fx: 0, fy: -35000, fz: 0, constraint: [0, 0, 0], supportType: 'free' },

      { id: 'j_t1', x: 5, y: 5.5, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'j_t2', x: 8, y: 5.5, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'j_t3', x: 11, y: 5.5, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
    ],
    initialMembers: [
      { id: 'm_mast1', nodeAId: 'c_m1', nodeBId: 'c_j0', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[4] },
      { id: 'm_mast2', nodeAId: 'c_m2', nodeBId: 'c_j1', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[4] },
      { id: 'm_mast_cross', nodeAId: 'c_m1', nodeBId: 'c_j1', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_mast_apex1', nodeAId: 'c_j0', nodeBId: 'c_apex', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[3] },
      { id: 'm_mast_apex2', nodeAId: 'c_j1', nodeBId: 'c_apex', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[3] },

      { id: 'm_jb1', nodeAId: 'c_j1', nodeBId: 'j_b1', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[4] },
      { id: 'm_jb2', nodeAId: 'j_b1', nodeBId: 'j_b2', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[3] },
      { id: 'm_jb3', nodeAId: 'j_b2', nodeBId: 'j_b3', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[3] },
      { id: 'm_jb4', nodeAId: 'j_b3', nodeBId: 'j_tip', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[3] },

      { id: 'm_jt0', nodeAId: 'c_j0', nodeBId: 'j_t1', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[3] },
      { id: 'm_jt1', nodeAId: 'j_t1', nodeBId: 'j_t2', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[3] },
      { id: 'm_jt2', nodeAId: 'j_t2', nodeBId: 'j_t3', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[3] },
      { id: 'm_jt3', nodeAId: 'j_t3', nodeBId: 'j_tip', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[3] },

      { id: 'm_diag1', nodeAId: 'c_j1', nodeBId: 'j_t1', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_diag2', nodeAId: 'j_b1', nodeBId: 'j_t1', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_diag3', nodeAId: 'j_b1', nodeBId: 'j_t2', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_diag4', nodeAId: 'j_b2', nodeBId: 'j_t2', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_diag5', nodeAId: 'j_b2', nodeBId: 'j_t3', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'm_diag6', nodeAId: 'j_b3', nodeBId: 'j_t3', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },

      { id: 'm_apex_tie', nodeAId: 'c_apex', nodeBId: 'j_t2', materialId: 'high_strength_steel', crossSection: PRESET_SECTIONS[2] },
    ],
    suggestedLoadFactor: 1.0,
    tags: ['Cantilever', 'Crane', 'Moments', 'Tension Ties'],
  },
  {
    id: 'radio_transmission_tower',
    title: 'The Radio Transmission Tower',
    subtitle: 'Wind shear vs Gravity: tall slender space lattice resisting gale force winds.',
    module: 'statics_trusses',
    difficulty: 'Advanced',
    estimatedMinutes: 20,
    scenario:
      'A 15-meter communications mast on an exposed mountaintop faces high-velocity lateral wind gusts (simulated by horizontal loads at each tier) while supporting a heavy microwave dish at the top. The leeward leg experiences extreme compressive forces and risks Euler column collapse.',
    backgroundBriefing:
      'As wind pushes sideways, the tower acts like a vertical cantilever. The windward foundation bolts are yanked upwards in tension, while the leeward foundation leg is crushed into the ground.',
    pedagogicalTakeaways: [
      'Overturning moments create large tension-compression force couples at the base.',
      'Tall towers require cross-bracing (X-braces) to resist lateral shear without racking.',
      'Slenderness ratio (L / r) must be kept low on compressive columns to avoid catastrophic snap-through.',
    ],
    formulas: [
      {
        name: 'Overturning Moment & Base Reactions',
        latex: 'M_{\\text{base}} = \\sum F_{\\text{wind}, i} \\cdot h_i, \\quad R_{\\text{vertical}} = \\pm \\frac{M_{\\text{base}}}{\\text{Base Width}}',
        description: 'Tension in windward leg, compression in leeward leg.',
        variableExplanation: {
          'M_{\\text{base}}': 'Total overturning moment (N·m)',
          'F_{\\text{wind}}': 'Lateral wind force at height h (N)',
        },
      },
    ],
    constraints: {
      minFactorOfSafety: 1.7,
      maxMassKg: 1800,
      maxBudgetDollars: 3800,
      maxDeflectionMm: 30.0,
    },
    environment: {
      spanMeters: 6,
      heightMeters: 16,
      keepOutZones: [],
      groundY: 0,
    },
    initialNodes: [
      { id: 'tw_b1', x: -2.5, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [1, 1, 1], supportType: 'fixed' },
      { id: 'tw_b2', x: 2.5, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [1, 1, 1], supportType: 'fixed' },

      { id: 'tw_t1_l', x: -1.8, y: 5, z: 0, fx: 6000, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'tw_t1_r', x: 1.8, y: 5, z: 0, fx: 6000, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },

      { id: 'tw_t2_l', x: -1.1, y: 10, z: 0, fx: 9000, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'tw_t2_r', x: 1.1, y: 10, z: 0, fx: 9000, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },

      { id: 'tw_top', x: 0, y: 15, z: 0, fx: 15000, fy: -25000, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
    ],
    initialMembers: [
      { id: 'leg_b1', nodeAId: 'tw_b1', nodeBId: 'tw_t1_l', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },
      { id: 'leg_b2', nodeAId: 'tw_b2', nodeBId: 'tw_t1_r', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },
      { id: 'leg_m1', nodeAId: 'tw_t1_l', nodeBId: 'tw_t2_l', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },
      { id: 'leg_m2', nodeAId: 'tw_t1_r', nodeBId: 'tw_t2_r', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },
      { id: 'leg_top1', nodeAId: 'tw_t2_l', nodeBId: 'tw_top', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },
      { id: 'leg_top2', nodeAId: 'tw_t2_r', nodeBId: 'tw_top', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },

      { id: 'strut_t1', nodeAId: 'tw_t1_l', nodeBId: 'tw_t1_r', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'strut_t2', nodeAId: 'tw_t2_l', nodeBId: 'tw_t2_r', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },

      { id: 'x1_a', nodeAId: 'tw_b1', nodeBId: 'tw_t1_r', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'x1_b', nodeAId: 'tw_b2', nodeBId: 'tw_t1_l', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'x2_a', nodeAId: 'tw_t1_l', nodeBId: 'tw_t2_r', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'x2_b', nodeAId: 'tw_t1_r', nodeBId: 'tw_t2_l', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
    ],
    suggestedLoadFactor: 1.0,
    tags: ['Tower', 'Wind Shear', 'Overturning Moment', 'X-Brace'],
  },
  {
    id: 'aerospace_weight_minimizer',
    title: 'Aerospace Satellite Boom (Mass Minimization)',
    subtitle: 'Optimize material and topology: hit FOS >= 2.0 while eliminating parasitic mass.',
    module: 'statics_trusses',
    difficulty: 'Expert',
    estimatedMinutes: 25,
    scenario:
      'Every kilogram launched into low Earth orbit costs over $2,500. You are tasked with designing an ultra-lightweight deployable satellite boom supporting an optical thruster sensor package (20 kN load). Your target: cut total mass below 250 kg while maintaining a strict aerospace Factor of Safety >= 2.0.',
    backgroundBriefing:
      'Notice that some members carry near-zero force in certain configurations. Remove or slim down these zero-force members, and evaluate switching high-stress tension members to Carbon Fiber CFRP or Titanium Grade 5.',
    pedagogicalTakeaways: [
      'Zero-force members can be identified by inspection (two non-collinear members meeting at an unloaded joint).',
      'High-performance materials like Titanium and Carbon Fiber offer high specific strength (yield strength / density), drastically reducing mass.',
      'Euler buckling scales with E * I, so tubular cross-sections are vital for compressive members.',
    ],
    formulas: [
      {
        name: 'Specific Strength (Strength-to-Weight Ratio)',
        latex: '\\text{Specific Strength} = \\frac{\\sigma_{\\text{yield}}}{\\rho}',
        description: 'Key aerospace material selection figure of merit.',
        variableExplanation: {
          '\\sigma_{\\text{yield}}': 'Yield strength (Pa)',
          '\\rho': 'Material density (kg/m³)',
        },
      },
    ],
    constraints: {
      minFactorOfSafety: 2.0,
      maxMassKg: 250,
      maxBudgetDollars: 12000,
      maxDeflectionMm: 8.0,
    },
    environment: {
      spanMeters: 8,
      heightMeters: 2.5,
      keepOutZones: [],
      groundY: 0,
    },
    initialNodes: [
      { id: 'sat_root_bot', x: 0, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [1, 1, 1], supportType: 'fixed' },
      { id: 'sat_root_top', x: 0, y: 2, z: 0, fx: 0, fy: 0, fz: 0, constraint: [1, 1, 1], supportType: 'fixed' },
      { id: 'sat_m1_b', x: 2.5, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'sat_m1_t', x: 2.5, y: 1.8, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'sat_m2_b', x: 5.0, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'sat_m2_t', x: 5.0, y: 1.5, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'sat_tip', x: 7.5, y: 0.8, z: 0, fx: 0, fy: -20000, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
    ],
    initialMembers: [
      { id: 'sat_b1', nodeAId: 'sat_root_bot', nodeBId: 'sat_m1_b', materialId: 'aluminum_6061_t6', crossSection: PRESET_SECTIONS[3] },
      { id: 'sat_b2', nodeAId: 'sat_m1_b', nodeBId: 'sat_m2_b', materialId: 'aluminum_6061_t6', crossSection: PRESET_SECTIONS[3] },
      { id: 'sat_b3', nodeAId: 'sat_m2_b', nodeBId: 'sat_tip', materialId: 'aluminum_6061_t6', crossSection: PRESET_SECTIONS[3] },
      { id: 'sat_t1', nodeAId: 'sat_root_top', nodeBId: 'sat_m1_t', materialId: 'titanium_ti6al4v', crossSection: PRESET_SECTIONS[1] },
      { id: 'sat_t2', nodeAId: 'sat_m1_t', nodeBId: 'sat_m2_t', materialId: 'titanium_ti6al4v', crossSection: PRESET_SECTIONS[1] },
      { id: 'sat_t3', nodeAId: 'sat_m2_t', nodeBId: 'sat_tip', materialId: 'titanium_ti6al4v', crossSection: PRESET_SECTIONS[1] },
      { id: 'sat_v1', nodeAId: 'sat_m1_b', nodeBId: 'sat_m1_t', materialId: 'aluminum_6061_t6', crossSection: PRESET_SECTIONS[0] },
      { id: 'sat_v2', nodeAId: 'sat_m2_b', nodeBId: 'sat_m2_t', materialId: 'aluminum_6061_t6', crossSection: PRESET_SECTIONS[0] },
      { id: 'sat_d1', nodeAId: 'sat_root_bot', nodeBId: 'sat_m1_t', materialId: 'titanium_ti6al4v', crossSection: PRESET_SECTIONS[1] },
      { id: 'sat_d2', nodeAId: 'sat_m1_b', nodeBId: 'sat_m2_t', materialId: 'titanium_ti6al4v', crossSection: PRESET_SECTIONS[1] },
    ],
    suggestedLoadFactor: 1.0,
    tags: ['Aerospace', 'Optimization', 'Titanium', 'Carbon Fiber'],
  },
  {
    id: 'pratt_truss_railway',
    title: 'The Heavy Freight Pratt Truss',
    subtitle: 'Classic American railroad bridge: diagonals in tension, vertical posts in compression.',
    module: 'statics_trusses',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    scenario:
      'A freight railway needs to cross a 16-meter river chasm to transport 120-ton freight trains. You are implementing a Pratt truss configuration where the diagonal web members slope down toward the center to ensure they remain in tension under typical uniform loads.',
    backgroundBriefing:
      'Thomas and Caleb Pratt patented this truss in 1844. By ensuring diagonal members are in tension (sloping downward toward center), they could use cheaper iron rods for diagonals while keeping short vertical posts in compression, minimizing buckling.',
    pedagogicalTakeaways: [
      'Compare Pratt vs Warren: Pratt uses vertical posts to shorten compressive member lengths.',
      'Shorter compression members exponentially increase Euler buckling resistance since P_cr ~ 1/L².',
    ],
    formulas: [
      {
        name: 'Pratt Web Tension / Compression Rule',
        latex: '\\text{Diagonal slope downward to center} \\implies \\text{Tension } (F > 0)',
        description: 'Pratt geometry puts long diagonals in tension and short verticals in compression.',
        variableExplanation: {},
      },
    ],
    constraints: {
      minFactorOfSafety: 1.5,
      maxMassKg: 2400,
      maxBudgetDollars: 4500,
      maxDeflectionMm: 15.0,
    },
    environment: {
      spanMeters: 16,
      heightMeters: 3.5,
      groundY: 0,
      keepOutZones: [],
    },
    initialNodes: [
      { id: 'p_b0', x: 0, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [1, 1, 1], supportType: 'pinned' },
      { id: 'p_b1', x: 4, y: 0, z: 0, fx: 0, fy: -40000, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'p_b2', x: 8, y: 0, z: 0, fx: 0, fy: -80000, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'p_b3', x: 12, y: 0, z: 0, fx: 0, fy: -40000, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'p_b4', x: 16, y: 0, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 1, 1], supportType: 'roller_x' },

      { id: 'p_t1', x: 4, y: 3.2, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'p_t2', x: 8, y: 3.2, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
      { id: 'p_t3', x: 12, y: 3.2, z: 0, fx: 0, fy: 0, fz: 0, constraint: [0, 0, 0], supportType: 'free' },
    ],
    initialMembers: [
      { id: 'mp_b1', nodeAId: 'p_b0', nodeBId: 'p_b1', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[2] },
      { id: 'mp_b2', nodeAId: 'p_b1', nodeBId: 'p_b2', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[2] },
      { id: 'mp_b3', nodeAId: 'p_b2', nodeBId: 'p_b3', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[2] },
      { id: 'mp_b4', nodeAId: 'p_b3', nodeBId: 'p_b4', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[2] },

      { id: 'mp_t1', nodeAId: 'p_t1', nodeBId: 'p_t2', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[4] },
      { id: 'mp_t2', nodeAId: 'p_t2', nodeBId: 'p_t3', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[4] },

      { id: 'mp_end1', nodeAId: 'p_b0', nodeBId: 'p_t1', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[4] },
      { id: 'mp_end2', nodeAId: 'p_b4', nodeBId: 'p_t3', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[4] },

      { id: 'mp_v1', nodeAId: 'p_b1', nodeBId: 'p_t1', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },
      { id: 'mp_v2', nodeAId: 'p_b2', nodeBId: 'p_t2', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },
      { id: 'mp_v3', nodeAId: 'p_b3', nodeBId: 'p_t3', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[3] },

      { id: 'mp_d1', nodeAId: 'p_t1', nodeBId: 'p_b2', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
      { id: 'mp_d2', nodeAId: 'p_t3', nodeBId: 'p_b2', materialId: 'structural_steel_a36', crossSection: PRESET_SECTIONS[1] },
    ],
    suggestedLoadFactor: 1.0,
    tags: ['Railroad', 'Pratt Truss', 'Heavy Freight', 'Buckling vs Tension'],
  },
];
