// Classic 4-point "sparkle"/twinkle star, centered at (cx, cy) with tips at radius r —
// smooth concave curves between the points (quadratic curves pulled in close to
// center), not straight edges, which is what actually reads as a sparkle rather than
// a plain diamond/cross.
export function sparklePath(cx, cy, r) {
  const innerR = r * 0.14;
  const tipAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]; // top, right, bottom, left
  const outer = tipAngles.map((a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]);

  let d = `M${outer[0][0]},${outer[0][1]} `;
  for (let i = 0; i < 4; i++) {
    const a0 = tipAngles[i];
    const a1 = tipAngles[(i + 1) % 4];
    const mid = a0 + (a1 - a0 < 0 ? a1 - a0 + Math.PI * 2 : a1 - a0) / 2;
    const [nx, ny] = outer[(i + 1) % 4];
    const ix = cx + innerR * Math.cos(mid);
    const iy = cy + innerR * Math.sin(mid);
    d += `Q${ix},${iy} ${nx},${ny} `;
  }
  return d + "Z";
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Small decorative stars scattered into the open gaps between hub clusters. Meant to
// be computed once (see the useMemo in Graph.jsx) from the hub/satellite layout, not
// recalculated as hubs gently drift — recomputing this from their live position every
// frame previously made the whole field subtly reshuffle each frame, which read as
// blinking. Kept clear of every hub, every satellite, and the sky-lines connecting
// hub to hub, so they never land in the "lanes" or on top of the constellation itself.
export function midSkyStarPositions(hubs, satellites = [], {
  minHubDistance = 210,
  minSatelliteDistance = 40,
  minLineDistance = 26,
  spacing = 55,
  maxStars = 160,
  margin = 90,
} = {}) {
  if (!hubs.length) return [];

  const minX = Math.min(...hubs.map((h) => h.x)) - margin;
  const maxX = Math.max(...hubs.map((h) => h.x)) + margin;
  const minY = Math.min(...hubs.map((h) => h.y)) - margin;
  const maxY = Math.max(...hubs.map((h) => h.y)) + margin;

  // the sky-lines rendered in Graph.jsx connect each hub to the next, in order
  const skyLines = hubs.map((h, i) => {
    const next = hubs[(i + 1) % hubs.length];
    return [h.x, h.y, next.x, next.y];
  });

  const candidates = [];
  for (let gx = minX; gx <= maxX; gx += spacing) {
    for (let gy = minY; gy <= maxY; gy += spacing) {
      const seed = Math.abs(Math.round(gx * 7 + gy * 13)) % 97;
      const x = gx + ((seed % 17) - 8) * 4;
      const y = gy + ((seed % 23) - 11) * 3.6;

      if (hubs.some((h) => Math.hypot(h.x - x, h.y - y) < minHubDistance)) continue;
      if (satellites.some((s) => Math.hypot(s.x - x, s.y - y) < minSatelliteDistance)) continue;
      if (skyLines.some(([x1, y1, x2, y2]) => distToSegment(x, y, x1, y1, x2, y2) < minLineDistance)) continue;

      candidates.push({ x, y, seed });
    }
  }

  return candidates.slice(0, maxStars).map((c, i) => ({
    key: `midstar-${i}`,
    x: c.x,
    y: c.y,
    r: 3 + (c.seed % 4) * 1.2,
    sparkle: c.seed % 3 !== 0,
  }));
}
