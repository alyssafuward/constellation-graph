import { useEffect, useMemo, useState } from "react";
import { renderQuoteCard, QUOTE_CARD_SWATCHES } from "../lib/quoteCard.js";

export function QuoteCardModal({ cardData, onClose }) {
  const [accent, setAccent] = useState(cardData?.accent ?? QUOTE_CARD_SWATCHES[0]);

  // cardData is only replaced when a new card is made (or cleared on close), so this
  // resets the picker to that person's own color each time, without fighting further
  // color changes the person makes to the same card afterward.
  useEffect(() => {
    if (cardData) setAccent(cardData.accent);
  }, [cardData]);

  const dataUrl = useMemo(
    () => (cardData ? renderQuoteCard({ ...cardData, accent }) : null),
    [cardData, accent]
  );

  if (!cardData) return null;

  // This modal can render inside another overlay (ResponsePanel's), which closes
  // itself on any click that reaches it — stop propagation here too, same reason
  // as the popup button in QuoteCardSelectionLayer.
  const handleBackdropClick = (e) => { e.stopPropagation(); onClose(); };
  const handleCloseClick = (e) => { e.stopPropagation(); onClose(); };

  return (
    <div className="qc-modal" onClick={handleBackdropClick}>
      <div className="qc-modal-inner" onClick={(e) => e.stopPropagation()}>
        <img className="qc-modal-img" src={dataUrl} alt="Quote card" />

        <div className="qc-color-row">
          {QUOTE_CARD_SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              className={"qc-swatch" + (accent === c ? " is-selected" : "")}
              style={{ background: c }}
              aria-label={`Use ${c} as the accent color`}
              onClick={() => setAccent(c)}
            />
          ))}
          <label className="qc-swatch qc-swatch-custom" style={{ background: accent }} title="Custom color">
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
            <span aria-hidden="true">🎨</span>
          </label>
        </div>

        <p className="qc-modal-hint">Right-click the image above → Save Image As to download it.</p>
        <button type="button" className="qc-modal-close" onClick={handleCloseClick}>Close</button>
      </div>
    </div>
  );
}
