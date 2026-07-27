import { useState, useRef, useMemo } from "react";
import { QUESTIONS } from "./data/questions.js";
import { AUTHORS } from "./data/people.js";
import { VIEW_W, VIEW_H, HUB_POSITIONS, satelliteOrbitParams, satellitePositionAtTime, nearestNeighborDistances } from "./lib/layout.js";
import { HubShape } from "./components/HubShape.jsx";

// Internal editing tool, not linked from the app — reach it via ?layout-editor in the URL.
// Drag hubs around, then copy the generated code into src/lib/layout.js.
export default function LayoutEditor() {
  const [positions, setPositions] = useState(() => HUB_POSITIONS.map((p) => ({ ...p })));
  const [copied, setCopied] = useState(false);
  const svgRef = useRef(null);
  const dragRef = useRef(null); // { index, offsetX, offsetY } — offset between hub center and the cursor at grab time

  const hubs = QUESTIONS.map((q, i) => ({ ...q, x: positions[i].x, y: positions[i].y }));

  const satellites = useMemo(() => {
    const neighborDistances = nearestNeighborDistances(positions);
    const list = [];
    hubs.forEach((hub, hubIndex) => {
      const respondents = AUTHORS.filter((p) => p.answers[hub.id] && p.answers[hub.id].length);
      respondents.forEach((person, i) => {
        const params = satelliteOrbitParams(hub, i, respondents.length, neighborDistances[hubIndex]);
        const pos = satellitePositionAtTime(hub, params, 0);
        list.push({ key: `${hub.id}__${person.id}`, x: pos.x, y: pos.y, color: person.color, hubX: hub.x, hubY: hub.y });
      });
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  const clientToViewBox = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) * VIEW_W) / rect.width,
      y: ((clientY - rect.top) * VIEW_H) / rect.height,
    };
  };

  const handlePointerDown = (i) => (e) => {
    e.stopPropagation();
    const { x, y } = clientToViewBox(e.clientX, e.clientY);
    dragRef.current = { index: i, offsetX: positions[i].x - x, offsetY: positions[i].y - y };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const { index, offsetX, offsetY } = dragRef.current;
    const { x, y } = clientToViewBox(e.clientX, e.clientY);
    setPositions((prev) => {
      const next = [...prev];
      next[index] = { x: Math.round((x + offsetX) * 10) / 10, y: Math.round((y + offsetY) * 10) / 10 };
      return next;
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const codeOutput = `export const HUB_POSITIONS = [\n${positions
    .map((p) => `  { x: ${p.x}, y: ${p.y} },`)
    .join("\n")}\n];`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="app-root">
      <div className="header-bar">
        <span className="eyebrow">LAYOUT EDITOR</span>
        <h1>Drag hubs to reposition</h1>
        <p className="intro-copy">
          Satellites recompute live around wherever each hub is. When you're happy, copy the
          code and paste it over the HUB_POSITIONS array in src/lib/layout.js.
        </p>
      </div>

      <div className="graph-wrap">
        <div className="graph-frame">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="graph-svg"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {hubs.map((hub, i) => {
              const next = hubs[(i + 1) % hubs.length];
              return (
                <line
                  key={`sky-${hub.id}`}
                  x1={hub.x} y1={hub.y} x2={next.x} y2={next.y}
                  stroke="#B7CEDE" strokeWidth={2}
                />
              );
            })}

            {satellites.map((s) => (
              <line
                key={`spoke-${s.key}`}
                x1={s.hubX} y1={s.hubY} x2={s.x} y2={s.y}
                stroke="#5A8AAE" strokeWidth={2.5}
              />
            ))}

            {satellites.map((s) => (
              <circle key={s.key} cx={s.x} cy={s.y} r={8} fill={s.color} stroke="#fff" strokeWidth={1.5} />
            ))}

            {hubs.map((hub, i) => (
              <g
                key={hub.id}
                transform={`translate(${hub.x},${hub.y})`}
                className="hub"
                onPointerDown={handlePointerDown(i)}
              >
                <HubShape shape={hub.shape} size={46} fill={hub.color || "#1F6FA8"} stroke="#0F4C77" />
                <text y={-36} textAnchor="middle" className="hub-label">{hub.label}</text>
                <text y={44} textAnchor="middle" className="hub-coords">{Math.round(hub.x)}, {Math.round(hub.y)}</text>
              </g>
            ))}
          </svg>
        </div>

        <div className="legend">
          <span className="legend-title">Code</span>
          <button className="reset-btn" onClick={copyToClipboard}>{copied ? "Copied!" : "Copy code"}</button>
        </div>
        <pre className="editor-code">{codeOutput}</pre>
      </div>
    </div>
  );
}
