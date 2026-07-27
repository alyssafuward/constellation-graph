import hartStudioHill from "../assets/landing/hart-studio-hill.png";

export function Landing({ exiting, onClick }) {
  return (
    <div className={`landing-overlay ${exiting ? "is-exiting" : ""}`}>
      {/* frame is locked to the image's own aspect ratio, so the button below stays
          anchored to the same spot on the artwork (the grass under the orange) no
          matter what shape the window is */}
      <div className="landing-frame">
        <img
          src={hartStudioHill}
          alt="The Hart Studio, under a starry sky"
          className="landing-img"
          onClick={onClick}
        />
        <button
          className="landing-hint"
          onClick={onClick}
          aria-label="Enter the constellation"
        >
          Click to step into the sky
        </button>
      </div>
    </div>
  );
}
