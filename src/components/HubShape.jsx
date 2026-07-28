import starWhoTheyAreImg from "../assets/hubs/star-who-they-are.png";
import starFirstReactionImg from "../assets/hubs/star-first-reaction.png";
import starConcernsImg from "../assets/hubs/star-concerns.png";
import starMixedFeelingsImg from "../assets/hubs/star-mixed-feelings.png";
import starOnTransparencyImg from "../assets/hubs/star-on-transparency.png";
import starWorstCaseImg from "../assets/hubs/star-worst-case.png";
import starWhatChangesImg from "../assets/hubs/star-what-changes.png";
import starReadingAScoreImg from "../assets/hubs/star-reading-a-score.png";
import starAdviceImg from "../assets/hubs/star-advice.png";
import starAnythingElseImg from "../assets/hubs/star-anything-else.png";

// every hub is now its own star sticker with its label baked in, keyed by hub id
const HUB_ID_IMAGES = {
  q1: { href: starWhoTheyAreImg, ratio: 337 / 324 },
  q2: { href: starFirstReactionImg, ratio: 337 / 324 },
  q3: { href: starConcernsImg, ratio: 337 / 324 },
  q4: { href: starMixedFeelingsImg, ratio: 337 / 324 },
  q5: { href: starOnTransparencyImg, ratio: 337 / 324 },
  q6: { href: starWorstCaseImg, ratio: 336 / 324 },
  q7: { href: starWhatChangesImg, ratio: 337 / 325 },
  q8: { href: starReadingAScoreImg, ratio: 337 / 324 },
  q9: { href: starAdviceImg, ratio: 337 / 324 },
  q10: { href: starAnythingElseImg, ratio: 337 / 325 },
};

export function HubShape({ hubId, size, dim }) {
  const img = HUB_ID_IMAGES[hubId];
  if (!img) return <circle cx={0} cy={0} r={size / 2} fill="#1F6FA8" opacity={dim ? 0.35 : 1} />;
  // fit within a size x size box (like object-fit: contain) so every hub occupies the
  // same footprint regardless of how wide or tall its own sticker happens to be —
  // fixing height alone made wide shapes balloon outward and look much bigger than tall ones
  const width = img.ratio >= 1 ? size : size * img.ratio;
  const height = img.ratio >= 1 ? size / img.ratio : size;
  return (
    <image
      href={img.href}
      x={-width / 2} y={-height / 2} width={width} height={height}
      opacity={dim ? 0.35 : 1}
      style={{ imageRendering: "auto" }}
    />
  );
}
