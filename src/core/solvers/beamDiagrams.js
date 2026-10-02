/**
 * Computes 1D continuous shear force and bending moment distributions along a bridge/beam span.
 */
export function computeBeamDiagrams(spanLengthMeters, pointLoads = [], samples = 80) {
  const points = [];
  if (spanLengthMeters <= 0) {
    return { points: [], maxShearKN: 0, maxMomentKNm: 0, maxShearX: 0, maxMomentX: 0 };
  }

  // Reactions for simply supported beam:
  // Pin at x = 0 (R_left), Roller at x = span (R_right)
  let sumMomentsAtZero = 0;
  let sumLoads = 0;

  for (const pl of pointLoads) {
    sumMomentsAtZero += pl.fy * pl.x;
    sumLoads += pl.fy;
  }

  const R_right = -sumMomentsAtZero / spanLengthMeters;
  const R_left = -sumLoads - R_right;

  let maxShear = 0;
  let maxMoment = 0;
  let maxShearX = 0;
  let maxMomentX = 0;

  const dx = spanLengthMeters / samples;

  for (let i = 0; i <= samples; i++) {
    const x = i * dx;

    // V(x)
    let vx = R_left;
    for (const pl of pointLoads) {
      if (pl.x <= x) {
        vx += pl.fy;
      }
    }

    // M(x)
    let mx = R_left * x;
    for (const pl of pointLoads) {
      if (pl.x <= x) {
        mx += pl.fy * (x - pl.x);
      }
    }

    const shearKN = vx / 1000;
    const momentKNm = mx / 1000;

    points.push({ x, shearKN, momentKNm });

    if (Math.abs(shearKN) > Math.abs(maxShear)) {
      maxShear = shearKN;
      maxShearX = x;
    }

    if (Math.abs(momentKNm) > Math.abs(maxMoment)) {
      maxMoment = momentKNm;
      maxMomentX = x;
    }
  }

  return {
    points,
    maxShearKN: maxShear,
    maxMomentKNm: maxMoment,
    maxShearX,
    maxMomentX,
  };
}
