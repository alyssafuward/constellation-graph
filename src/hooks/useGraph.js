import { useMemo } from "react";
import { QUESTIONS } from "../data/questions.js";
import { AUTHORS } from "../data/people.js";
import { HUB_POSITIONS, SHAPES, satelliteOrbitParams, positionAtTime } from "../lib/layout.js";

export function useGraph() {
  return useMemo(() => {
    const hubs = QUESTIONS.map((q, i) => ({
      ...q,
      shape: SHAPES[i % SHAPES.length],
      x: HUB_POSITIONS[i].x,
      y: HUB_POSITIONS[i].y,
    }));

    const satellites = [];
    hubs.forEach((hub) => {
      const respondents = AUTHORS.filter((p) => p.answers[hub.id] && p.answers[hub.id].length);
      respondents.forEach((person, i) => {
        const params = satelliteOrbitParams(hub, i, respondents.length);
        const pos = positionAtTime(hub, params, 0);
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

    return { hubs, satellites };
  }, []);
}
