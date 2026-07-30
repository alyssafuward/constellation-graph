import { useState, useRef, useEffect } from "react";
import { useGraph } from "./hooks/useGraph.js";
import { useLiveConstellation } from "./hooks/useLiveConstellation.js";
import { useCamera } from "./hooks/useCamera.js";
import { usePanZoom } from "./hooks/usePanZoom.js";
import { QUESTIONS } from "./data/questions.js";
import { boxFor, clampCameraBox } from "./lib/camera.js";
import { Graph } from "./components/Graph.jsx";
import { Legend } from "./components/Legend.jsx";
import { ResponsePanel } from "./components/ResponsePanel.jsx";
import { Landing } from "./components/Landing.jsx";

const HUB_ZOOM_SIZE = 400;
const NODE_ZOOM_SIZE = 160;
const LANDING_EXIT_MS = 700;

// lets other pages (e.g. list view's "back to constellation" link) skip straight to the
// graph instead of landing back on the entry splash
const skipLanding = new URLSearchParams(window.location.search).has("skip-landing");

export default function App() {
  const [showLanding, setShowLanding] = useState(!skipLanding);
  const [landingExiting, setLandingExiting] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleEnterSky = () => {
    if (landingExiting) return;
    setLandingExiting(true);
    setTimeout(() => setShowLanding(false), LANDING_EXIT_MS);
  };

  const handleBackToLanding = () => {
    setLandingExiting(false);
    setShowLanding(true);
    // reset the graph back to the full sky, so stepping in again always starts fresh
    // instead of picking up wherever the camera was left
    setActiveKey(null);
    setFocusedHubId(null);
    setPinnedPersonId(null);
    setHoveredPersonId(null);
    cancelFlight();
    setCameraDirect(safeBox);
  };

  // how the design-space hub layout gets stretched to match the actual frame's shape —
  // updated live by the ResizeObserver below. Initial guess matches HUB_POSITIONS' own
  // rough ratio so there's no visible jump once the real measurement comes in.
  const [containerRatio, setContainerRatio] = useState(1.78);
  const { hubs: baseHubs, satellites: baseSatellites, safeBox } = useGraph(containerRatio);
  const { camera, transitioning, flyTo, flyVia, reset, cancelFlight, setCameraDirect, cameraRef } = useCamera();

  const svgRef = useRef(null);
  const frameRef = useRef(null);
  const isInteractingRef = usePanZoom(svgRef, camera, cameraRef, setCameraDirect, cancelFlight);

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

  // measure the actual frame and feed its aspect ratio into the layout itself (useGraph
  // stretches HUB_POSITIONS to match), rather than just cropping the camera to fit
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;
      setContainerRatio(width / height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // once the layout re-stretches to match a new ratio, snap the resting camera to match
  // too — but only while at rest, never mid-zoom/mid-flight, and never while the user has
  // an active pointer down (manually panning/pinching), so it can't fight a live drag
  useEffect(() => {
    const atRest = !activeKey && !focusedHubId && !transitioning && !isInteractingRef.current;
    if (atRest) setCameraDirect(safeBox);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeBox]);

  const cameraIsMoved =
    Math.abs(camera.w - safeBox.w) > 4 ||
    Math.abs(camera.x - safeBox.x) > 4 ||
    Math.abs(camera.y - safeBox.y) > 4;

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
    reset(safeBox);
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
      {showLanding && <Landing exiting={landingExiting} onClick={handleEnterSky} />}
      <button className="landing-return-btn" onClick={handleBackToLanding}>
        ← Back outside
      </button>
      <div className="header-bar">
        <span className="eyebrow">A constellation of voices</span>
        <h1>How we human in the face of AI detection</h1>
        <span className="brought-by">Brought to you by the HART Studio</span>
        <p className="intro-oneliner">
          How our community responded to Substack's new AI Detection feature — in our own words.
        </p>
        <button className="about-toggle" onClick={() => setShowAbout((v) => !v)} aria-expanded={showAbout}>
          {showAbout ? "Hide details ↑" : "ⓘ About this project"}
        </button>
        {showAbout && (
          <>
            <p className="intro-copy">
              On July 21, 2026, Substack released an AI Detection feature with Pangram. Their
              reason was to "catch AI slop." Many of us who work with AI and build with AI don't
              agree with that premise. We also have many different reactions and perspectives. So
              we gathered as a community to share them here.
            </p>
            <p className="intro-instructions">
              Click on a hub to zoom into a given question. Click on a node to see a specific
              writer's response. You can read responses by question or by writer.
            </p>
          </>
        )}
        <div className="header-links-row">
          <a className="list-view-link" href="?list">Prefer a plain list? View it here →</a>
          {(focusedHubId || cameraIsMoved) && (
            <button className="reset-btn" onClick={handleBackgroundClick}>
              ← Back to full sky
            </button>
          )}
        </div>
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

      <footer className="join-footer">
        Want to join the HART Studio?{" "}
        <a href="https://thehartstudio.substack.com" target="_blank" rel="noopener noreferrer">
          Click here for more info
        </a>
      </footer>
    </div>
  );
}
