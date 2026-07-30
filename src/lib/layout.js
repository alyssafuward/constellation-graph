export const VIEW_W = 1600;
export const VIEW_H = 700;

// Design-space hub positions (roughly a 16:9-ish layout). These get stretched per-axis at
// render time to match whatever shape the actual frame is — see stretchPositions below —
// so the constellation always fills the frame with no wasted margin on either axis,
// regardless of window shape, without distorting the shapes themselves.
export const HUB_POSITIONS = [
  { x: 166.5, y: 381.6 }, // q1 who they are
  { x: 427.2, y: 123.9 }, // q2 first reaction
  { x: 909.6, y: 120 },   // q3 concerns
  { x: 542.6, y: 353.7 }, // q4 mixed feelings
  { x: 957.5, y: 368.9 }, // q5 on transparency
  { x: 1207.7, y: 171.5 },// q6 worst case
  { x: 1429.5, y: 282 },  // q7 what changes
  { x: 1207.3, y: 503.9 },// q8 reading a score
  { x: 794.4, y: 568.3 }, // q9 advice
  { x: 426, y: 567.5 },   // q10 anything else (heart)
];

// Stretches positions around their shared center so the resulting bounding box's aspect
// ratio exactly matches containerRatio — growing only whichever axis is actually needed,
// leaving the other axis untouched. Shapes are drawn at a fixed size independent of this,
// so stretching moves hubs apart/together without distorting them.
export function stretchPositions(positions, containerRatio) {
  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const contentRatio = (maxX - minX) / (maxY - minY);

  let scaleX = 1;
  let scaleY = 1;
  if (containerRatio > contentRatio) {
    scaleX = containerRatio / contentRatio;
  } else {
    scaleY = contentRatio / containerRatio;
  }

  return positions.map((p) => ({
    x: centerX + (p.x - centerX) * scaleX,
    y: centerY + (p.y - centerY) * scaleY,
  }));
}

// The camera box that shows a set of (already-stretched) hub positions plus enough margin
// for their orbiting satellites (max orbit radius is naturally capped at ~80 units).
export function computeSafeBox(positions, margin = 90) {
  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const minX = Math.min(...xs) - margin;
  const maxX = Math.max(...xs) + margin;
  const minY = Math.min(...ys) - margin;
  const maxY = Math.max(...ys) + margin;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

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

  // hub labels are baked into the sticker art now (no separate text sitting above the
  // shape), so satellites are free to spread all the way around the full circle
  const n = Math.max(total, 1);
  const allowedStart = -Math.PI / 2;
  const allowedSweep = 2 * Math.PI;
  const spacing = allowedSweep / n;
  // each satellite gets its own fixed slot spread across the allowed arc, then wobbles
  // gently in place — never sweeping the full circle, so it can never drift back up
  // into the excluded wedge no matter how long it runs
  const centerAngle = allowedStart + spacing * (i + 0.5);
  const wobbleAmplitude = Math.min(0.28, spacing * 0.4);

  // vary phase/speed/direction per satellite so they don't wobble in lockstep.
  // wobbling within a small arc (instead of sweeping the full circle like before) means the
  // same angular speed now covers far less visual distance per second, so it's boosted here
  // to land back at roughly the pace satellites moved at before this wobble model.
  const phase = (hub.x * 0.013 + hub.y * 0.021) % (Math.PI * 2);
  const seed = (hub.x * 7 + hub.y * 13 + i * 29) % 97;
  const direction = seed % 2 === 0 ? 1 : -1;
  const speed = (0.045 + (seed % 11) * 0.006) * 4;
  return { orbit, centerAngle, wobbleAmplitude, phase, direction, speed };
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

// hub drift: a plain circular orbit around the hub's own base position
export function positionAtTime(hub, params, elapsedSeconds) {
  const angle = params.baseAngle + params.direction * params.speed * elapsedSeconds;
  return {
    x: hub.x + params.orbit * Math.cos(angle),
    y: hub.y + params.orbit * Math.sin(angle),
  };
}

// satellite position: a fixed slot within the allowed arc (see satelliteOrbitParams),
// wobbling gently in place rather than sweeping the full circle
export function satellitePositionAtTime(hub, params, elapsedSeconds) {
  const wobble = params.wobbleAmplitude * Math.sin(params.phase + params.direction * params.speed * elapsedSeconds);
  const angle = params.centerAngle + wobble;
  return {
    x: hub.x + params.orbit * Math.cos(angle),
    y: hub.y + params.orbit * Math.sin(angle),
  };
}
