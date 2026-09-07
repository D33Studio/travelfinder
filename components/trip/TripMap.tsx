"use client";

import { useId, type KeyboardEvent } from "react";
import { flagEmoji, formatRange, type ResolvedStop } from "@/lib/trip";

/* ------------------------------------------------------------------ */
/*  A stylised route map. Stops are projected (equirectangular) into a  */
/*  fixed 1000×420 canvas, joined by a bowed route, and each gets a     */
/*  thumbnail card placed so it stays inside the canvas and clear of    */
/*  its neighbours. Everything is deterministic — no randomness — so    */
/*  the markup never differs between renders.                           */
/* ------------------------------------------------------------------ */

const W = 1000;
const H = 420;
/* Nodes never come closer than this to the edge, so cards have room around them. */
const MARGIN = 90;
/* The stops' bounding box is widened by this fraction on every side. */
const PAD = 0.28;
const MIN_LNG_SPAN = 4.5;
const MIN_LAT_SPAN = 3;

const NODE_R = 13;
const CARD_W = 104;
const CARD_H = 78;
const CARD_R = 16;
const LABEL_H = 20;
const LABEL_GAP = 6;
/* Label pill + card: the block that has to fit inside the canvas. */
const BLOCK_H = LABEL_H + LABEL_GAP + CARD_H;
const EDGE = 8;
const CARD_GAP = 8;
/* Consecutive stops closer than this get their cards on opposite sides. */
const CLOSE_PX = 140;

interface Pt {
  x: number;
  y: number;
}
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
type HSide = "left" | "right";
type VSide = "above" | "beside" | "below";

interface Marker {
  stop: ResolvedStop;
  index: number;
  node: Pt;
  card: Rect;
  side: HSide;
}

/* ---------- projection ---------- */

function projectStops(stops: ResolvedStop[]): Pt[] {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const { property: p } of stops) {
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
  }
  const midLng = (minLng + maxLng) / 2;
  const midLat = (minLat + maxLat) / 2;
  const lngSpan = Math.max(maxLng - minLng, MIN_LNG_SPAN);
  const latSpan = Math.max(maxLat - minLat, MIN_LAT_SPAN);
  const padded = 1 + 2 * PAD;
  /* One uniform scale: the padded box fits the canvas and the raw box stays inside the margin. */
  const s = Math.min(W / (lngSpan * padded), H / (latSpan * padded), (W - 2 * MARGIN) / lngSpan, (H - 2 * MARGIN) / latSpan);
  return stops.map(({ property: p }) => ({ x: W / 2 + (p.lng - midLng) * s, y: H / 2 - (p.lat - midLat) * s }));
}

/* ---------- card placement ---------- */

const H_OFFSET: Record<HSide, number> = { left: -(CARD_W + 20), right: 20 };
const V_OFFSET: Record<VSide, number> = { above: -(CARD_H + 18), beside: -CARD_H / 2, below: 18 };

const flip = (h: HSide): HSide => (h === "left" ? "right" : "left");
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

function blockRect(node: Pt, h: HSide, v: VSide): Rect {
  return { x: node.x + H_OFFSET[h], y: node.y + V_OFFSET[v] - LABEL_H - LABEL_GAP, w: CARD_W, h: BLOCK_H };
}

function inBounds(r: Rect) {
  return r.x >= EDGE && r.y >= EDGE && r.x + r.w <= W - EDGE && r.y + r.h <= H - EDGE;
}

function overlapArea(a: Rect, b: Rect, gap: number) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + gap;
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + gap;
  return w > 0 && h > 0 ? w * h : 0;
}

function coversNode(r: Rect, p: Pt) {
  const m = NODE_R + 6;
  return p.x > r.x - m && p.x < r.x + r.w + m && p.y > r.y - m && p.y < r.y + r.h + m;
}

function clampRect(r: Rect): Rect {
  return { ...r, x: Math.min(Math.max(r.x, EDGE), W - EDGE - r.w), y: Math.min(Math.max(r.y, EDGE), H - EDGE - r.h) };
}

