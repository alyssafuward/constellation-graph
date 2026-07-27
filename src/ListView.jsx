import { useState } from "react";
import { QUESTIONS } from "./data/questions.js";
import { AUTHORS } from "./data/people.js";
import { renderLinkedText } from "./lib/text.jsx";

// Plain, semantic alternative to the constellation graph — real headings and buttons,
// no motion, fully usable with a keyboard or screen reader without any special handling.
export default function ListView() {
  const [expanded, setExpanded] = useState(() => new Set());

  const toggle = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="app-root list-view">
      <div className="header-bar">
        <span className="eyebrow">HOW WE HUMAN IN THE FACE OF AI DETECTION</span>
        <h1>A constellation of voices — list view</h1>
        <p className="intro-copy">
          A plain, keyboard- and screen-reader-friendly way to browse the same answers as the
          constellation graph. Click a name to read their answer.
        </p>
        <a className="reset-btn" href=".">← Back to the constellation</a>
      </div>

      <div className="list-wrap">
        {QUESTIONS.map((q) => {
          const respondents = AUTHORS.filter((p) => p.answers[q.id] && p.answers[q.id].length);
          if (!respondents.length) return null;
          return (
            <section key={q.id} className="list-question">
              <h2>{q.label}</h2>
              {q.question && <p className="list-question-text">{q.question}</p>}
              <ul className="list-respondents">
                {respondents.map((person) => {
                  const key = `${q.id}__${person.id}`;
                  const isOpen = expanded.has(key);
                  return (
                    <li key={key}>
                      <button className="list-toggle" aria-expanded={isOpen} onClick={() => toggle(key)}>
                        <span className="legend-dot" style={{ background: person.color }} />
                        {person.name}
                        <span className="list-caret" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                      </button>
                      {isOpen && (
                        <div className="list-answer">
                          {person.answers[q.id].map((para, i) => <p key={i}>{renderLinkedText(para)}</p>)}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
