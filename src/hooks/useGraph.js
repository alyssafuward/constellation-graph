import { useMemo } from "react";
import { QUESTIONS } from "../data/questions.js";
import { AUTHORS } from "../data/people.js";
import { HUB_POSITIONS, stretchPositions, computeSafeBox, satelliteOrbitParams, satellitePositionAtTime, hubDriftParams, nearestNeighborDistances } from "../lib/layout.js";

// containerRatio controls how the design-space HUB_POSITIONS get stretched (see
// stretchPositions) — passing a new ratio recomputes the whole layout to match it.
export function useGraph(containerRatio) {
  return useMemo(() => {
    const positions = stretchPositions(HUB_POSITIONS, containerRatio);
    const neighborDistances = nearestNeighborDistances(positions);

    const hubs = QUESTIONS.map((q, i) => ({
      ...q,
      x: positions[i].x,
      y: positions[i].y,
      driftParams: hubDriftParams(positions[i]),
    }));

    const satellites = [];
    hubs.forEach((hub, hubIndex) => {
      const respondents = AUTHORS.filter((p) => p.answers[hub.id] && p.answers[hub.id].length);
      respondents.forEach((person, i) => {
        const params = satelliteOrbitParams(hub, i, respondents.length, neighborDistances[hubIndex]);
        const pos = satellitePositionAtTime(hub, params, 0);
        satellites.push({
          key: `${hub.id}__${person.id}`,
          hubId: hub.id,
          personId: person.id,
          orbitParams: params,
          x: pos.x,
          y: pos.y,
          person,
          hub,
        });
      });
    });

    // bound the actual rendered content (hubs + every satellite's real position), not a
    // theoretical worst-case guess — this stays correct no matter how hubs get arranged,
    // including ones placed close to an edge
    const safeBox = computeSafeBox([...hubs, ...satellites], 45);

    return { hubs, satellites, safeBox };
  }, [containerRatio]);
}
