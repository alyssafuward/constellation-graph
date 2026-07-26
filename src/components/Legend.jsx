import { ALL_PEOPLE } from "../data/people.js";

export function Legend({ pinnedPersonId, onPersonClick }) {
  return (
    <div className="legend">
      <span className="legend-title">People</span>
      {ALL_PEOPLE.map((p) => {
        const isPinned = pinnedPersonId === p.id;
        return (
          <button
            className={`legend-row ${isPinned ? "is-pinned" : ""}`}
            key={p.id}
            onClick={() => onPersonClick(p.id)}
            style={isPinned ? { color: p.color } : undefined}
          >
            <span className="legend-dot" style={{ background: p.color }} />
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
