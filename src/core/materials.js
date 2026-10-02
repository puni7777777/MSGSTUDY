export const MATERIAL_DATABASE = {
  structural_steel_a36: {
    id: 'structural_steel_a36',
    name: 'Structural Steel (ASTM A36)',
    shortName: 'Steel A36',
    elasticModulus: 200e9, // 200 GPa
    yieldStrength: 250e6,  // 250 MPa
    ultimateStrength: 400e6,
    density: 7850,         // kg/m^3
    costPerKg: 1.20,       // $1.20 / kg
    colorHex: '#64748b',
    poissonRatio: 0.26,
    description: 'Workhorse civil/mechanical structural alloy. High stiffness and ductility, moderate cost, heavier mass.',
  },
  high_strength_steel: {
    id: 'high_strength_steel',
    name: 'High-Strength Low-Alloy (A572 Gr 50)',
    shortName: 'HSLA Steel',
    elasticModulus: 205e9,
    yieldStrength: 345e6,  // 345 MPa
    ultimateStrength: 450e6,
    density: 7850,
    costPerKg: 1.85,
    colorHex: '#475569',
    poissonRatio: 0.28,
    description: 'Higher yield strength for heavy machinery and critical crane booms without adding extra mass.',
  },
  aluminum_6061_t6: {
    id: 'aluminum_6061_t6',
    name: 'Aluminum 6061-T6',
    shortName: 'Al 6061-T6',
    elasticModulus: 69e9,  // 69 GPa
    yieldStrength: 276e6,  // 276 MPa
    ultimateStrength: 310e6,
    density: 2700,         // kg/m^3 (~1/3 of steel)
    costPerKg: 4.50,
    colorHex: '#94a3b8',
    poissonRatio: 0.33,
    description: 'Lightweight aerospace & automotive alloy. Outstanding strength-to-weight ratio, lower modulus of elasticity.',
  },
  titanium_ti6al4v: {
    id: 'titanium_ti6al4v',
    name: 'Titanium Grade 5 (Ti-6Al-4V)',
    shortName: 'Ti-6Al-4V',
    elasticModulus: 114e9, // 114 GPa
    yieldStrength: 880e6,  // 880 MPa
    ultimateStrength: 950e6,
    density: 4430,         // kg/m^3
    costPerKg: 38.00,
    colorHex: '#a1a1aa',
    poissonRatio: 0.34,
    description: 'Premium aerospace material. Extreme yield strength, excellent corrosion resistance, high cost.',
  },
  carbon_fiber_composite: {
    id: 'carbon_fiber_composite',
    name: 'Carbon Fiber CFRP (Unidirectional)',
    shortName: 'CFRP',
    elasticModulus: 140e9, // 140 GPa
    yieldStrength: 600e6,  // 600 MPa (effective design limit)
    ultimateStrength: 1500e6,
    density: 1600,         // kg/m^3
    costPerKg: 65.00,
    colorHex: '#1e293b',
    poissonRatio: 0.30,
    description: 'Ultra-lightweight composite. Unbeatable specific stiffness, brittle failure mode with low compressive buckling.',
  },
  structural_timber: {
    id: 'structural_timber',
    name: 'Structural Douglas Fir (Glulam)',
    shortName: 'Timber',
    elasticModulus: 13e9,  // 13 GPa
    yieldStrength: 40e6,   // 40 MPa
    ultimateStrength: 60e6,
    density: 550,          // kg/m^3
    costPerKg: 0.80,
    colorHex: '#b45309',
    poissonRatio: 0.29,
    description: 'Renewable architectural material. Low stiffness and strength, highly susceptible to Euler column buckling.',
  },
};

export function createSolidRoundSection(radiusMeters) {
  const r = radiusMeters;
  const area = Math.PI * r * r;
  const I = (Math.PI * Math.pow(r, 4)) / 4;
  return {
    id: `round_${(radiusMeters * 1000).toFixed(0)}mm`,
    name: `Solid Ø ${(radiusMeters * 2000).toFixed(0)} mm`,
    type: 'solid_round',
    outerRadius: r,
    area,
    momentOfInertia: I,
  };
}

export function createHollowTubeSection(outerRadiusMeters, wallThicknessMeters) {
  const rOut = outerRadiusMeters;
  const rIn = Math.max(0.001, outerRadiusMeters - wallThicknessMeters);
  const area = Math.PI * (rOut * rOut - rIn * rIn);
  const I = (Math.PI * (Math.pow(rOut, 4) - Math.pow(rIn, 4))) / 4;
  return {
    id: `tube_${(rOut * 2000).toFixed(0)}x${(wallThicknessMeters * 1000).toFixed(1)}mm`,
    name: `Tube Ø ${(rOut * 2000).toFixed(0)}×${(wallThicknessMeters * 1000).toFixed(1)} mm`,
    type: 'hollow_tube',
    outerRadius: rOut,
    innerRadius: rIn,
    area,
    momentOfInertia: I,
  };
}

export const PRESET_SECTIONS = [
  createSolidRoundSection(0.015), // Ø 30 mm
  createSolidRoundSection(0.025), // Ø 50 mm
  createSolidRoundSection(0.040), // Ø 80 mm
  createHollowTubeSection(0.040, 0.004), // Ø 80x4 mm tube (high buckling resistance)
  createHollowTubeSection(0.060, 0.005), // Ø 120x5 mm tube
];
