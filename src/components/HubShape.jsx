import squareImg from "../assets/hubs/square.png";
import circleImg from "../assets/hubs/circle.png";
import triangleImg from "../assets/hubs/triangle.png";
import diamondImg from "../assets/hubs/diamond.png";
import pentagonImg from "../assets/hubs/pentagon.png";
import hexagonImg from "../assets/hubs/hexagon.png";
import starImg from "../assets/hubs/star.png";
import crossImg from "../assets/hubs/cross.png";
import heartImg from "../assets/hubs/heart.png";
import ellipseImg from "../assets/hubs/ellipse.png";

// each hand-drawn sticker already has its label baked in, and each has its own natural
// aspect ratio (they're no longer uniform square canvases) — ratio = width / height, so
// "size" below always maps to the sticker's height and width is derived, never stretched.
const SHAPE_IMAGES = {
  star: { href: starImg, ratio: 337 / 324 },
  square: { href: squareImg, ratio: 247 / 219 },
  pentagon: { href: pentagonImg, ratio: 323 / 327 },
  triangle: { href: triangleImg, ratio: 248 / 267 },
  diamond: { href: diamondImg, ratio: 268 / 268 },
  cross: { href: crossImg, ratio: 262 / 286 },
  circle: { href: circleImg, ratio: 264 / 253 },
  hexagon: { href: hexagonImg, ratio: 290 / 232 },
  heart: { href: heartImg, ratio: 296 / 245 },
  ellipse: { href: ellipseImg, ratio: 325 / 212 },
};

export function HubShape({ shape, size, dim }) {
  const img = SHAPE_IMAGES[shape];
  if (!img) return <circle cx={0} cy={0} r={size / 2} fill="#1F6FA8" opacity={dim ? 0.35 : 1} />;
  // fit within a size x size box (like object-fit: contain) so every hub occupies the
  // same footprint regardless of how wide or tall its own sticker happens to be —
  // fixing height alone made wide shapes (ellipse, hexagon, heart) balloon outward
  // and look much bigger than tall ones (cross, triangle, pentagon)
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
