// Hand-drawn-style wobbly circle variants for satellite dots, each defined in a -10..10
// local box (nominal radius 10) so callers can scale to whatever radius they need via a
// wrapping transform. Picked per-satellite so dots get some organic variety instead of
// every one being an identical perfect circle, while staying freely colorable via fill.
export const DOT_SHAPES = [
  "M 0,-10 C 5.7,-10 10,-5.4 9.8,-0.6 C 9.6,4.2 6.1,9.6 0.4,9.9 C -5.3,10.2 -10,5.3 -10,-0.5 C -10,-6 -5.4,-10 0,-10 Z",
  "M -0.6,-9.8 C 5,-10.3 9.9,-6 10,-0.3 C 10.1,4.8 6.4,9.4 0.9,9.8 C -4.4,10.2 -9.3,6.6 -9.8,1 C -10.2,-4.3 -6,-9.3 -0.6,-9.8 Z",
  "M 0.3,-10 C 6,-9.6 10.2,-5 9.9,0.5 C 9.6,5.6 5.2,9.8 -0.4,9.6 C -6,9.4 -10.1,4.6 -9.8,-1 C -9.5,-6.3 -5.2,-10.4 0.3,-10 Z",
  "M -0.4,-9.9 C 4.9,-10.4 9.6,-6.6 9.9,-1.3 C 10.2,3.7 6.5,9.2 1.1,9.9 C -4.6,10.6 -9.8,6.3 -9.9,0.6 C -10,-4.9 -5.6,-9.4 -0.4,-9.9 Z",
  "M 0.6,-9.7 C 6.2,-9.9 10.3,-5.1 9.7,0.4 C 9.1,5.7 4.4,10.1 -1.1,9.7 C -6.5,9.3 -10.2,4.2 -9.6,-1.2 C -9,-6.5 -4.6,-9.5 0.6,-9.7 Z",
];

export function dotShapeFor(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 97;
  return DOT_SHAPES[hash % DOT_SHAPES.length];
}
