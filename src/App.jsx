import { useState, useRef, useEffect } from "react";
import { useGraph } from "./hooks/useGraph.js";
import { useLiveConstellation } from "./hooks/useLiveConstellation.js";
import { useCamera } from "./hooks/useCamera.js";
import { usePanZoom } from "./hooks/usePanZoom.js";
import { QUESTIONS } from "./data/questions.js";
import { DEFAULT_CAMERA, boxFor, clampCameraBox, computeMinimalCoverCamera } from "./lib/camera.js";
import { Graph } from "./components/Graph.jsx";
import { Legend } from "./components/Legend.jsx";
import { ResponsePanel } from "./components/ResponsePanel.jsx";

const HUB_ZOOM_SIZE = 400;
const NODE_ZOOM_SIZE = 160;

export default function App() {
  const { hubs: baseHubs, satellites: baseSatellites } = useGraph();
  const { camera, transitioning, flyTo, flyVia, reset, cancelFlight, setCameraDirect, cameraRef } = useCamera();

  const svgRef = useRef(null);
  const frameRef = useRef(null);
  const defaultCameraRef = useRef(DEFAULT_CAMERA);
  usePanZoom(svgRef, camera, cameraRef, setCameraDirect, cancelFlight);

  const [activeKey, setActiveKey] = useState(null);
  const [focusedHubId, setFocusedHubId] = useState(null);
  const [hoveredPersonId, setHoveredPersonId] = useState(null);
  const [travelingPersonId, setTravelingPersonId] = useState(null);
  const [pinnedPersonId, setPinnedPersonId] = useState(null);
  const [beadSegment, setBeadSegment] = useState(null); // { from: {x,y}, to: {x,y} }
  const [beadT, setBeadT] = useState(0); // 0..1 progress along segment
  const beadRafRef = useRef(null);

  useEffect(() => () => cancelAnimationFrame(beadRafRef.current), []);

  // pause hub/orbit drift while a response is open or the camera is flying, so targets don't move underneath the user
  const orbitPaused = Boolean(activeKey) || transitioning;
  const { hubs, satellites } = useLiveConstellation(baseHubs, baseSatellites, orbitPaused);

  const activeSat = satellites.find((s) => s.key === activeKey);

  // keep the resting view's shape matched to the actual frame, growing only whichever
  // dimension the frame's ratio requires so the constellation fills it with no leftover
  // white space on either axis, while never cropping any hub or satellite
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;
      const fitBox = computeMinimalCoverCamera(width / height);
      defaultCameraRef.current = fitBox;
      const atRest = !activeKey && !focusedHubId && !transitioning;
      if (atRest) setCameraDirect(fitBox);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeKey, focusedHubId, transitioning, setCameraDirect]);

  const restBox = defaultCameraRef.current;
  const cameraIsMoved =
    Math.abs(camera.w - restBox.w) > 4 ||
    Math.abs(camera.x - restBox.x) > 4 ||
    Math.abs(camera.y - restBox.y) > 4;

  const handleHubClick = (hub) => {
    setActiveKey(null);
    setFocusedHubId(hub.id);
    flyTo(boxFor(hub.x, hub.y, HUB_ZOOM_SIZE));
  };

  const handleSatelliteClick = (sat) => {
    setFocusedHubId(sat.hubId);
    setActiveKey(sat.key);
    // clear any lingering hover from the click gesture itself, so the Legend doesn't
    // keep showing this origin person highlighted once you move on to hover someone else
    setHoveredPersonId(null);
    flyTo(boxFor(sat.x, sat.y, NODE_ZOOM_SIZE), { duration: 900 });
  };

  const handleClosePanel = () => {
    setActiveKey(null);
    setHoveredPersonId(null);
  };

  const handleLegendClick = (personId) => {
    setPinnedPersonId((prev) => (prev === personId ? null : personId));
  };

  const handleStayInTopic = () => {
    if (!activeSat) return;
    const inTopic = satellites.filter((s) => s.hubId === activeSat.hubId);
    if (inTopic.length < 2) return;
    const idx = inTopic.findIndex((s) => s.key === activeSat.key);
    const next = inTopic[(idx + 1) % inTopic.length];
    if (next.key !== activeSat.key) travelTo(activeSat, next);
  };

  const handleFollowStory = () => {
    if (!activeSat) return;
    const qOrder = QUESTIONS.map((q) => q.id);
    const trail = satellites
      .filter((s) => s.personId === activeSat.personId)
      .sort((a, b) => qOrder.indexOf(a.hubId) - qOrder.indexOf(b.hubId));
    const idx = trail.findIndex((s) => s.key === activeSat.key);
    const next = trail[(idx + 1) % trail.length];
    if (next && next.key !== activeSat.key) travelTo(activeSat, next);
  };

  // pan camera along the path from A to B: zoom out to a box containing both, then zoom into B
  const travelTo = async (from, to) => {
    setActiveKey(null); // close panel while panning
    setTravelingPersonId(to.personId); // keep the thread lit for the whole flight

    const sameHub = from.hubId === to.hubId;

    // animate a bead traveling along the straight line from -> to, in parallel with the camera flight
    // only shown when actually jumping between hubs (following a story), not when staying within one hub
    const totalDuration = 850 + 900; // matches flyVia's two legs
    if (!sameHub) {
      setBeadSegment({ from: { x: from.x, y: from.y }, to: { x: to.x, y: to.y } });
      setBeadT(0);
      cancelAnimationFrame(beadRafRef.current);
      const beadStart = performance.now();
      const stepBead = (now) => {
        const t = Math.min(1, (now - beadStart) / totalDuration);
        setBeadT(t);
        if (t < 1) {
          beadRafRef.current = requestAnimationFrame(stepBead);
        }
      };
      beadRafRef.current = requestAnimationFrame(stepBead);
    } else {
      cancelAnimationFrame(beadRafRef.current);
      setBeadSegment(null);
    }

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const spanX = Math.abs(to.x - from.x) + NODE_ZOOM_SIZE * 3.5;
    const spanY = Math.abs(to.y - from.y) + NODE_ZOOM_SIZE * 3.5;
    const viaSize = Math.max(spanX, spanY, NODE_ZOOM_SIZE * 4);
    const viaBox = { x: midX - viaSize / 2, y: midY - viaSize / 2, w: viaSize, h: viaSize };
    const finalBox = boxFor(to.x, to.y, NODE_ZOOM_SIZE);

    setFocusedHubId(to.hubId);
    await flyVia(viaBox, finalBox);

    // re-open the panel exactly when the camera settles on the destination
    setActiveKey(to.key);
    setTravelingPersonId(null);
    cancelAnimationFrame(beadRafRef.current);
    setBeadSegment(null);
  };

  const handleBackgroundClick = () => {
    setActiveKey(null);
    setFocusedHubId(null);
    reset(defaultCameraRef.current);
  };

  // manual zoom in/out, scaling around the camera's own current center so it never
  // needs to re-derive what to center on — the center point simply doesn't move
  const zoomBy = (factor) => {
    cancelFlight();
    const cam = cameraRef.current;
    const cx = cam.x + cam.w / 2;
    const cy = cam.y + cam.h / 2;
    const clamped = clampCameraBox({ ...cam, w: cam.w * factor, h: cam.h * factor });
    setCameraDirect({ x: cx - clamped.w / 2, y: cy - clamped.h / 2, w: clamped.w, h: clamped.h });
  };

  return (
    <div className="app-root">
      <div className="header-bar">
        <span className="eyebrow">HOW WE HUMAN IN THE FACE OF AI DETECTION</span>
        <h1>A constellation of voices.</h1>
        <p className="intro-copy">
          Each shape is a question, scattered like stars. Click one to zoom in and see who
          answered it. Click a person's point of light to read their answer — then travel to
          the next answer in this topic, or follow their story to the next question. Drag to
          pan, pinch or use the +/− buttons to zoom.
        </p>
        {(focusedHubId || cameraIsMoved) && (
          <button className="reset-btn" onClick={handleBackgroundClick}>
            ← Back to full sky
          </button>
        )}
      </div>

      <div className="graph-wrap">
        <div className="graph-frame" ref={frameRef} onClick={handleBackgroundClick}>
          <Graph
            satellites={satellites}
            hubs={hubs}
            activeKey={activeKey}
            focusedHubId={focusedHubId}
            onHubClick={handleHubClick}
            onSatelliteClick={handleSatelliteClick}
            hoveredPersonId={hoveredPersonId}
            setHoveredPersonId={setHoveredPersonId}
            camera={camera}
            transitioning={transitioning}
            travelingPersonId={travelingPersonId}
            beadSegment={beadSegment}
            beadT={beadT}
            svgRef={svgRef}
            pinnedPersonId={pinnedPersonId}
          />
          <div className="zoom-controls" onClick={(e) => e.stopPropagation()}>
            <button className="zoom-btn" onClick={() => zoomBy(0.8)} aria-label="Zoom in">+</button>
            <button className="zoom-btn" onClick={() => zoomBy(1.25)} aria-label="Zoom out">−</button>
          </div>
        </div>
        <Legend pinnedPersonId={pinnedPersonId} hoveredPersonId={hoveredPersonId} onPersonClick={handleLegendClick} />
      </div>

      <ResponsePanel
        satellite={activeSat}
        onClose={handleClosePanel}
        onStayInTopic={handleStayInTopic}
        onFollowStory={handleFollowStory}
      />
    </div>
  );
}
