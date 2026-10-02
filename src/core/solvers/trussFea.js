import { MATERIAL_DATABASE } from '../materials.js';

/**
 * Solves a 2D/3D pin-jointed truss system using the Direct Stiffness Method (DSM).
 * Includes Euler column buckling and von Mises tensile/compressive yield criteria.
 *
 * @param {Array} nodes
 * @param {Array} members
 * @param {number} loadMultiplier
 */
export function solveTrussFEA(nodes, members, loadMultiplier = 1.0) {
  const nodeCount = nodes.length;
  const memberCount = members.length;

  if (nodeCount < 2 || memberCount === 0) {
    return createEmptyResult('Structure requires at least 2 nodes and 1 member.');
  }

  // Node ID to index mapping
  const nodeIndexMap = new Map();
  nodes.forEach((n, idx) => nodeIndexMap.set(n.id, idx));

  // Verify all members have valid nodes
  for (const m of members) {
    if (!nodeIndexMap.has(m.nodeAId) || !nodeIndexMap.has(m.nodeBId)) {
      return createEmptyResult(`Member ${m.id} references non-existent node.`);
    }
  }

  const dof = nodeCount * 3;
  // Initialize Global Stiffness Matrix [K] and Load Vector {F}
  const K = new Float64Array(dof * dof);
  const F = new Float64Array(dof);

  // Populate applied loads (scaled by loadMultiplier)
  nodes.forEach((node, i) => {
    F[i * 3 + 0] = (node.fx || 0) * loadMultiplier;
    F[i * 3 + 1] = (node.fy || 0) * loadMultiplier;
    F[i * 3 + 2] = (node.fz || 0) * loadMultiplier;
  });

  // Assemble Element Stiffness Matrices into Global [K]
  for (const member of members) {
    const iA = nodeIndexMap.get(member.nodeAId);
    const iB = nodeIndexMap.get(member.nodeBId);
    const nA = nodes[iA];
    const nB = nodes[iB];

    const dx = nB.x - nA.x;
    const dy = nB.y - nA.y;
    const dz = nB.z - nA.z;
    const L = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (L < 1e-5) continue; // Zero-length element skip

    const cx = dx / L;
    const cy = dy / L;
    const cz = dz / L;

    const mat = MATERIAL_DATABASE[member.materialId] || MATERIAL_DATABASE.structural_steel_a36;
    const E = mat.elasticModulus;
    const A = member.crossSection.area;
    const kCoeff = (E * A) / L;

    const lambda = [cx, cy, cz, -cx, -cy, -cz];
    const dofIndices = [
      iA * 3 + 0,
      iA * 3 + 1,
      iA * 3 + 2,
      iB * 3 + 0,
      iB * 3 + 1,
      iB * 3 + 2,
    ];

    for (let r = 0; r < 6; r++) {
      const globalRow = dofIndices[r];
      for (let c = 0; c < 6; c++) {
        const globalCol = dofIndices[c];
        K[globalRow * dof + globalCol] += kCoeff * lambda[r] * lambda[c];
      }
    }
  }

  // Preserve copy of original unconstrained [K] to compute support reactions: {R} = [K_orig]{u} - {F}
  const KOriginal = new Float64Array(K);

  // Apply Boundary Conditions
  // For each locked DOF, zero out row & column, set diagonal = 1.0, F = 0
  const isConstrainedDOF = new Uint8Array(dof);
  nodes.forEach((node, i) => {
    for (let axis = 0; axis < 3; axis++) {
      if (node.constraint[axis] === 1) {
        const d = i * 3 + axis;
        isConstrainedDOF[d] = 1;

        for (let col = 0; col < dof; col++) {
          K[d * dof + col] = 0.0;
        }
        K[d * dof + d] = 1.0;
        F[d] = 0.0;
      }
    }
  });

  // Auto-constrain inactive degrees of freedom (e.g. out-of-plane Z in 2D planar trusses)
  for (let d = 0; d < dof; d++) {
    if (Math.abs(K[d * dof + d]) < 1e-12) {
      for (let col = 0; col < dof; col++) {
        K[d * dof + col] = 0.0;
      }
      K[d * dof + d] = 1.0;
      F[d] = 0.0;
    }
  }

  // Solve [K]{u} = {F} using Gaussian Elimination with Partial Pivoting
  const u = solveLinearSystem(K, F, dof);
  if (!u) {
    return createEmptyResult('Structure is kinematically unstable (singular stiffness matrix / mechanism). Add supports or triangulation.');
  }

  // Check for NaN or extreme runaway displacements
  let maxDispMagnitude = 0;
  let maxDispNodeId = null;
  const displacements = {};

  nodes.forEach((node, i) => {
    const dx = u[i * 3 + 0];
    const dy = u[i * 3 + 1];
    const dz = u[i * 3 + 2];

    if (isNaN(dx) || isNaN(dy) || isNaN(dz) || !isFinite(dx) || !isFinite(dy) || !isFinite(dz)) {
      maxDispMagnitude = Infinity;
    }

    const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (mag > maxDispMagnitude) {
      maxDispMagnitude = mag;
      maxDispNodeId = node.id;
    }

    displacements[node.id] = [dx, dy, dz];
  });

  if (maxDispMagnitude === Infinity) {
    return createEmptyResult('Numerical divergence: Displacements exploded. Check that all nodes are constrained or triangulated.');
  }

  // Calculate Support Reactions: {R} = [K_orig] * {u} - {F_applied}
  const reactions = {};
  nodes.forEach((node, i) => {
    let rx = 0;
    let ry = 0;
    let rz = 0;

    for (let col = 0; col < dof; col++) {
      rx += KOriginal[(i * 3 + 0) * dof + col] * u[col];
      ry += KOriginal[(i * 3 + 1) * dof + col] * u[col];
      rz += KOriginal[(i * 3 + 2) * dof + col] * u[col];
    }

    // Subtract applied loads to yield pure reaction
    rx -= (node.fx || 0) * loadMultiplier;
    ry -= (node.fy || 0) * loadMultiplier;
    rz -= (node.fz || 0) * loadMultiplier;

    reactions[node.id] = {
      nodeId: node.id,
      rx: node.constraint[0] === 1 ? rx : 0,
      ry: node.constraint[1] === 1 ? ry : 0,
      rz: node.constraint[2] === 1 ? rz : 0,
    };
  });

  // Calculate Member Forces, Stresses, Buckling, and Factors of Safety
  const memberAnalyses = {};
  let minFOS = Infinity;
  let criticalMemberId = null;
  let totalMass = 0;
  let totalCost = 0;
  let totalStrainEnergy = 0;
  let failedCount = 0;

  for (const member of members) {
    const iA = nodeIndexMap.get(member.nodeAId);
    const iB = nodeIndexMap.get(member.nodeBId);
    const nA = nodes[iA];
    const nB = nodes[iB];

    const dx = nB.x - nA.x;
    const dy = nB.y - nA.y;
    const dz = nB.z - nA.z;
    const L = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const cx = dx / L;
    const cy = dy / L;
    const cz = dz / L;

    const uAx = u[iA * 3 + 0];
    const uAy = u[iA * 3 + 1];
    const uAz = u[iA * 3 + 2];
    const uBx = u[iB * 3 + 0];
    const uBy = u[iB * 3 + 1];
    const uBz = u[iB * 3 + 2];

    // Elongation: delta_L = (uB - uA) . lambda
    const deltaL = (uBx - uAx) * cx + (uBy - uAy) * cy + (uBz - uAz) * cz;
    const strain = deltaL / L;

    const mat = MATERIAL_DATABASE[member.materialId] || MATERIAL_DATABASE.structural_steel_a36;
    const E = mat.elasticModulus;
    const A = member.crossSection.area;
    const I = member.crossSection.momentOfInertia;
    const yieldStress = mat.yieldStrength;

    const axialStress = E * strain; // Pa
    const axialForce = axialStress * A; // N

    // Euler Critical Buckling Load: P_cr = (pi^2 * E * I) / L^2
    const eulerPcr = (Math.PI * Math.PI * E * I) / (L * L);

    // Factor of safety & failure mode
    let failureMode = 'none';
    let fos = 100.0;
    const absStress = Math.abs(axialStress);
    const stressRatio = absStress / yieldStress;

    if (axialForce > 0) {
      // Member in Tension
      fos = yieldStress / Math.max(absStress, 1e-4);
      if (stressRatio >= 1.0) {
        failureMode = 'yield_tension';
        failedCount++;
      }
    } else {
      // Member in Compression: Can fail by Material Yielding OR Euler Buckling
      const yieldFos = yieldStress / Math.max(absStress, 1e-4);
      const absForce = Math.abs(axialForce);
      const bucklingFos = eulerPcr / Math.max(absForce, 1e-4);

      fos = Math.min(yieldFos, bucklingFos);

      if (absForce >= eulerPcr) {
        failureMode = 'euler_buckling';
        failedCount++;
      } else if (stressRatio >= 1.0) {
        failureMode = 'yield_compression';
        failedCount++;
      }
    }

    let state = 'intact';
    if (failureMode !== 'none') {
      state = 'failed';
    } else if (stressRatio > 0.8 || fos < 1.25) {
      state = 'warning';
    }

    if (fos < minFOS) {
      minFOS = fos;
      criticalMemberId = member.id;
    }

    // Mass and Cost
    const volume = A * L; // m^3
    const massKg = volume * mat.density;
    const costUsd = massKg * mat.costPerKg;
    totalMass += massKg;
    totalCost += costUsd;

    // Strain Energy: 0.5 * P * delta_L
    const strainEnergy = 0.5 * axialForce * deltaL;
    totalStrainEnergy += Math.abs(strainEnergy);

    memberAnalyses[member.id] = {
      id: member.id,
      nodeAId: member.nodeAId,
      nodeBId: member.nodeBId,
      length: L,
      strain,
      axialForce,
      axialStress,
      stressRatio,
      eulerBucklingLoad: eulerPcr,
      factorOfSafety: Math.min(fos, 99.9),
      failureMode,
      state,
      massKg,
      costUsd,
    };
  }

  let minStressMPa = Infinity;
  let maxStressMPa = 0;
  let minStressRatio = Infinity;
  let maxStressRatio = 0;

  for (const mId in memberAnalyses) {
    const m = memberAnalyses[mId];
    const stressMPa = Math.abs(m.axialStress) / 1e6;
    if (stressMPa < minStressMPa) minStressMPa = stressMPa;
    if (stressMPa > maxStressMPa) maxStressMPa = stressMPa;
    if (m.stressRatio < minStressRatio) minStressRatio = m.stressRatio;
    if (m.stressRatio > maxStressRatio) maxStressRatio = m.stressRatio;
  }

  if (minStressMPa === Infinity) minStressMPa = 0;
  if (minStressRatio === Infinity) minStressRatio = 0;

  return {
    displacements,
    members: memberAnalyses,
    reactions,
    minFactorOfSafety: isFinite(minFOS) ? Math.min(minFOS, 99.9) : 0,
    criticalMemberId,
    maxDeflectionMeters: maxDispMagnitude,
    maxDeflectionNodeId: maxDispNodeId,
    totalMassKg: totalMass,
    totalCostUsd: totalCost,
    totalStrainEnergyJoules: totalStrainEnergy,
    isStable: true,
    failedMembersCount: failedCount,
    stressExtremes: {
      minStressMPa,
      maxStressMPa,
      minStressRatio,
      maxStressRatio,
    },
  };
}

