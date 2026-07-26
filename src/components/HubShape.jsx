export function HubShape({ shape, size, fill, stroke, dim }) {
  const s = size;
  const props = { fill, stroke, strokeWidth: 2, opacity: dim ? 0.35 : 1 };
  switch (shape) {
    case "circle": return <circle cx={0} cy={0} r={s / 2} {...props} />;
    case "square": return <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={4} {...props} />;
    case "triangle": return <polygon points={`0,${-s / 1.7} ${s / 1.9},${s / 2.2} ${-s / 1.9},${s / 2.2}`} {...props} />;
    case "diamond": return <polygon points={`0,${-s / 1.6} ${s / 1.6},0 0,${s / 1.6} ${-s / 1.6},0`} {...props} />;
    case "pentagon": {
      const pts = Array.from({ length: 5 }, (_, i) => {
        const a = (2 * Math.PI * i) / 5 - Math.PI / 2;
        return `${(s / 1.7) * Math.cos(a)},${(s / 1.7) * Math.sin(a)}`;
      }).join(" ");
      return <polygon points={pts} {...props} />;
    }
    case "hexagon": {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (2 * Math.PI * i) / 6;
        return `${(s / 1.7) * Math.cos(a)},${(s / 1.7) * Math.sin(a)}`;
      }).join(" ");
      return <polygon points={pts} {...props} />;
    }
    case "star": {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? s / 1.6 : s / 3.4;
        const a = (Math.PI * i) / 5 - Math.PI / 2;
        return `${r * Math.cos(a)},${r * Math.sin(a)}`;
      }).join(" ");
      return <polygon points={pts} {...props} />;
    }
    case "cross": {
      const t = s / 3.2;
      return <path d={`M ${-t / 2} ${-s / 2} H ${t / 2} V ${-t / 2} H ${s / 2} V ${t / 2} H ${t / 2} V ${s / 2} H ${-t / 2} V ${t / 2} H ${-s / 2} V ${-t / 2} H ${-t / 2} Z`} {...props} />;
    }
    case "cloud":
      return (
        <g {...props}>
          <ellipse cx={-s / 4} cy={0} rx={s / 3.4} ry={s / 4} />
          <ellipse cx={s / 4} cy={0} rx={s / 3.4} ry={s / 4} />
          <ellipse cx={0} cy={-s / 8} rx={s / 2.6} ry={s / 3.2} />
        </g>
      );
    case "heart":
      return <path d={`M0,${s / 4} C ${-s / 2},${-s / 4} ${-s / 4},${-s / 2} 0,${-s / 6} C ${s / 4},${-s / 2} ${s / 2},${-s / 4} 0,${s / 4} Z`} {...props} />;
    default: return <circle cx={0} cy={0} r={s / 2} {...props} />;
  }
}
