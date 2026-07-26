export const VIEW_W = 1600;
export const VIEW_H = 700;

// Spread across a wide canvas (matching a typical wide-desktop window) instead of the
// original square-ish layout, so the constellation itself fills a wide frame instead of
// leaving empty gutters that would otherwise need to be letterboxed away.
export const HUB_POSITIONS = [
  { x: 220, y: 190 },
  { x: 560, y: 165 },
  { x: 900, y: 205 },
  { x: 1300, y: 175 },
  { x: 150, y: 380 },
  { x: 540, y: 355 },
  { x: 890, y: 400 },
  { x: 1260, y: 360 },
  { x: 360, y: 545 },
  { x: 1000, y: 540 },
];

export const SHAPES = ["circle", "square", "triangle", "diamond", "pentagon", "hexagon", "star", "cross", "cloud", "heart"];

// distance from each hub to its single nearest neighboring hub, used to keep satellite
// orbits from creeping into a neighboring hub's territory when hubs are packed close together
export function nearestNeighborDistances(positions) {
  return positions.map((p, i) => {
    let min = Infinity;
    positions.forEach((q, j) => {
      if (i === j) return;
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < min) min = d;
    });
    return min;
  });
}

export function satelliteOrbitParams(hub, i, total, maxOrbit = Infinity) {
  const naturalOrbit = 58 + Math.min(total, 7) * 3.2;
  // cap well inside the gap to the nearest hub, so satellites stay clearly grouped
  // with their own hub even when two hubs sit close together
  const orbit = Math.min(naturalOrbit, maxOrbit * 0.35);
  const angleOffset = (hub.x * 0.013 + hub.y * 0.021) % (Math.PI * 2);
  const baseAngle = (2 * Math.PI * i) / Math.max(total, 1) + angleOffset;
  // vary speed/direction per satellite so they don't move in lockstep
  const seed = (hub.x * 7 + hub.y * 13 + i * 29) % 97;
  const direction = seed % 2 === 0 ? 1 : -1;
  const speed = 0.045 + (seed % 11) * 0.006; // radians per second, slow drift
  return { orbit, baseAngle, direction, speed };
}

// small, slow circular wobble around a hub's base position — same math shape as satellite
// orbits, just a much smaller radius and slower speed, so hubs feel gently alive rather
// than orbiting like their satellites do
export function hubDriftParams(hub) {
  const orbit = 12 + ((hub.x * 3 + hub.y * 5) % 8); // ~12-20 units
  const baseAngle = (hub.x * 0.021 + hub.y * 0.017) % (Math.PI * 2);
  const seed = (hub.x * 11 + hub.y * 19) % 97;
  const direction = seed % 2 === 0 ? 1 : -1;
  const speed = 0.012 + (seed % 7) * 0.003; // noticeably slower than satellite orbit speed
  return { orbit, baseAngle, direction, speed };
}

export function positionAtTime(hub, params, elapsedSeconds) {
  const angle = params.baseAngle + params.direction * params.speed * elapsedSeconds;
  return {
    x: hub.x + params.orbit * Math.cos(angle),
    y: hub.y + params.orbit * Math.sin(angle),
  };
}

export const MIN_ANGLE_SEP = 0.34; // radians, ~19.5deg minimum gap between two satellites on the same hub

export function resolveAngularOverlap(entries) {
  // entries: [{ key, angle, orbit }], for satellites sharing one hub
  // sort by angle, then push apart any pair closer than MIN_ANGLE_SEP, wrapping around the circle
  const sorted = [...entries].sort((a, b) => a.angle - b.angle);
  const n = sorted.length;
  if (n < 2) return sorted;

  // a few relaxation passes is enough for these small counts (<=7) to settle
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < n; i++) {
      const a = sorted[i];
      const b = sorted[(i + 1) % n];
      let gap = b.angle - a.angle;
      if (i === n - 1) gap += 2 * Math.PI; // wrap-around gap
      if (gap < MIN_ANGLE_SEP) {
        const push = (MIN_ANGLE_SEP - gap) / 2;
        a.angle -= push;
        b.angle += push;
      }
    }
  }
  return sorted;
}
