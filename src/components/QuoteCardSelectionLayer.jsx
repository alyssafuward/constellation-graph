import { useEffect, useState } from "react";
import { renderQuoteCard } from "../lib/quoteCard.js";
import { QuoteCardModal } from "./QuoteCardModal.jsx";

// Watches for a text selection inside containerRef, and — if resolvePerson can
// attribute the selected element to a person — shows a small popup near the
// selection to turn it into a downloadable quote card. containerRef bounds where
// selections are watched at all; resolvePerson maps a selected element back to
// {name, handle, color}, so ResponsePanel (always one person) and ListView (many,
// looked up via data attributes) can share this same layer.
export function QuoteCardSelectionLayer({ containerRef, resolvePerson }) {
  const [popup, setPopup] = useState(null);
  const [modalUrl, setModalUrl] = useState(null);

  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setPopup(null); return; }

      const range = sel.getRangeAt(0);
      const node = range.commonAncestorContainer;
      const el = node.nodeType === 1 ? node : node.parentElement;
      const container = containerRef.current;
      if (!container || !el || !container.contains(el)) { setPopup(null); return; }

      // Just needs to be non-empty — a UTF-16 length check would exclude a selection
      // like a single emoji (e.g. "🖕" is a surrogate pair, .length === 2)
      const text = sel.toString().trim();
      if (!text) { setPopup(null); return; }

      const person = resolvePerson(el);
      if (!person) { setPopup(null); return; }

      const rect = range.getBoundingClientRect();
      setPopup({ x: rect.left + rect.width / 2, y: rect.top, text, person });
    };

    document.addEventListener("selectionchange", onSelectionChange);
    const onScroll = () => setPopup(null);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [containerRef, resolvePerson]);

  const handleMakeCard = (e) => {
    // This button (and the modal it opens) render inside whatever overlay is
    // currently open — ResponsePanel's ".overlay" closes itself on any click that
    // reaches it, so without this the click here was bubbling up and closing the
    // whole answer panel instead of opening the quote card.
    e.stopPropagation();
    if (!popup) return;
    const { text, person } = popup;
    const dataUrl = renderQuoteCard({ name: person.name, handle: person.handle, quote: text, accent: person.color });
    setModalUrl(dataUrl);
    setPopup(null);
    window.getSelection().removeAllRanges();
  };

  return (
    <>
      {popup && (
        <button
          type="button"
          className="qc-select-popup"
          style={{ left: popup.x, top: popup.y, "--select-accent": popup.person.color }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleMakeCard}
        >
          ✦ Make quote card
        </button>
      )}
      <QuoteCardModal dataUrl={modalUrl} onClose={() => setModalUrl(null)} />
    </>
  );
}
