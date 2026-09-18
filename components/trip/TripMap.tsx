"use client";

import { useEffect, useId, useMemo, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { geoGraticule10, geoOrthographic, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryObject, Topology } from "topojson-specification";
import { flagEmoji, formatRange, type ResolvedStop } from "@/lib/trip";

/* ------------------------------------------------------------------ */
/*  The route on a globe. Stops are projected orthographically onto a   */
/*  sphere turned to face the trip and zoomed until the stops fill the  */
/*  canvas, over real coastlines (Natural Earth 1:50m) in grey on black.*/
/*  Consecutive stops are joined by great-circle arcs, and each gets a  */
/*  thumbnail card placed inside the canvas and clear of its neighbours.*/
/*  Everything is deterministic, so the markup never differs between   */
/*  renders.                                                            */
/* ------------------------------------------------------------------ */

const W = 1000;
/* Wide canvas on desktop, a taller one on phones so nothing is cropped. */
const H_WIDE = 420;
const H_TALL = 640;
const TALL_QUERY = "(max-width: 720px)";
/* Nodes never come closer than this to the edge, so cards have room around them. */
const MARGIN = 90;
/* A single stop, or stops very close together, still show this much of the world. */
const MIN_SPAN_DEG = 9;
const RAD = Math.PI / 180;
/* Above this globe radius (px) a degree spans enough pixels for 1:50m coastlines to matter. */
const FINE_SCALE = 1500;

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

/* ---------- land, fetched once per resolution after first paint ---------- */

type LandRes = "110m" | "50m";
const landCache: Partial<Record<LandRes, GeoPermissibleObjects>> = {};
const landPromise: Partial<Record<LandRes, Promise<GeoPermissibleObjects>>> = {};

function loadLand(res: LandRes) {
  let p = landPromise[res];
  if (!p) {
    const file = res === "50m" ? import("world-atlas/land-50m.json") : import("world-atlas/land-110m.json");
    p = file.then((mod) => {
      const topo = mod.default as unknown as Topology;
      const land = feature(topo, topo.objects.land as GeometryObject) as GeoPermissibleObjects;
      landCache[res] = land;
      return land;
    });
    landPromise[res] = p;
  }
  return p;
}

/** The land at the wanted resolution, or the coarse one while the fine one is still loading. */
function useLand(res: LandRes) {
  const [, bump] = useState(0);
  useEffect(() => {
    if (landCache[res]) return;
    let alive = true;
    loadLand(res).then(() => {
      if (alive) bump((n) => n + 1);
    });
    return () => {
      alive = false;
    };
  }, [res]);
  return landCache[res] ?? landCache["110m"] ?? null;
}

function subscribeTall(cb: () => void) {
  const mq = window.matchMedia(TALL_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function useTallCanvas() {
  return useSyncExternalStore(
    subscribeTall,
    () => window.matchMedia(TALL_QUERY).matches,
    () => false
  );
}

/* ---------- projection ---------- */

/** Mean of the stops as unit vectors, so trips across the antimeridian still centre correctly. */
function sphereCentroid(stops: ResolvedStop[]): [number, number] {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const { property: p } of stops) {
    const lat = p.lat * RAD;
    const lng = p.lng * RAD;
    x += Math.cos(lat) * Math.cos(lng);
    y += Math.cos(lat) * Math.sin(lng);
    z += Math.sin(lat);
  }
  return [Math.atan2(y, x) / RAD, Math.atan2(z, Math.hypot(x, y)) / RAD];
}

function buildProjection(coords: [number, number][], stops: ResolvedStop[], h: number) {
  const [cLng, cLat] = sphereCentroid(stops);
  const proj = geoOrthographic()
    .rotate([-cLng, -cLat])
    .clipAngle(90)
    .clipExtent([
      [-40, -40],
      [W + 40, h + 40],
    ]);
  proj.fitExtent(
    [
      [MARGIN, MARGIN],
      [W - MARGIN, h - MARGIN],
    ],
    { type: "MultiPoint", coordinates: coords }
  );
  /* fitExtent zooms without limit on a single stop (or a tiny hop); cap it. */
  const maxScale = (W - 2 * MARGIN) / (MIN_SPAN_DEG * RAD);
  if (!Number.isFinite(proj.scale()) || proj.scale() > maxScale) proj.scale(maxScale).translate([W / 2, h / 2]);
  return proj;
}

/* ---------- card placement ---------- */

const H_OFFSET: Record<HSide, number> = { left: -(CARD_W + 20), right: 20 };
const V_OFFSET: Record<VSide, number> = { above: -(CARD_H + 18), beside: -CARD_H / 2, below: 18 };

const flip = (h: HSide): HSide => (h === "left" ? "right" : "left");
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

function blockRect(node: Pt, h: HSide, v: VSide): Rect {
  return { x: node.x + H_OFFSET[h], y: node.y + V_OFFSET[v] - LABEL_H - LABEL_GAP, w: CARD_W, h: BLOCK_H };
}

function inBounds(r: Rect, h: number) {
  return r.x >= EDGE && r.y >= EDGE && r.x + r.w <= W - EDGE && r.y + r.h <= h - EDGE;
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

function clampRect(r: Rect, h: number): Rect {
  return { ...r, x: Math.min(Math.max(r.x, EDGE), W - EDGE - r.w), y: Math.min(Math.max(r.y, EDGE), h - EDGE - r.h) };
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
function placeCards(nodes: Pt[], h: number): { rect: Rect; side: HSide }[] {
  const placed: { rect: Rect; side: HSide }[] = [];
  nodes.forEach((node, i) => {
    let preferred: HSide = node.x < W / 2 ? "right" : "left";
    if (i > 0 && dist(nodes[i - 1], node) < CLOSE_PX) preferred = flip(placed[i - 1].side);

    let best: { rect: Rect; side: HSide; score: number } | null = null;
    for (const [hs, vs] of candidates(preferred)) {
      const rect = blockRect(node, hs, vs);
      if (!inBounds(rect, h)) continue;
      let score = placed.reduce((n, p) => n + overlapArea(rect, p.rect, CARD_GAP), 0);
      score += nodes.reduce((n, other, j) => n + (j !== i && coversNode(rect, other) ? 4000 : 0), 0);
      if (!best || score < best.score) best = { rect, side: hs, score };
      if (score === 0) break;
    }
    placed.push(best ? { rect: best.rect, side: best.side } : { rect: clampRect(blockRect(node, preferred, "above"), h), side: preferred });
  });
  return placed;
}

/* ---------- component ---------- */

const f = (n: number) => Math.round(n * 10) / 10;

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
  const h = useTallCanvas() ? H_TALL : H_WIDE;

  const proj = useMemo(() => {
    if (!stops.length) return null;
    const coords = stops.map((s) => [s.property.lng, s.property.lat] as [number, number]);
    return buildProjection(coords, stops, h);
  }, [stops, h]);
  const land = useLand(proj && proj.scale() > FINE_SCALE ? "50m" : "110m");

  /* Projecting the coastlines is the expensive part; it only changes with the
     stops, the canvas or the land data, not with the selected stop. */
  const scene = useMemo(() => {
    if (!proj) return null;
    const coords = stops.map((s) => [s.property.lng, s.property.lat] as [number, number]);
    const path = geoPath(proj);
    const nodes = coords.map((c) => {
      const p = proj(c) ?? [W / 2, h / 2];
      return { x: p[0], y: p[1] };
    });
    return {
      nodes,
      cards: placeCards(nodes, h),
      land: land ? path(land) : null,
      graticule: path(geoGraticule10()),
      sphere: path({ type: "Sphere" }),
      route: stops.length > 1 ? path({ type: "LineString", coordinates: coords }) : null,
    };
  }, [proj, stops, h, land]);

  if (!scene) return null;

  const markers: Marker[] = stops.map((stop, i) => ({
    stop,
    index: i,
    node: scene.nodes[i],
    card: { x: scene.cards[i].rect.x, y: scene.cards[i].rect.y + LABEL_H + LABEL_GAP, w: CARD_W, h: CARD_H },
    side: scene.cards[i].side,
  }));
  const active = markers.find((m) => m.stop.id === activeId) ?? markers[0];
  /* The active marker is drawn last so it sits above its neighbours. */
  const ordered = [...markers.filter((m) => m !== active), active];

  const cities = stops.map((s) => s.property.city);
  const title = stops.length > 1 ? `Route: ${cities.join(" → ")}` : `Location: ${cities[0]}`;
  const glowId = `${uid}-glow`;
  const clipId = (i: number) => `${uid}-clip-${i}`;

  return (
    <div className="tr-map">
      <svg viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="xMidYMid slice" width="100%" height="100%" role="group" aria-label={title}>
        <title>{title}</title>
        <defs>
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

        <rect className="tr-map-sea" width={W} height={h} />
        {scene.graticule && <path className="tr-map-graticule" d={scene.graticule} />}
        {scene.land && <path className="tr-map-land" d={scene.land} />}
        {scene.sphere && <path className="tr-map-sphere" d={scene.sphere} />}
        <circle cx={f(active.node.x)} cy={f(active.node.y)} r={70} fill={`url(#${glowId})`} />

        {scene.route && (
          <>
            <path className="tr-route-base" d={scene.route} />
            <path className="tr-route-dash" d={scene.route} />
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
