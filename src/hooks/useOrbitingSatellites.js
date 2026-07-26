import { useState, useRef, useEffect } from "react";
import { resolveAngularOverlap } from "../lib/layout.js";

export function useOrbitingSatellites(baseSatellites, paused) {
  const [, forceTick] = useState(0);
  // elapsedRef only accumulates time between frames while actively animating, so pausing
  // (e.g. while a response panel is open) never produces a jump when it resumes — a plain
  // wall-clock timestamp would keep ticking through the pause and cause satellites to teleport
  const elapsedRef = useRef(0);
  const lastFrameTimeRef = useRef(null);
  const rafRef = useRef(null);
  const liveRef = useRef(baseSatellites);

  useEffect(() => {
    liveRef.current = baseSatellites.map((s) => ({ ...s }));
  }, [baseSatellites]);

  useEffect(() => {
    if (paused) {
      cancelAnimationFrame(rafRef.current);
      lastFrameTimeRef.current = null; // next resume starts its delta fresh, no catch-up jump
      return;
    }
    const step = (now) => {
      if (lastFrameTimeRef.current == null) lastFrameTimeRef.current = now;
      elapsedRef.current += (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;
      const elapsed = elapsedRef.current;

      // 1. compute each satellite's raw drifting angle (mod 2pi) grouped by hub
      const byHub = new Map();
      liveRef.current.forEach((s) => {
        const rawAngle = s.orbitParams.baseAngle + s.orbitParams.direction * s.orbitParams.speed * elapsed;
        const angle = ((rawAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        if (!byHub.has(s.hubId)) byHub.set(s.hubId, []);
        byHub.get(s.hubId).push({ key: s.key, angle, orbit: s.orbitParams.orbit });
      });

      // 2. resolve angular overlap within each hub group
      const resolvedAngleByKey = new Map();
      byHub.forEach((entries) => {
        const resolved = resolveAngularOverlap(entries);
        resolved.forEach((e) => resolvedAngleByKey.set(e.key, e.angle));
      });

      // 3. convert back to xy using the resolved angle
      liveRef.current = liveRef.current.map((s) => {
        const angle = resolvedAngleByKey.get(s.key);
        const x = s.hub.x + s.orbitParams.orbit * Math.cos(angle);
        const y = s.hub.y + s.orbitParams.orbit * Math.sin(angle);
        return { ...s, x, y };
      });

      forceTick((t) => (t + 1) % 1000000);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused]);

  return liveRef.current;
}
