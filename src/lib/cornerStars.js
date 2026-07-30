// Hand-placed decorative stars scattered into each corner of the sky, plus a few along
// the middle of each side — irregular sizes/positions/kinds on purpose, so it reads as
// an actual patch of night sky rather than a neat, obviously-mirrored pattern.
//
// These live in the same data space as the hubs (not fixed screen pixels), so they
// pan and zoom together with the rest of the constellation instead of staying pinned
// to the viewport — each entry is an offset from one edge of the hub bounding box
// (plus margin), resolved to an absolute x/y by cornerStarPositions() below.
// kind is "solid" (filled sparkle), "outline" (stroked sparkle), or "dot" (plain circle).
const RAW_CORNER_STARS = [
  // top-left
  { top: 31, left: 40, size: 70, opacity: 0.85, kind: "solid" },
  { top: 75, left: 163, size: 29, opacity: 0.5, kind: "outline" },
  { top: 132, left: 84, size: 44, opacity: 0.65, kind: "solid" },
  { top: 180, left: 211, size: 22, opacity: 0.45, kind: "dot" },
  { top: 48, left: 255, size: 33, opacity: 0.55, kind: "outline" },
  { top: 216, left: 44, size: 26, opacity: 0.5, kind: "dot" },

  // top-right
  { top: 40, right: 48, size: 62, opacity: 0.8, kind: "solid" },
  { top: 92, right: 150, size: 26, opacity: 0.5, kind: "dot" },
  { top: 141, right: 70, size: 40, opacity: 0.6, kind: "outline" },
  { top: 194, right: 202, size: 24, opacity: 0.45, kind: "solid" },
  { top: 44, right: 229, size: 33, opacity: 0.55, kind: "dot" },
  { top: 229, right: 40, size: 44, opacity: 0.65, kind: "outline" },

  // bottom-left
  { bottom: 35, left: 53, size: 66, opacity: 0.8, kind: "solid" },
  { bottom: 84, left: 150, size: 29, opacity: 0.5, kind: "outline" },
  { bottom: 136, left: 79, size: 42, opacity: 0.6, kind: "solid" },
  { bottom: 189, left: 211, size: 22, opacity: 0.45, kind: "dot" },
  { bottom: 53, left: 246, size: 35, opacity: 0.55, kind: "dot" },
  { bottom: 220, left: 40, size: 29, opacity: 0.5, kind: "outline" },

  // bottom-right
  { bottom: 31, right: 44, size: 75, opacity: 0.85, kind: "solid" },
  { bottom: 79, right: 141, size: 26, opacity: 0.5, kind: "dot" },
  { bottom: 132, right: 66, size: 46, opacity: 0.65, kind: "outline" },
  { bottom: 185, right: 194, size: 24, opacity: 0.45, kind: "solid" },
  { bottom: 44, right: 238, size: 33, opacity: 0.55, kind: "outline" },
  { bottom: 224, right: 35, size: 40, opacity: 0.6, kind: "dot" },

  // left edge, middle
  { midOffset: -145, left: 26, size: 35, opacity: 0.5, kind: "outline" },
  { midOffset: 0, left: 53, size: 51, opacity: 0.7, kind: "solid" },
  { midOffset: 128, left: 33, size: 29, opacity: 0.45, kind: "dot" },

  // right edge, middle
  { midOffset: -114, right: 35, size: 31, opacity: 0.5, kind: "dot" },
  { midOffset: 0, right: 57, size: 53, opacity: 0.72, kind: "solid" },
  { midOffset: 136, right: 29, size: 37, opacity: 0.55, kind: "outline" },
];

// Resolves the corner-relative offsets above into absolute positions in the same data
// space as hubs, computed once from the hub layout (see the useMemo in Graph.jsx) —
// hubs drift continuously, and recomputing this from their live position every frame
// made the whole field reshuffle each frame, which read as blinking.
export function cornerStarPositions(hubs, { margin = 90 } = {}) {
  if (!hubs.length) return [];

  const minX = Math.min(...hubs.map((h) => h.x)) - margin;
  const maxX = Math.max(...hubs.map((h) => h.x)) + margin;
  const minY = Math.min(...hubs.map((h) => h.y)) - margin;
  const maxY = Math.max(...hubs.map((h) => h.y)) + margin;
  const midY = (minY + maxY) / 2;

  return RAW_CORNER_STARS.map((s, i) => {
    const x = s.left !== undefined ? minX + s.left : maxX - s.right;
    const y =
      s.midOffset !== undefined ? midY + s.midOffset
      : s.top !== undefined ? minY + s.top
      : maxY - s.bottom;
    return { key: `cornerstar-${i}`, x, y, size: s.size, opacity: s.opacity, kind: s.kind };
  });
}
