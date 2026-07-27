import { renderLinkedText } from "../lib/text.jsx";

export function ResponsePanel({ satellite, onClose, onStayInTopic, onFollowStory }) {
  if (!satellite) return null;
  const { person, hub } = satellite;
  const paras = person.answers[hub.id] || [];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
        <header className="sheet-header" style={{ borderColor: person.color }}>
          <span className="sheet-dot" style={{ background: person.color }} />
          <div>
            <h2>{person.name}</h2>
            <p className="sheet-handle">{person.handle}</p>
          </div>
        </header>

        <p className="sheet-qlabel">{hub.label}</p>
        {hub.question && <p className="sheet-question">{hub.question}</p>}

        <div className="sheet-body">
          {paras.map((p, i) => <p key={i}>{renderLinkedText(p)}</p>)}
        </div>

        <div className="nav-row">
          <button className="nav-btn topic-btn" onClick={onStayInTopic}>
            Stay in topic → next answer
          </button>
          <button className="nav-btn story-btn" style={{ background: person.color }} onClick={onFollowStory}>
            Follow {person.name.split(" ")[0]}'s response →
          </button>
        </div>
      </div>
    </div>
  );
}