function candidates(h: HSide): [HSide, VSide][] {
  const o = flip(h);
  return [
    [h, "above"],
    [h, "beside"],
    [h, "below"],
    [o, "above"],
    [o, "beside"],
    [o, "below"],
  ];
}

/** Each card sits diagonally away from its node, pointing towards the middle of
    the map; neighbours that sit close together alternate sides. Slots that would
    leave the canvas are skipped and the rest are scored by how much they overlap
    cards already placed (or cover another node), so the fallback is the least
    crowded slot rather than a collision. */
function placeCards(nodes: Pt[]): { rect: Rect; side: HSide }[] {
  const placed: { rect: Rect; side: HSide }[] = [];
  nodes.forEach((node, i) => {
    let preferred: HSide = node.x < W / 2 ? "right" : "left";
    if (i > 0 && dist(nodes[i - 1], node) < CLOSE_PX) preferred = flip(placed[i - 1].side);

    let best: { rect: Rect; side: HSide; score: number } | null = null;
    for (const [h, v] of candidates(preferred)) {
      const rect = blockRect(node, h, v);
      if (!inBounds(rect)) continue;
      let score = placed.reduce((n, p) => n + overlapArea(rect, p.rect, CARD_GAP), 0);
      score += nodes.reduce((n, other, j) => n + (j !== i && coversNode(rect, other) ? 4000 : 0), 0);
      if (!best || score < best.score) best = { rect, side: h, score };
      if (score === 0) break;
    }
    placed.push(best ? { rect: best.rect, side: best.side } : { rect: clampRect(blockRect(node, preferred, "above")), side: preferred });
  });
  return placed;
}

/* ---------- route ---------- */

const f = (n: number) => Math.round(n * 10) / 10;

function routePath(nodes: Pt[]) {
  let d = "";
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1];
    const b = nodes[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    /* Bow perpendicular to the segment, alternating sides so the route weaves. */
    const bow = len > 0 ? 0.14 * len * (i % 2 ? 1 : -1) : 0;
    const px = len > 0 ? -dy / len : 0;
    const py = len > 0 ? dx / len : 0;
    const c1 = { x: a.x + dx / 3 + px * bow, y: a.y + dy / 3 + py * bow };
    const c2 = { x: a.x + (2 * dx) / 3 + px * bow, y: a.y + (2 * dy) / 3 + py * bow };
    if (i === 1) d += `M${f(a.x)} ${f(a.y)}`;
    d += ` C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(b.x)} ${f(b.y)}`;
  }
  return d;
}

/* ---------- component ---------- */

