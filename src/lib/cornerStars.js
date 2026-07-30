// Hand-placed decorative stars scattered into each corner of the frame — irregular
// sizes/positions/kinds on purpose, so it reads as an actual patch of night sky
// rather than a neat, obviously-mirrored pattern. Purely static screen-space
// decoration, unrelated to the pannable/zoomable graph underneath. kind is "solid"
// (filled sparkle), "outline" (stroked sparkle), or "dot" (plain small circle).
export const CORNER_STARS = [
  // top-left
  { top: 14, left: 18, size: 32, opacity: 0.85, kind: "solid" },
  { top: 34, left: 74, size: 13, opacity: 0.5, kind: "outline" },
  { top: 60, left: 38, size: 20, opacity: 0.65, kind: "solid" },
  { top: 82, left: 96, size: 10, opacity: 0.45, kind: "dot" },
  { top: 22, left: 116, size: 15, opacity: 0.55, kind: "outline" },
  { top: 98, left: 20, size: 12, opacity: 0.5, kind: "dot" },

  // top-right
  { top: 18, right: 22, size: 28, opacity: 0.8, kind: "solid" },
  { top: 42, right: 68, size: 12, opacity: 0.5, kind: "dot" },
  { top: 64, right: 32, size: 18, opacity: 0.6, kind: "outline" },
  { top: 88, right: 92, size: 11, opacity: 0.45, kind: "solid" },
  { top: 20, right: 104, size: 15, opacity: 0.55, kind: "dot" },
  { top: 104, right: 18, size: 20, opacity: 0.65, kind: "outline" },

  // bottom-left
  { bottom: 16, left: 24, size: 30, opacity: 0.8, kind: "solid" },
  { bottom: 38, left: 68, size: 13, opacity: 0.5, kind: "outline" },
  { bottom: 62, left: 36, size: 19, opacity: 0.6, kind: "solid" },
  { bottom: 86, left: 96, size: 10, opacity: 0.45, kind: "dot" },
  { bottom: 24, left: 112, size: 16, opacity: 0.55, kind: "dot" },
  { bottom: 100, left: 18, size: 13, opacity: 0.5, kind: "outline" },

  // bottom-right
  { bottom: 14, right: 20, size: 34, opacity: 0.85, kind: "solid" },
  { bottom: 36, right: 64, size: 12, opacity: 0.5, kind: "dot" },
  { bottom: 60, right: 30, size: 21, opacity: 0.65, kind: "outline" },
  { bottom: 84, right: 88, size: 11, opacity: 0.45, kind: "solid" },
  { bottom: 20, right: 108, size: 15, opacity: 0.55, kind: "outline" },
  { bottom: 102, right: 16, size: 18, opacity: 0.6, kind: "dot" },

  // left edge, middle
  { top: "calc(50% - 66px)", left: 12, size: 16, opacity: 0.5, kind: "outline" },
  { top: "50%", left: 24, size: 23, opacity: 0.7, kind: "solid" },
  { top: "calc(50% + 58px)", left: 15, size: 13, opacity: 0.45, kind: "dot" },

  // right edge, middle
  { top: "calc(50% - 52px)", right: 16, size: 14, opacity: 0.5, kind: "dot" },
  { top: "50%", right: 26, size: 24, opacity: 0.72, kind: "solid" },
  { top: "calc(50% + 62px)", right: 13, size: 17, opacity: 0.55, kind: "outline" },
];
