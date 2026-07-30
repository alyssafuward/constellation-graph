export function QuoteCardModal({ dataUrl, onClose }) {
  if (!dataUrl) return null;
  // This modal can render inside another overlay (ResponsePanel's), which closes
  // itself on any click that reaches it — stop propagation here too, same reason
  // as the popup button in QuoteCardSelectionLayer.
  const handleBackdropClick = (e) => { e.stopPropagation(); onClose(); };
  const handleCloseClick = (e) => { e.stopPropagation(); onClose(); };
  return (
    <div className="qc-modal" onClick={handleBackdropClick}>
      <div className="qc-modal-inner" onClick={(e) => e.stopPropagation()}>
        <img className="qc-modal-img" src={dataUrl} alt="Quote card" />
        <p className="qc-modal-hint">Right-click the image above → Save Image As to download it.</p>
        <button type="button" className="qc-modal-close" onClick={handleCloseClick}>Close</button>
      </div>
    </div>
  );
}
