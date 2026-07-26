import { VIEW_W, VIEW_H } from "./layout.js";

// Crop tightly to where the hubs actually are (x:150-1300, y:165-540) plus margin for
// their orbiting satellites (max orbit radius ~80 units), rather than showing the whole
// nominal canvas — this keeps the constellation filling the frame instead of looking small.
export const DEFAULT_CAMERA = { x: 40, y: 55, w: 1370, h: 595 };

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