export default function TripMap({
  stops,
  activeId,
  onSelect,
}: {
  stops: ResolvedStop[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  /* useId can contain characters that are awkward inside url(#…); keep it plain. */
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  if (!stops.length) return null;

  const nodes = projectStops(stops);
  const cards = placeCards(nodes);
  const markers: Marker[] = stops.map((stop, i) => ({
    stop,
    index: i,
    node: nodes[i],
    card: { x: cards[i].rect.x, y: cards[i].rect.y + LABEL_H + LABEL_GAP, w: CARD_W, h: CARD_H },
    side: cards[i].side,
  }));
  const active = markers.find((m) => m.stop.id === activeId) ?? markers[0];
  /* The active marker is drawn last so it sits above its neighbours. */
  const ordered = [...markers.filter((m) => m !== active), active];

  const cities = stops.map((s) => s.property.city);
  const title = stops.length > 1 ? `Route: ${cities.join(" → ")}` : `Location: ${cities[0]}`;
  const gridId = `${uid}-grid`;
  const glowId = `${uid}-glow`;
  const clipId = (i: number) => `${uid}-clip-${i}`;
  const path = routePath(nodes);

  return (
    <div className="tr-map">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" width="100%" height="100%" role="group" aria-label={title}>
        <title>{title}</title>
        <defs>
          <pattern id={gridId} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0v40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#c9a96e" stopOpacity="0" />
          </radialGradient>
          {markers.map((m) => (
            <clipPath key={m.stop.id} id={clipId(m.index)}>
              <rect x={f(m.card.x + 4)} y={f(m.card.y + 4)} width={CARD_W - 8} height={CARD_H - 8} rx={CARD_R - 4} />
            </clipPath>
          ))}
        </defs>

        {/* Backdrop: abstract land, water and a graticule — a placeholder in the product's palette. */}
        <rect width={W} height={H} fill="#141414" />
        <g fill="rgba(120,160,90,0.10)">
          <path d="M-40 30C80 0 190 70 290 30S440 40 410 120 300 190 220 210 60 250-40 280Z" />
          <path d="M600-30C700 30 830 0 920 60S1050 160 1030 250 900 300 850 350 690 380 650 300 560 200 590 110 620 40 600-30Z" />
          <path d="M300 450C330 380 420 330 520 350S660 430 720 460Z" />
        </g>
        <g fill="rgba(90,140,200,0.10)">
          <ellipse cx="480" cy="140" rx="150" ry="62" />
          <ellipse cx="190" cy="340" rx="140" ry="52" />
          <ellipse cx="880" cy="120" rx="80" ry="40" />
        </g>
        <rect width={W} height={H} fill={`url(#${gridId})`} />
        <circle cx={f(active.node.x)} cy={f(active.node.y)} r={70} fill={`url(#${glowId})`} />

        {path && (
          <>
            <path className="tr-route-base" d={path} />
            <path className="tr-route-dash" d={path} />
          </>
        )}

        {ordered.map((m) => (
          <MarkerView key={m.stop.id} marker={m} on={m === active} clipId={clipId(m.index)} onSelect={onSelect} />
        ))}
      </svg>
    </div>
  );
}

function MarkerView({
  marker,
  on,
  clipId,
  onSelect,
}: {
  marker: Marker;
  on: boolean;
  clipId: string;
  onSelect: (id: string) => void;
}) {
  const { stop, index, node, card, side } = marker;
  const n = index + 1;
  const labelW = 45 + 7 * String(n).length;
  const labelX = card.x;
  const labelY = card.y - LABEL_GAP - LABEL_H;
  /* The connector runs from the card's nearest point to the node; the ring covers its end. */
  const sx = Math.min(Math.max(node.x, card.x), card.x + card.w);
  const sy = Math.min(Math.max(node.y, card.y), card.y + card.h);
  /* City name goes on the side the card isn't on. */
  const cityX = side === "left" ? node.x + NODE_R + 7 : node.x - NODE_R - 7;

  const onKeyDown = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(stop.id);
    }
  };

  return (
    <g
      className={`tr-marker${on ? " on" : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={on}
      aria-label={`Stop ${n}: ${stop.property.name}, ${stop.property.city} · ${formatRange(stop.checkIn, stop.checkOut)}`}
      onClick={() => onSelect(stop.id)}
      onKeyDown={onKeyDown}
    >
      <line className="tr-marker-line" x1={f(sx)} y1={f(sy)} x2={f(node.x)} y2={f(node.y)} />
      <rect className="tr-marker-card" x={f(card.x)} y={f(card.y)} width={card.w} height={card.h} rx={CARD_R} />
      <image
        href={stop.property.image}
        x={f(card.x + 4)}
        y={f(card.y + 4)}
        width={card.w - 8}
        height={card.h - 8}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
      <rect className="tr-marker-pill" x={f(labelX)} y={f(labelY)} width={labelW} height={LABEL_H} rx={LABEL_H / 2} />
      <text className="tr-marker-label" x={f(labelX + labelW / 2)} y={f(labelY + LABEL_H / 2)} textAnchor="middle" dominantBaseline="central">
        Stop {n}
      </text>
      <text className="tr-marker-city" x={f(cityX)} y={f(node.y)} textAnchor={side === "left" ? "start" : "end"} dominantBaseline="central">
        {stop.property.city} {flagEmoji(stop.property.countryCode)}
      </text>
      <circle className="tr-marker-ring" cx={f(node.x)} cy={f(node.y)} r={NODE_R} />
      <circle className="tr-marker-dot" cx={f(node.x)} cy={f(node.y)} r={5.5} />
    </g>
  );
}
