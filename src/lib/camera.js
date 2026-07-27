import { VIEW_W, VIEW_H } from "./layout.js";

// Just an initial guess used before the first real frame measurement comes in from
// useGraph's stretched safeBox (App.jsx snaps the camera to that immediately on mount).
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
