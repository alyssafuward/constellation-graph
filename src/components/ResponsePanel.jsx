import { useCallback, useRef } from "react";
import { renderLinkedText } from "../lib/text.jsx";
import { QuoteCardSelectionLayer } from "./QuoteCardSelectionLayer.jsx";

export function ResponsePanel({ satellite, onClose, onStayInTopic, onFollowStory }) {
  const bodyRef = useRef(null);
  const person = satellite?.person;
  const resolvePerson = useCallback(
    () => (person ? { name: person.name, handle: person.handle, color: person.color } : null),
    [person]
  );

  if (!satellite) return null;
  const { hub } = satellite;
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

        <p className="qc-hint">Select any text below to save it as a shareable quote card.</p>

        <p className="sheet-qlabel">{hub.label}</p>
        {hub.question && <p className="sheet-question">{hub.question}</p>}

        <div className="sheet-body" ref={bodyRef}>
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

      <QuoteCardSelectionLayer containerRef={bodyRef} resolvePerson={resolvePerson} />
    </div>
  );
}
