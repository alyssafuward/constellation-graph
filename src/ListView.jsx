import { useCallback, useMemo, useRef, useState } from "react";
import { QUESTIONS } from "./data/questions.js";
import { AUTHORS } from "./data/people.js";
import { renderLinkedText } from "./lib/text.jsx";
import { QuoteCardSelectionLayer } from "./components/QuoteCardSelectionLayer.jsx";

// Plain, semantic alternative to the constellation graph — real headings and buttons,
// no motion, fully usable with a keyboard or screen reader without any special handling.
export default function ListView() {
  const [expanded, setExpanded] = useState(() => new Set());
  const [groupBy, setGroupBy] = useState("question");
  const listRef = useRef(null);

  // stable key regardless of grouping, so expanded state survives switching between
  // "by question" and "by person"
  const keyFor = (personId, qId) => `${personId}__${qId}`;

  const toggle = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allKeys = useMemo(() => {
    const keys = [];
    QUESTIONS.forEach((q) => {
      AUTHORS.forEach((p) => {
        if (p.answers[q.id] && p.answers[q.id].length) keys.push(keyFor(p.id, q.id));
      });
    });
    return keys;
  }, []);

  const allOpen = allKeys.length > 0 && allKeys.every((k) => expanded.has(k));
  const toggleAll = () => setExpanded(allOpen ? new Set() : new Set(allKeys));

  // Several people/answers are on screen at once here (unlike the graph's single-answer
  // panel), so the selected person is looked up from data attributes on the nearest
  // .list-answer ancestor rather than being fixed in advance.
  const resolvePerson = useCallback((el) => {
    const host = el.closest("[data-quote-name]");
    if (!host) return null;
    return { name: host.dataset.quoteName, handle: host.dataset.quoteHandle, color: host.dataset.quoteColor };
  }, []);

  return (
    <div className="app-root list-view">
      <div className="header-bar">
        <span className="eyebrow">HOW WE HUMAN IN THE FACE OF AI DETECTION</span>
        <h1>A constellation of voices — list view</h1>
        <p className="intro-copy">
          A plain, keyboard- and screen-reader-friendly way to browse the same answers as the
          constellation graph. Click a name to read their answer.
        </p>
        <a className="reset-btn" href=".?skip-landing">← Back to the constellation</a>
      </div>

      <div className="list-wrap" ref={listRef}>
        <p className="qc-hint">Select any text in an answer below to save it as a shareable quote card.</p>

        <div className="list-controls">
          <div className="list-group-toggle" role="group" aria-label="Group by">
            <button
              className={groupBy === "question" ? "is-active" : ""}
              aria-pressed={groupBy === "question"}
              onClick={() => setGroupBy("question")}
            >
              By question
            </button>
            <button
              className={groupBy === "person" ? "is-active" : ""}
              aria-pressed={groupBy === "person"}
              onClick={() => setGroupBy("person")}
            >
              By person
            </button>
          </div>
          <button className="list-open-all-btn" onClick={toggleAll}>
            {allOpen ? "Collapse all" : "Open all"}
          </button>
        </div>

        {groupBy === "question"
          ? QUESTIONS.map((q) => {
              const respondents = AUTHORS.filter((p) => p.answers[q.id] && p.answers[q.id].length);
              if (!respondents.length) return null;
              return (
                <section key={q.id} className="list-question">
                  <h2>{q.label}</h2>
                  {q.question && <p className="list-question-text">{q.question}</p>}
                  <ul className="list-respondents">
                    {respondents.map((person) => {
                      const key = keyFor(person.id, q.id);
                      const isOpen = expanded.has(key);
                      return (
                        <li key={key}>
                          <button className="list-toggle" aria-expanded={isOpen} onClick={() => toggle(key)}>
                            <span className="legend-dot" style={{ background: person.color }} />
                            {person.name}
                            <span className="list-caret" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                          </button>
                          {isOpen && (
                            <div
                              className="list-answer"
                              data-quote-name={person.name}
                              data-quote-handle={person.handle}
                              data-quote-color={person.color}
                            >
                              {person.answers[q.id].map((para, i) => <p key={i}>{renderLinkedText(para)}</p>)}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })
          : AUTHORS.map((person) => {
              const answered = QUESTIONS.filter((q) => person.answers[q.id] && person.answers[q.id].length);
              if (!answered.length) return null;
              return (
                <section key={person.id} className="list-question">
                  <h2>
                    <span className="legend-dot" style={{ background: person.color }} />
                    {person.name}
                  </h2>
                  <ul className="list-respondents">
                    {answered.map((q) => {
                      const key = keyFor(person.id, q.id);
                      const isOpen = expanded.has(key);
                      return (
                        <li key={key}>
                          <button className="list-toggle" aria-expanded={isOpen} onClick={() => toggle(key)}>
                            {q.label}
                            <span className="list-caret" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                          </button>
                          {isOpen && (
                            <div
                              className="list-answer"
                              data-quote-name={person.name}
                              data-quote-handle={person.handle}
                              data-quote-color={person.color}
                            >
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

      <QuoteCardSelectionLayer containerRef={listRef} resolvePerson={resolvePerson} />
    </div>
  );
}
