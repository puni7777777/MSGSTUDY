/**
 * Multi-Subject Engineering Course & Laboratory Catalog
 * Defines the curriculum metadata for each academic course subject.
 */

export const SUBJECTS_CATALOG = [
  {
    id: 'me-statics-fea',
    slug: 'me-201',
    code: 'ME-201',
    subject: 'Engineering Statics & Finite Element Analysis',
    shortTitle: 'Statics & FEA',
    department: 'Dept. of Mechanical & Civil Engineering',
    courseName: 'Mechanics of Deformable Bodies & Computational Statics',
    level: 'Undergraduate (Year 2)',
    semester: 'Spring 2026',
    credits: '4.0 Credits (3h Lecture + 3h Lab)',
    instructor: 'Computational Mechanics Laboratory Group',
    prerequisites: 'Calculus III, Vector Physics, Engineering Materials',
    topics: [
      'Direct Stiffness Method (DSM)',
      'Euler Column Buckling & Instability',
      '2D & 3D Pin-Jointed Space Trusses',
      'SFD & BMD Load Envelopes',
      'Progressive Collapse Autopsy',
      'ANSYS Stress Contour Visualization',
    ],
    description:
      'Interactive computational mechanics laboratory suite for investigating nodal equilibrium, global structural stiffness formulation, Euler buckling modes, and progressive collapse mechanics under static and catastrophic live loads.',
    status: 'active',
    modulesCount: 5,
    icon: 'Truss',
    accentColor: 'cyan',
    badge: 'Active Lab (60 FPS FEA)',
    features: [
      'Real-time Direct Stiffness Matrix [K]{u}={F} Solver',
      'Euler Critical Buckling Load P_cr = π²EI / (KL)²',
      'Interactive Shear Force & Bending Moment Diagrams (SFD/BMD)',
      'Dynamic ANSYS Rainbow Stress Contour Legend',
      'Post-Mortem Destructive Failure Autopsy Engine',
      'Full 3D WebGL Three.js Interactive Orbit Viewport',
    ],
    modules: [
      {
        week: 'Week 1-3',
        title: 'Truss Nodal Equilibrium & Global Stiffness Matrix',
        desc: 'Assembly of local element stiffness matrices [k_e] into global structural matrix [K]. Partitioning of free vs constrained DOFs.',
      },
      {
        week: 'Week 4-6',
        title: 'Euler Buckling & Compressive Instability Modes',
        desc: 'Geometric nonlinearities, slenderness ratio λ = L/r, effective length factors K, and sudden bifurcation under compressive live loads.',
      },
      {
        week: 'Week 7-9',
        title: 'Internal Shear & Bending Moment Distributions',
        desc: 'Integration of distributed transverse loading w(x), shear discontinuities V(x), and peak internal moment M(x) envelope tracking.',
      },
      {
        week: 'Week 10-14',
        title: 'Progressive Collapse & Kinetic Energy Dissipation',
        desc: 'Post-yield member degradation, load redistribution cascades, dynamic shock factor amplification, and catastrophic structural failure autopsy.',
      },
    ],
  },
  {
    id: 'me-thermodynamics',
    slug: 'me-204',
    code: 'ME-204',
    subject: 'Thermodynamics & Heat Transfer',
    shortTitle: 'Thermal Systems',
    department: 'Dept. of Mechanical Engineering',
    courseName: 'Applied Thermal Systems, Power Cycles & Conduction FEA',
    level: 'Undergraduate (Year 2)',
    semester: 'Fall 2026',
    credits: '4.0 Credits (3h Lecture + 3h Lab)',
    instructor: 'Thermal Sciences Division',
    prerequisites: 'Thermodynamics I, Differential Equations',
    topics: [
      'Rankine & Brayton Cycles',
      '2D Steady & Transient Conduction FEA',
      'Extended Surfaces & Heat Exchangers',
      'Entropy & Exergy Destruction',
    ],
    description:
      'Thermodynamic cycle visualization, interactive p-v and T-s diagram generation, and 2D finite-difference heat diffusion simulation in complex engine components.',
    status: 'preview',
    modulesCount: 4,
    icon: 'Flame',
    accentColor: 'orange',
    badge: 'Interactive Lab Preview',
    features: [
      '2D Steady-State Heat Conduction Grid Solver (Laplace/Poisson Eq)',
      'Interactive Thermal Contour Heatmaps with Isotherm Contours',
      'Live Fourier Law Heat Flux Vectors q" = -k ∇T',
      'Rankine Steam Power Cycle p-v & T-s Diagram Generator',
      'Brayton Gas Turbine Cycle Thermal Efficiency Analyzer',
      'Variable Boundary Conditions (Dirichlet, Neumann, Convection Robin)',
    ],
    modules: [
      {
        week: 'Week 1-4',
        title: 'First & Second Laws: Energy, Entropy & Exergy',
        desc: 'Control volume formulation, entropy generation S_gen ≥ 0, and second-law thermodynamic efficiency limits.',
      },
      {
        week: 'Week 5-8',
        title: 'Vapor Power & Gas Turbine Cycles (Rankine & Brayton)',
        desc: 'Reheat and regenerative feedwater heating in Rankine plants; intercooling and recuperation in Brayton jet engines.',
      },
      {
        week: 'Week 9-11',
        title: '2D Finite Difference Heat Conduction Simulation',
        desc: 'Discretization of ∇²T + q_gen/k = (1/α) ∂T/∂t using 5-point finite difference stencils and SOR iteration.',
      },
      {
        week: 'Week 12-14',
        title: 'Convection Boundary Layers & Heat Exchangers',
        desc: 'LMTD and ε-NTU heat exchanger design, Nusselt number correlations, and extended surface fin efficiency.',
      },
    ],
  },
  {
    id: 'me-fluid-mechanics',
    slug: 'me-301',
    code: 'ME-301',
    subject: 'Fluid Mechanics & Aerodynamics',
    shortTitle: 'Fluid Dynamics',
    department: 'Dept. of Aerospace & Mechanical Engineering',
    courseName: 'Viscous Flow, Navier-Stokes & Boundary Layer Physics',
    level: 'Undergraduate (Year 3)',
    semester: 'Fall 2026',
    credits: '4.0 Credits (3h Lecture + 3h Lab)',
    instructor: 'Aerodynamics & Fluid Physics Lab',
    prerequisites: 'Vector Calculus, Fluid Statics, Thermodynamics',
    topics: [
      'Navier-Stokes Grid Solvers',
      'NACA Airfoil Lift & Drag Polar',
      'Boundary Layer Separation & Stalling',
      'Internal Pipe Network Head Loss',
    ],
    description:
      'Real-time 2D lattice Boltzmann fluid solver sandbox, dynamic wind tunnel airfoil sweep, and piping system hydraulic network simulation.',
    status: 'preview',
    modulesCount: 6,
    icon: 'Wind',
    accentColor: 'sky',
    badge: 'Interactive Lab Preview',
    features: [
      'Virtual Wind Tunnel Sandbox with Dynamic Flow Streamlines',
      'NACA 4-Digit Airfoil Geometry Generator (0012, 2412, 4412)',
      'Interactive Angle of Attack (α) Sweep with Stall Detection',
      'Real-time Polar Plots: C_L vs α, C_D vs α, and L/D Efficiency',
      'Bernoulli Pressure Distribution & Kutta-Joukowski Circulation',
      'Darcy-Weisbach Friction Factor & Moody Diagram Solver',
    ],
    modules: [
      {
        week: 'Week 1-3',
        title: 'Fluid Kinematics & Reynolds Transport Theorem',
        desc: 'Lagrangian vs Eulerian descriptions, velocity fields, vorticity, and integral mass/momentum conservation.',
      },
      {
        week: 'Week 4-7',
        title: 'Differential Navier-Stokes Formulation & Boundary Layers',
        desc: 'Exact viscous solutions (Poiseuille, Couette), Prandtl boundary layer scaling, and adverse pressure gradient separation.',
      },
      {
        week: 'Week 8-11',
        title: 'Subsonic Aerodynamics & Thin Airfoil Theory',
        desc: 'Circulation theory of lift, chord line vortex sheets, camber effects, induced drag, and high-α aerodynamic stalling.',
      },
      {
        week: 'Week 12-14',
        title: 'Compressible Gas Dynamics & Shock Waves',
        desc: 'Isentropic stagnation states, normal shocks, supersonic convergent-divergent de Laval nozzles, and Mach cones.',
      },
    ],
  },
  {
    id: 'me-machine-design',
    slug: 'me-308',
    code: 'ME-308',
    subject: 'Machine Component Design & Fatigue',
    shortTitle: 'Machine Design',
    department: 'Dept. of Mechanical Engineering',
    courseName: 'Failure Theories, Cyclic Fatigue & Power Transmission',
    level: 'Undergraduate (Year 3)',
    semester: 'Spring 2027',
    credits: '3.0 Credits (2h Lecture + 3h Lab)',
    instructor: 'Machine Elements & Tribology Faculty',
    prerequisites: 'ME-201 Mechanics of Materials',
    topics: [
      'von Mises & Tresca Failure Envelopes',
      'High-Cycle S-N Fatigue Life',
      'Goodman-Soderberg Mean Stress Criteria',
      'Transmission Shafting & Gear Drives',
    ],
    description:
      'Multiaxial stress state Mohr circle exploration, cyclic fatigue life prediction under rotating bending, and stress concentration notch factor optimization.',
    status: 'preview',
    modulesCount: 4,
    icon: 'Cog',
    accentColor: 'amber',
    badge: 'Interactive Lab Preview',
    features: [
      'Interactive Mohr’s Stress Circle Visualizer (σ_x, σ_y, τ_xy inputs)',
      'Principal Stress Vectors (σ_1, σ_2) and Max In-Plane Shear (τ_max)',
      'Dynamic Yield Locus: von Mises Ellipse vs Tresca Hexagon',
      'Basquin High-Cycle Fatigue Life S-N Curve Calculator',
      'Goodman, Soderberg & Gerber Mean Stress Criteria Plots',
      'ASME Code for Design of Transmission Shafting (Bending + Torsion)',
    ],
    modules: [
      {
        week: 'Week 1-3',
        title: 'Multiaxial Stress Transformation & Mohr’s Circle',
        desc: 'Coordinate rotations, principal normal and maximum shearing stresses, hydrostatic vs deviatoric stress tensors.',
      },
      {
        week: 'Week 4-7',
        title: 'Static Yield Failure Theories for Ductile & Brittle Metals',
        desc: 'Distortion energy (von Mises), maximum shear stress (Tresca), Coulomb-Mohr, and modified Mohr criteria.',
      },
      {
        week: 'Week 8-11',
        title: 'Variable Loading & High-Cycle Fatigue (S-N Curve)',
        desc: 'Endurance limit modifications (Marin factors k_a through k_f), fluctuating stresses, and cumulative fatigue damage (Miner’s Rule).',
      },
      {
        week: 'Week 12-14',
        title: 'Power Transmission Shafts, Gears & Bearing Selection',
        desc: 'Critical speed whirling, AGMA spur gear bending/contact stresses, and deep-groove ball bearing L_10 rating life.',
      },
    ],
  },
];

/**
 * Helper function to match a subject by its id, code, or slug
 */
export function getSubjectById(identifier) {
  if (!identifier) return SUBJECTS_CATALOG[0];
  const normalized = identifier.toLowerCase().trim();
  return (
    SUBJECTS_CATALOG.find(
      (s) =>
        s.id.toLowerCase() === normalized ||
        s.slug.toLowerCase() === normalized ||
        s.code.toLowerCase() === normalized ||
        s.code.toLowerCase().replace(/[^a-z0-9]/g, '-') === normalized
    ) || SUBJECTS_CATALOG[0]
  );
}

/**
 * Returns all valid path slugs for subjects
 */
export function getAllSubjectSlugs() {
  const slugs = [];
  SUBJECTS_CATALOG.forEach((s) => {
    slugs.push(s.id);
    slugs.push(s.slug);
    slugs.push(s.code.toLowerCase());
  });
  return slugs;
}
