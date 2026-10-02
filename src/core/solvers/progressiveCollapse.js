import { solveTrussFEA } from './trussFea';

/**
 * Runs an incremental destructive test on the truss structure.
 * Progressively ramps load from 1.0x up to 4.0x until initial failure occurs,
 * then tracks progressive failure redistribution and structural collapse.
 */
export function simulateDestructiveFailure(
  nodes,
  members,
  startMultiplier = 1.0,
  maxMultiplier = 4.0,
  steps = 30
) {
  const activeMembers = [...members];
  const failedMemberIds = new Set();
  const collapseSteps = [];

  let criticalMultiplier = 1.0;
  let initiatingMember = null;
  let hasInitiated = false;

  const dMultiplier = (maxMultiplier - startMultiplier) / steps;

  // Step 1: Ramp load to find initiating failure point
  for (let s = 0; s <= steps; s++) {
    const currentMult = startMultiplier + s * dMultiplier;
    const result = solveTrussFEA(nodes, activeMembers, currentMult);

    if (!result.isStable) {
      if (!hasInitiated) {
        return null;
      }
      break;
    }

    if (result.failedMembersCount > 0 && !hasInitiated) {
      hasInitiated = true;
      criticalMultiplier = currentMult;

      // Identify the worst-performing initiating member
      let worstRatio = 0;
      for (const m of Object.values(result.members)) {
        if (m.state === 'failed' && m.stressRatio > worstRatio) {
          worstRatio = m.stressRatio;
          initiatingMember = m;
        }
      }

      collapseSteps.push({
        stepIndex: 0,
        loadMultiplier: currentMult,
        newlyFailedMemberIds: initiatingMember ? [initiatingMember.id] : [],
        allFailedMemberIds: initiatingMember ? [initiatingMember.id] : [],
        solverResult: result,
        description: `Initial structural failure detected at ${(currentMult * 100).toFixed(0)}% rated load. Member ${initiatingMember?.id} exceeded safety threshold.`,
        isTotalCollapse: false,
      });

      if (initiatingMember) {
        failedMemberIds.add(initiatingMember.id);
      }
      break;
    }
  }

  if (!hasInitiated || !initiatingMember) {
    return null;
  }

  // Step 2: Progressive load redistribution
  let remainingMembers = activeMembers.filter((m) => !failedMemberIds.has(m.id));
  let stepCounter = 1;

  while (stepCounter < 8 && remainingMembers.length > 0) {
    const nextResult = solveTrussFEA(nodes, remainingMembers, criticalMultiplier);

    if (!nextResult.isStable) {
      collapseSteps.push({
        stepIndex: stepCounter,
        loadMultiplier: criticalMultiplier,
        newlyFailedMemberIds: [],
        allFailedMemberIds: Array.from(failedMemberIds),
        solverResult: nextResult,
        description: 'Catastrophic kinematic collapse! Remaining framework forms a mechanism (det[K] = 0).',
        isTotalCollapse: true,
      });
      break;
    }

    const newlyFailed = [];
    for (const m of Object.values(nextResult.members)) {
      if (m.state === 'failed') {
        newlyFailed.push(m.id);
        failedMemberIds.add(m.id);
      }
    }

    if (newlyFailed.length === 0) {
      collapseSteps.push({
        stepIndex: stepCounter,
        loadMultiplier: criticalMultiplier,
        newlyFailedMemberIds: [],
        allFailedMemberIds: Array.from(failedMemberIds),
        solverResult: nextResult,
        description: `Structure arrested failure! Redundant alternate load paths held at ${(criticalMultiplier * 100).toFixed(0)}% load.`,
        isTotalCollapse: false,
      });
      break;
    }

    collapseSteps.push({
      stepIndex: stepCounter,
      loadMultiplier: criticalMultiplier,
      newlyFailedMemberIds: newlyFailed,
      allFailedMemberIds: Array.from(failedMemberIds),
      solverResult: nextResult,
      description: `Progressive failure: Load redistributed, causing ${newlyFailed.length} secondary member(s) to fail.`,
      isTotalCollapse: false,
    });

    remainingMembers = remainingMembers.filter((m) => !failedMemberIds.has(m.id));
    stepCounter++;
  }

  // Generate engineering diagnosis & redesign recommendation
  let failureModeName = 'Tensile Yielding';
  let diagnosis = '';
  let recommendation = '';

  if (initiatingMember.failureMode === 'euler_buckling') {
    failureModeName = 'Euler Column Buckling';
    diagnosis = `Member ${initiatingMember.id} suffered catastrophic compressive buckling. Even though the material did not reach its ultimate crushing strength, the high slenderness ratio (L / r) triggered elastic geometric instability at ${(Math.abs(initiatingMember.axialForce) / 1000).toFixed(1)} kN.`;
    recommendation = `Increase the second moment of area (I) by switching from a solid rod to a larger-diameter hollow tubular section (Tube Ø 80×4 mm or Ø 120×5 mm), or add an intermediate node to subdivide the compression member length in half (buckling capacity scales with 1/L²).`;
  } else if (initiatingMember.failureMode === 'yield_compression') {
    failureModeName = 'Compressive Yielding';
    diagnosis = `Member ${initiatingMember.id} experienced crushing under compressive stress of ${(Math.abs(initiatingMember.axialStress) / 1e6).toFixed(1)} MPa, surpassing the material yield limit.`;
    recommendation = `Increase cross-sectional area (A) or upgrade to High-Strength Low-Alloy Steel (HSLA) or Titanium Ti-6Al-4V.`;
  } else {
    failureModeName = 'Tensile Plastic Rupture';
    diagnosis = `Member ${initiatingMember.id} reached a tensile stress of ${(initiatingMember.axialStress / 1e6).toFixed(1)} MPa, exceeding yield strength. The member experienced necking and tensile rupture.`;
    recommendation = `Increase the cross-sectional area of member ${initiatingMember.id}, or re-orient web diagonals so tension is distributed more evenly across multiple parallel chords.`;
  }

  const isTotal = collapseSteps.some((s) => s.isTotalCollapse);

  return {
    criticalFailureLoadMultiplier: criticalMultiplier,
    initiatingMemberId: initiatingMember.id,
    initiatingFailureMode: failureModeName,
    initiatingStressMPa: initiatingMember.axialStress / 1e6,
    initiatingEulerPcrKN: initiatingMember.eulerBucklingLoad / 1000,
    collapseSteps,
    isTotalCollapse: isTotal,
    engineeringDiagnosis: diagnosis,
    redesignRecommendation: recommendation,
  };
}
