import whoTheyAreImg from "../assets/hub-labels/who-they-are.png";
import firstReactionImg from "../assets/hub-labels/first-reaction.png";
import concernsImg from "../assets/hub-labels/concerns.png";

// height/width in graph units — width derived from each image's own aspect ratio so it
// never stretches; height is picked once so every hand-drawn label reads at the same size.
const LABEL_HEIGHT = 34;
const HUB_LABEL_IMAGES = {
  q1: { href: whoTheyAreImg, ratio: 1040 / 168 },
  q2: { href: firstReactionImg, ratio: 1242 / 172 },
  q3: { href: concernsImg, ratio: 808 / 161 },
};

export function HubLabel({ hubId, label, y, opacity }) {
  const img = HUB_LABEL_IMAGES[hubId];
  if (img) {
    const width = LABEL_HEIGHT * img.ratio;
    return (
      <image
        href={img.href}
        x={-width / 2} y={y - LABEL_HEIGHT} width={width} height={LABEL_HEIGHT}
        opacity={opacity}
      />
    );
  }
  return (
    <text y={y} textAnchor="middle" className="hub-label" opacity={opacity}>
      {label}
    </text>
  );
}
