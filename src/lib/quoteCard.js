const CARD_W = 1200;
const CARD_H = 630;
const EXPORT_SCALE = 2;
const PAPER = "#FBF9F4";
const INK = "#241F1A";
const KICKER = "HOW WE HUMAN IN THE FACE OF AI DETECTION";
const SOURCE_LABEL = "A constellation of voices";

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Renders a shareable quote card as a PNG data URL — same layout validated in the
// artifact prototype: writer (dot + name + handle) leads, a colored rule stands in
// for a quotation mark, footer carries the piece's own branding. Person's own graph
// color is reused directly as the accent (matches how it's already used elsewhere,
// e.g. the "Follow X's response" button), so no extra per-person styling is needed.
export function renderQuoteCard({ name, handle, quote, accent }) {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W * EXPORT_SCALE;
  canvas.height = CARD_H * EXPORT_SCALE;
  const ctx = canvas.getContext("2d");
  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
  ctx.textBaseline = "top";

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const padX = 88, padTop = 76, padBottom = 68;

  const nameSize = 34, handleSize = 19, whoGap = 8;
  const dotD = nameSize, dotR = dotD / 2;
  ctx.beginPath();
  ctx.arc(padX + dotR, padTop + dotR, dotR, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();

  const textX = padX + dotD + 18;
  ctx.fillStyle = accent;
  ctx.font = `700 ${nameSize}px "DM Sans"`;
  ctx.fillText(name, textX, padTop);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = INK;
  ctx.font = `400 ${handleSize}px "DM Sans"`;
  ctx.fillText(handle, textX, padTop + nameSize + whoGap - 4);
  ctx.globalAlpha = 1;
  const whoBottom = padTop + nameSize + whoGap + handleSize;

  const footRuleY = CARD_H - padBottom;
  const footTextTop = footRuleY + 22;

  const quoteTop = whoBottom + 40;
  const quoteBottom = footRuleY - 34;
  const ruleX = padX, textLeft = ruleX + 26;
  const maxWidth = CARD_W - padX - textLeft;

  let fontSize = 56, lines = [], lineHeight = 0;
  ctx.fillStyle = INK;
  while (fontSize > 26) {
    ctx.font = `400 ${fontSize}px "DM Serif Display"`;
    lines = wrapText(ctx, quote, maxWidth);
    lineHeight = fontSize * 1.3;
    if (lines.length * lineHeight <= quoteBottom - quoteTop) break;
    fontSize -= 2;
  }
  const blockHeight = lines.length * lineHeight;
  const blockTop = quoteTop + Math.max(0, (quoteBottom - quoteTop - blockHeight) / 2);

  ctx.fillStyle = accent;
  ctx.fillRect(ruleX, blockTop, 3, blockHeight);

  ctx.fillStyle = INK;
  ctx.font = `400 ${fontSize}px "DM Serif Display"`;
  lines.forEach((line, i) => ctx.fillText(line, textLeft, blockTop + i * lineHeight + (lineHeight - fontSize) * 0.3));

  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, footRuleY);
  ctx.lineTo(CARD_W - padX, footRuleY);
  ctx.stroke();

  ctx.globalAlpha = 0.55;
  ctx.fillStyle = INK;
  ctx.font = '700 14px "DM Sans"';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "1.4px";
  ctx.fillText(KICKER, padX, footTextTop);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  ctx.font = '600 14px "DM Sans"';
  const labelWidth = ctx.measureText(SOURCE_LABEL).width;
  const markW = 32, markGap = 12, rightEdge = CARD_W - padX;
  ctx.fillText(SOURCE_LABEL, rightEdge - labelWidth, footTextTop);

  const markX = rightEdge - labelWidth - markGap - markW, markY = footTextTop + 3;
  ctx.strokeStyle = INK;
  ctx.setLineDash([1.5, 3]);
  ctx.beginPath();
  ctx.moveTo(markX + 2, markY + 12);
  ctx.lineTo(markX + 16, markY + 2);
  ctx.lineTo(markX + 30, markY + 9);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = INK;
  [[2, 12], [16, 2], [30, 9]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(markX + x, markY + y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/png");
}
