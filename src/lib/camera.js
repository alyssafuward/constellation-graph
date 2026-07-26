import { VIEW_W, VIEW_H } from "./layout.js";

// Crop tightly to where the hubs actually are (x:150-1300, y:165-540) plus margin for
// their orbiting satellites (max orbit radius ~80 units), rather than showing the whole
// nominal canvas — this keeps the constellation filling the frame instead of looking small.
export const DEFAULT_CAMERA = { x: 40, y: 55, w: 1370, h: 595 };

// Computes the tightest possible box matching containerRatio that still fully contains
// safeBox (never crops any hub/satellite) — grows only whichever dimension the ratio
// actually requires, rather than always expanding both, so there's no unnecessary
// leftover white space on either axis.
export function computeMinimalCoverCamera(containerRatio, safeBox = DEFAULT_CAMERA) {
  const cx = safeBox.x + safeBox.w / 2;
  const cy = safeBox.y + safeBox.h / 2;
  const h = Math.max(safeBox.h, safeBox.w / containerRatio);
  const w = h * containerRatio;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

export function boxFor(cx, cy, size) {
  return { x: cx - size / 2, y: cy - size / 2, w: size, h: size };
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const MIN_CAMERA_SIZE = 40; // deepest allowed zoom-in, in viewBox units
export const MAX_CAMERA_SIZE = Math.max(VIEW_W, VIEW_H) * 2.5; // furthest allowed zoom-out, generous enough for wide/tall containers

export function clampCameraBox(box) {
  const w = Math.min(MAX_CAMERA_SIZE, Math.max(MIN_CAMERA_SIZE, box.w));
  const h = Math.min(MAX_CAMERA_SIZE, Math.max(MIN_CAMERA_SIZE, box.h));
  return { x: box.x, y: box.y, w, h };
}
