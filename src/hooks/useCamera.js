import { useState, useRef, useEffect, useCallback } from "react";
import { DEFAULT_CAMERA, easeInOutCubic } from "../lib/camera.js";

// Single permanent animation loop, started once and never restarted. A "flight" is just
// data (startBox + a list of legs to visit in sequence) sitting in a ref; starting a new
// flight means overwriting that ref, not cancelling/restarting a requestAnimationFrame loop.
// This removes the whole class of race where a cancel and a fresh start fight over timing.
export function useCamera() {
  const [camera, setCamera] = useState(DEFAULT_CAMERA);
  const [transitioning, setTransitioning] = useState(false);
  const cameraRef = useRef(DEFAULT_CAMERA);
  const flightRef = useRef(null); // { startBox, legs: [{box, duration}], legIndex, legStartTime, resolve } | null
  const rafRef = useRef(null);

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  useEffect(() => {
    const loop = (now) => {
      const flight = flightRef.current;
      if (flight) {
        const leg = flight.legs[flight.legIndex];
        const from = flight.legIndex === 0 ? flight.startBox : flight.legs[flight.legIndex - 1].box;
        const t = Math.min(1, (now - flight.legStartTime) / leg.duration);
        const e = easeInOutCubic(t);
        const next = {
          x: from.x + (leg.box.x - from.x) * e,
          y: from.y + (leg.box.y - from.y) * e,
          w: from.w + (leg.box.w - from.w) * e,
          h: from.h + (leg.box.h - from.h) * e,
        };
        cameraRef.current = next;
        setCamera(next);

        if (t >= 1) {
          if (flight.legIndex + 1 < flight.legs.length) {
            flight.legIndex += 1;
            flight.legStartTime = now;
          } else {
            flightRef.current = null;
            setTransitioning(false);
            flight.resolve();
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const startFlight = useCallback((legs) => {
    return new Promise((resolve) => {
      flightRef.current = {
        startBox: { ...cameraRef.current },
        legs,
        legIndex: 0,
        legStartTime: performance.now(),
        resolve,
      };
      setTransitioning(true);
    });
  }, []);

  const flyTo = useCallback(
    (box, opts = {}) => startFlight([{ box, duration: opts.duration || 650 }]),
    [startFlight]
  );

  // multi-leg flight: pan through an intermediate box, then settle at final
  const flyVia = useCallback(
    (viaBox, finalBox) => startFlight([{ box: viaBox, duration: 850 }, { box: finalBox, duration: 900 }]),
    [startFlight]
  );

  const reset = useCallback((box) => flyTo(box || DEFAULT_CAMERA), [flyTo]);

  const cancelFlight = useCallback(() => {
    flightRef.current = null;
    setTransitioning(false);
  }, []);

  const setCameraDirect = useCallback((box) => {
    flightRef.current = null; // manual pan/zoom always wins immediately, no race with a flight
    cameraRef.current = box; // update synchronously — rapid successive calls (e.g. quick zoom-button
    // clicks) must never read a stale value through the separate passive effect below
    setCamera(box);
  }, []);

  return { camera, transitioning, flyTo, flyVia, reset, cancelFlight, setCameraDirect, cameraRef };
}
