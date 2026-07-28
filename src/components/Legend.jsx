import { ALL_PEOPLE } from "../data/people.js";

export function Legend({ pinnedPersonId, hoveredPersonId, onPersonClick }) {
  return (
    <div className="legend">
      <span className="legend-title">People</span>
      <div className="legend-grid">
        {ALL_PEOPLE.map((p) => {
          const isPinned = pinnedPersonId === p.id;
          const isHovered = hoveredPersonId === p.id;
          // hovering always wins the visual highlight over a pinned selection, so only one
          // row lights up at a time even when a different person is pinned
          const isHighlighted = hoveredPersonId ? isHovered : isPinned;
          return (
            <button
              className={`legend-row ${isHighlighted ? "is-pinned" : ""}`}
              key={p.id}
              onClick={() => onPersonClick(p.id)}
              style={isHighlighted ? { color: p.color } : undefined}
            >
              <span className="legend-dot" style={{ background: p.color }} />
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
