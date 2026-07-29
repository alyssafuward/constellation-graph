import { ALL_PEOPLE } from "../data/people.js";

// Split into two even rows (e.g. 9 people -> 5 + 4) rather than one auto-wrapping line,
// with any remainder going in the top row.
const half = Math.ceil(ALL_PEOPLE.length / 2);
const LEGEND_ROWS = [ALL_PEOPLE.slice(0, half), ALL_PEOPLE.slice(half)];

export function Legend({ pinnedPersonId, hoveredPersonId, onPersonClick }) {
  return (
    <div className="legend">
      <span className="legend-title">People</span>
      <div className="legend-grid">
        {LEGEND_ROWS.map((row, i) => (
          <div className="legend-line" key={i}>
            {row.map((p) => {
              const isPinned = pinnedPersonId === p.id;
              const isHovered = hoveredPersonId === p.id;
              // hovering always wins the visual highlight over a pinned selection, so only one
              // row lights up at a time even when a different person is pinned
              const isHighlighted = hoveredPersonId ? isHovered : isPinned;
              return (
                <button
                  className={`legend-person ${isHighlighted ? "is-pinned" : ""}`}
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
        ))}
      </div>
    </div>
  );
}
