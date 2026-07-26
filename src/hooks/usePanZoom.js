import { useRef, useEffect, useCallback } from "react";
import { clampCameraBox } from "../lib/camera.js";

export function usePanZoom(svgElRef, camera, cameraRef, setCameraDirect, cancelFlight) {
  const pointers = useRef(new Map()); // pointerId -> {x, y} in client coords
  const dragState = useRef(null); // { lastClientX, lastClientY } for single-pointer pan
  const pinchState = useRef(null); // { startDist, startCamera, midClient }
  const dragDistanceRef = useRef(0); // accumulated drag distance since pointerdown, in client px
  const suppressClickRef = useRef(false);
  const capturedPointers = useRef(new Set()); // pointerIds we've called setPointerCapture on

  const clientToViewBoxScale = useCallback(() => {
    const el = svgElRef.current;
    if (!el) return { sx: 1, sy: 1 };
    const rect = el.getBoundingClientRect();
    const cam = cameraRef.current;
    return {
      sx: cam.w / rect.width,
      sy: cam.h / rect.height,
      rect,
    };
  }, [svgElRef, cameraRef]);

  useEffect(() => {
    const el = svgElRef.current;
    if (!el) return;

    const onPointerDown = (e) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      dragDistanceRef.current = 0;

      if (pointers.current.size === 1) {
        dragState.current = { lastClientX: e.clientX, lastClientY: e.clientY };
      } else if (pointers.current.size === 2) {
        cancelFlight();
        dragState.current = null;
        const pts = Array.from(pointers.current.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        pinchState.current = {
          startDist: dist || 1,
          startCamera: { ...cameraRef.current },
          midClient: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
        };
        // a pinch is never a simple click, safe to capture both pointers immediately
        el.setPointerCapture && el.setPointerCapture(e.pointerId);
        capturedPointers.current.add(e.pointerId);
      }
    };

    const onPointerMove = (e) => {
      if (!pointers.current.has(e.pointerId)) return;
      const prev = pointers.current.get(e.pointerId);
      dragDistanceRef.current += Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // only capture the pointer (and cancel any in-flight camera animation) once real
      // movement is confirmed. Capturing on a plain click/tap can retarget the follow-up
      // click event away from the actual clicked hub/satellite, and cancelling a flyTo
      // on every pointerdown would kill an in-progress zoom before it reaches its target
      // the instant the next click's pointerdown fires.
      if (dragDistanceRef.current > 6 && !capturedPointers.current.has(e.pointerId)) {
        el.setPointerCapture && el.setPointerCapture(e.pointerId);
        capturedPointers.current.add(e.pointerId);
        cancelFlight();
      }

      if (pointers.current.size === 2 && pinchState.current) {
        const pts = Array.from(pointers.current.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const { sx, sy, rect } = clientToViewBoxScale();
        const scaleFactor = pinchState.current.startDist / (dist || 1);
        const start = pinchState.current.startCamera;

        const newW = clampCameraBox({ ...start, w: start.w * scaleFactor, h: start.h * scaleFactor }).w;
        const newH = (newW / start.w) * start.h;

        // keep the pinch midpoint anchored under the fingers
        const midXInBox = start.x + ((pinchState.current.midClient.x - rect.left) * sx);
        const midYInBox = start.y + ((pinchState.current.midClient.y - rect.top) * sy);
        const ratioX = (midXInBox - start.x) / start.w;
        const ratioY = (midYInBox - start.y) / start.h;

        const nextBox = {
          x: midXInBox - ratioX * newW,
          y: midYInBox - ratioY * newH,
          w: newW,
          h: newH,
        };
        setCameraDirect(clampCameraBox(nextBox));
        return;
      }

      if (pointers.current.size === 1 && dragState.current) {
        const { sx, sy } = clientToViewBoxScale();
        const dx = (e.clientX - dragState.current.lastClientX) * sx;
        const dy = (e.clientY - dragState.current.lastClientY) * sy;
        dragState.current.lastClientX = e.clientX;
        dragState.current.lastClientY = e.clientY;
        const cam = cameraRef.current;
        setCameraDirect({ ...cam, x: cam.x - dx, y: cam.y - dy });
      }
    };

    const endPointer = (e) => {
      pointers.current.delete(e.pointerId);
      capturedPointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinchState.current = null;
      if (pointers.current.size === 0) {
        dragState.current = null;
        // if the pointer moved more than a small threshold, treat it as a drag and swallow the
        // synthetic click that follows, so panning doesn't accidentally open a hub/node
        if (dragDistanceRef.current > 6) {
          suppressClickRef.current = true;
          setTimeout(() => { suppressClickRef.current = false; }, 0);
        }
        dragDistanceRef.current = 0;
      } else if (pointers.current.size === 1) {
        const [remaining] = Array.from(pointers.current.values());
        dragState.current = { lastClientX: remaining.x, lastClientY: remaining.y };
      }
    };

    // capture-phase click suppressor: if the pointerup right before this click was a real drag,
    // stop the click from reaching the hub/satellite handlers
    const onClickCapture = (e) => {
      if (suppressClickRef.current) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endPointer);
    el.addEventListener("pointercancel", endPointer);
    el.addEventListener("pointerleave", endPointer);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endPointer);
      el.removeEventListener("pointercancel", endPointer);
      el.removeEventListener("pointerleave", endPointer);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, [svgElRef, cameraRef, setCameraDirect, cancelFlight, clientToViewBoxScale]);
}
