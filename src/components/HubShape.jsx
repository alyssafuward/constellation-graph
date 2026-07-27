import squareImg from "../assets/hubs/square.png";
import circleImg from "../assets/hubs/circle.png";
import triangleImg from "../assets/hubs/triangle.png";
import diamondImg from "../assets/hubs/diamond.png";
import pentagonImg from "../assets/hubs/pentagon.png";
import hexagonImg from "../assets/hubs/hexagon.png";
import starImg from "../assets/hubs/star.png";
import crossImg from "../assets/hubs/cross.png";
import heartImg from "../assets/hubs/heart.png";

const SHAPE_IMAGES = {
  square: squareImg,
  circle: circleImg,
  triangle: triangleImg,
  diamond: diamondImg,
  pentagon: pentagonImg,
  hexagon: hexagonImg,
  star: starImg,
  cross: crossImg,
  heart: heartImg,
};

export function HubShape({ shape, size, fill, stroke, dim }) {
  const s = size;
  const props = { fill, stroke, strokeWidth: 2, opacity: dim ? 0.35 : 1 };
  const img = SHAPE_IMAGES[shape];
  if (img) {
    return (
      <image
        href={img}
        x={-s / 2} y={-s / 2} width={s} height={s}
        opacity={dim ? 0.35 : 1}
        style={{ imageRendering: "auto" }}
      />
    );
  }
  switch (shape) {
    case "cloud":
      return (
        <g {...props}>
          <ellipse cx={-s / 4} cy={0} rx={s / 3.4} ry={s / 4} />
          <ellipse cx={s / 4} cy={0} rx={s / 3.4} ry={s / 4} />
          <ellipse cx={0} cy={-s / 8} rx={s / 2.6} ry={s / 3.2} />
        </g>
      );
    default: return <circle cx={0} cy={0} r={s / 2} {...props} />;
  }
}