/**
 * Solves Ax = b using Gaussian elimination with partial pivoting in pure JS.
 */
function solveLinearSystem(A, b, n) {
  const a = new Float64Array(A);
  const x = new Float64Array(b);

  for (let i = 0; i < n; i++) {
    // Find pivot row
    let maxVal = Math.abs(a[i * n + i]);
    let pivotRow = i;
    for (let r = i + 1; r < n; r++) {
      const val = Math.abs(a[r * n + i]);
      if (val > maxVal) {
        maxVal = val;
        pivotRow = r;
      }
    }

    if (maxVal < 1e-12) {
      // Singular matrix
      return null;
    }

    // Swap rows in A and x
    if (pivotRow !== i) {
      for (let c = i; c < n; c++) {
        const temp = a[i * n + c];
        a[i * n + c] = a[pivotRow * n + c];
        a[pivotRow * n + c] = temp;
      }
      const tempX = x[i];
      x[i] = x[pivotRow];
      x[pivotRow] = tempX;
    }

    // Eliminate below pivot
    const pivot = a[i * n + i];
    for (let r = i + 1; r < n; r++) {
      const factor = a[r * n + i] / pivot;
      a[r * n + i] = 0;
      for (let c = i + 1; c < n; c++) {
        a[r * n + c] -= factor * a[i * n + c];
      }
      x[r] -= factor * x[i];
    }
  }

  // Back-substitution
  for (let i = n - 1; i >= 0; i--) {
    let sum = x[i];
    for (let c = i + 1; c < n; c++) {
      sum -= a[i * n + c] * x[c];
    }
    x[i] = sum / a[i * n + i];
  }

  return x;
}

function createEmptyResult(reason) {
  return {
    displacements: {},
    members: {},
    reactions: {},
    minFactorOfSafety: 0,
    criticalMemberId: null,
    maxDeflectionMeters: 0,
    maxDeflectionNodeId: null,
    totalMassKg: 0,
    totalCostUsd: 0,
    totalStrainEnergyJoules: 0,
    isStable: false,
    unstableReason: reason,
    failedMembersCount: 0,
    stressExtremes: {
      minStressMPa: 0,
      maxStressMPa: 0,
      minStressRatio: 0,
      maxStressRatio: 0,
    },
  };
}
