import { useState, useRef, useEffect } from "react";
import { resolveAngularOverlap } from "../lib/layout.js";

// Drives both the hubs' gentle drift and their satellites' orbits from one shared clock,
// since a satellite's position is relative to wherever its hub currently is.
export function useLiveConstellation(baseHubs, baseSatellites, paused) {
  const [, forceTick] = useState(0);
  // elapsedRef only accumulates time between frames while actively animating, so pausing
  // (e.g. while a response panel is open) never produces a jump when it resumes — a plain
  // wall-clock timestamp would keep ticking through the pause and cause things to teleport
  const elapsedRef = useRef(0);
  const lastFrameTimeRef = useRef(null);
  const rafRef = useRef(null);
  const liveHubsRef = useRef(baseHubs);
  const liveSatellitesRef = useRef(baseSatellites);

  useEffect(() => {
    liveHubsRef.current = baseHubs.map((h) => ({ ...h, baseX: h.x, baseY: h.y }));
    liveSatellitesRef.current = baseSatellites.map((s) => ({ ...s }));
  }, [baseHubs, baseSatellites]);

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

      // 1. drift each hub around its own base position
      const hubPosById = new Map();
      liveHubsRef.current = liveHubsRef.current.map((h) => {
        const angle = h.driftParams.baseAngle + h.driftParams.direction * h.driftParams.speed * elapsed;
        const x = h.baseX + h.driftParams.orbit * Math.cos(angle);
        const y = h.baseY + h.driftParams.orbit * Math.sin(angle);
        hubPosById.set(h.id, { x, y });
        return { ...h, x, y };
      });

      // 2. compute each satellite's raw drifting angle (mod 2pi) grouped by hub
      const byHub = new Map();
      liveSatellitesRef.current.forEach((s) => {
        const rawAngle = s.orbitParams.baseAngle + s.orbitParams.direction * s.orbitParams.speed * elapsed;
        const angle = ((rawAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        if (!byHub.has(s.hubId)) byHub.set(s.hubId, []);
        byHub.get(s.hubId).push({ key: s.key, angle, orbit: s.orbitParams.orbit });
      });

      // 3. resolve angular overlap within each hub group
      const resolvedAngleByKey = new Map();
      byHub.forEach((entries) => {
        const resolved = resolveAngularOverlap(entries);
        resolved.forEach((e) => resolvedAngleByKey.set(e.key, e.angle));
      });

      // 4. convert back to xy, anchored to the hub's CURRENT (drifted) position this frame
      liveSatellitesRef.current = liveSatellitesRef.current.map((s) => {
        const angle = resolvedAngleByKey.get(s.key);
        const hubPos = hubPosById.get(s.hubId);
        const x = hubPos.x + s.orbitParams.orbit * Math.cos(angle);
        const y = hubPos.y + s.orbitParams.orbit * Math.sin(angle);
        return { ...s, x, y, hub: { ...s.hub, x: hubPos.x, y: hubPos.y } };
      });

      forceTick((t) => (t + 1) % 1000000);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused]);

  return { hubs: liveHubsRef.current, satellites: liveSatellitesRef.current };
}
