import { QUESTIONS } from "../data/questions.js";
import { ALL_PEOPLE } from "../data/people.js";
import { easeInOutCubic } from "../lib/camera.js";
import { HubShape } from "./HubShape.jsx";
import { dotShapeFor } from "../lib/dotShapes.js";

export function Graph({ satellites, hubs, activeKey, focusedHubId, onHubClick, onSatelliteClick, hoveredPersonId, setHoveredPersonId, camera, transitioning, travelingPersonId, beadSegment, beadT, svgRef, pinnedPersonId }) {
  const threadFor = (personId) => {
    const qOrder = QUESTIONS.map((q) => q.id);
    return satellites
      .filter((s) => s.personId === personId)
      .sort((a, b) => qOrder.indexOf(a.hubId) - qOrder.indexOf(b.hubId));
  };

  const activeSat = satellites.find((s) => s.key === activeKey);
  const selectedPersonId = travelingPersonId || hoveredPersonId || (activeSat && activeSat.personId) || pinnedPersonId || null;

  return (
    <svg
      ref={svgRef}
      viewBox={`${camera.x} ${camera.y} ${camera.w} ${camera.h}`}
      className={`graph-svg ${transitioning ? "is-panning" : ""}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* constellation connective tissue: faint dotted lines between neighboring hubs */}
      {hubs.map((hub, i) => {
        const next = hubs[(i + 1) % hubs.length];
        return (
          <line
            key={`sky-${hub.id}`}
            x1={hub.x} y1={hub.y} x2={next.x} y2={next.y}
            stroke="#DCE7EF" strokeWidth={1} strokeDasharray="1 5"
          />
        );
      })}

      {/* dotted spokes from hub to its satellites — questions are the loose structure.
          dimmed along with their hub so a faded-out star doesn't sit under full-strength
          lines and dots, which read as visually disconnected from it */}
      {satellites.map((s) => {
        const dim = focusedHubId && focusedHubId !== s.hubId && !activeSat;
        return (
          <line
            key={`spoke-${s.key}`}
            x1={s.hub.x} y1={s.hub.y} x2={s.x} y2={s.y}
            stroke="#7FAAC9" strokeWidth={1.7} strokeDasharray="1.5 4.5"
            opacity={dim ? 0.35 : 1}
            style={{ transition: "opacity 0.2s ease" }}
          />
        );
      })}

      {/* solid person threads — always visible but faint by default, one per person connecting all their answers in question order */}
      {ALL_PEOPLE.filter((p) => !p.freeform).map((person) => {
        const trail = threadFor(person.id);
        if (trail.length < 2) return null;
        const isSelected = selectedPersonId === person.id;
        return (
          <g key={`thread-group-${person.id}`}>
            {trail.slice(1).map((s, i) => {
              const prev = trail[i];
              return (
                <line
                  key={`thread-${person.id}-${s.key}`}
                  x1={prev.x} y1={prev.y} x2={s.x} y2={s.y}
                  stroke={person.color}
                  strokeWidth={isSelected ? 2.6 : 1.3}
                  opacity={isSelected ? 0.9 : 0.22}
                  style={{ transition: "opacity 0.2s ease, stroke-width 0.2s ease" }}
                />
              );
            })}
          </g>
        );
      })}

      {/* hubs */}
      {hubs.map((hub, hubIndex) => {
        const dim = focusedHubId && focusedHubId !== hub.id && !activeSat;
        const isBeacon = hubIndex === 0;
        return (
          <g
            key={hub.id}
            transform={`translate(${hub.x},${hub.y})`}
            className="hub"
            onClick={(e) => { e.stopPropagation(); onHubClick(hub); }}
          >
            {isBeacon && !dim && (
              <circle className="hub-beacon-ring" cx={0} cy={0} r={68} fill="none" stroke="#F0B85A" strokeWidth="2.5" />
            )}
            <HubShape hubId={hub.id} size={130} dim={dim} />
          </g>
        );
      })}

      {/* satellites */}
      {satellites.map((s) => {
        const isActive = s.key === activeKey;
        const isThreaded = selectedPersonId === s.personId;
        const r = isActive ? 24 : isThreaded ? 20 : 16;
        const scale = r / 10;
        return (
          <g
            key={s.key}
            transform={`translate(${s.x},${s.y})`}
            className="satellite"
            onMouseEnter={() => setHoveredPersonId(s.personId)}
            onMouseLeave={() => setHoveredPersonId(null)}
            onClick={(e) => { e.stopPropagation(); onSatelliteClick(s); }}
          >
            <path
              d={dotShapeFor(s.key)}
              transform={`scale(${scale})`}
              fill={s.person.color}
              stroke="#fff"
              strokeWidth={(isActive ? 3 : 1.5) / scale}
            />
          </g>
        );
      })}

      {/* traveling bead of light — moves along the active flight segment */}
      {beadSegment && (() => {
        const e = easeInOutCubic(beadT);
        const bx = beadSegment.from.x + (beadSegment.to.x - beadSegment.from.x) * e;
        const by = beadSegment.from.y + (beadSegment.to.y - beadSegment.from.y) * e;
        const color = (ALL_PEOPLE.find((p) => p.id === travelingPersonId) || {}).color || "#1F6FA8";
        return (
          <g className="travel-bead">
            <circle cx={bx} cy={by} r={9} fill={color} opacity={0.18} />
            <circle cx={bx} cy={by} r={5.5} fill={color} opacity={0.5} />
            <circle cx={bx} cy={by} r={3} fill="#fff" />
          </g>
        );
      })()}
    </svg>
  );
}
