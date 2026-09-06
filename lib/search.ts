import { properties, popularDestinations, type Property } from "./properties";
import { allProperties } from "./propertyDetails";
import { DEFAULT_CHECK_IN, DEFAULT_CHECK_OUT, MAX_ADULTS, MAX_CHILDREN, addDays, isIsoDate, joinNames } from "./trip";

/* ------------------------------------------------------------------ */
/*  Search params — the single URL contract shared by every screen     */
/*                                                                     */
/*  /search?q=italy&from=2026-10-16&to=2026-10-19&adults=2&children=0  */
/*  /property/<id>?from=…&to=…&adults=…&children=…[&stop=<stopId>]     */
/* ------------------------------------------------------------------ */

export interface SearchParams {
  q: string;
  from: string;
  to: string;
  adults: number;
  children: number;
}

export const DEFAULT_SEARCH: SearchParams = {
  q: "",
  from: DEFAULT_CHECK_IN,
  to: DEFAULT_CHECK_OUT,
  adults: 2,
  children: 0,
};

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams | null | undefined;

function readRaw(raw: RawParams, key: string): string | undefined {
  if (!raw) return undefined;
  if (raw instanceof URLSearchParams) return raw.get(key) ?? undefined;
  const v = raw[key];
  return Array.isArray(v) ? v[0] : v;
}

function clampInt(v: string | undefined, min: number, max: number, fallback: number) {
  const n = v === undefined ? NaN : parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Tolerant parser: anything missing or malformed falls back to the defaults,
    and an out-of-order date range is repaired to at least one night. */
export function parseSearchParams(raw: RawParams, fallback: SearchParams = DEFAULT_SEARCH): SearchParams {
  const q = (readRaw(raw, "q") ?? fallback.q).trim().slice(0, 80);
  const fromRaw = readRaw(raw, "from");
  const toRaw = readRaw(raw, "to");
  let from = isIsoDate(fromRaw) ? fromRaw : fallback.from;
  let to = isIsoDate(toRaw) ? toRaw : fallback.to;
  if (to <= from) to = addDays(from, 1);
  if (from >= to) from = addDays(to, -1);
  return {
    q,
    from,
    to,
    adults: clampInt(readRaw(raw, "adults"), 1, MAX_ADULTS, fallback.adults),
    children: clampInt(readRaw(raw, "children"), 0, MAX_CHILDREN, fallback.children),
  };
}

export function serializeSearchParams(p: Partial<SearchParams>): string {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  if (p.from) sp.set("from", p.from);
  if (p.to) sp.set("to", p.to);
  if (p.adults !== undefined) sp.set("adults", String(p.adults));
  if (p.children !== undefined) sp.set("children", String(p.children));
  return sp.toString();
}

export function searchHref(p: Partial<SearchParams>) {
  const qs = serializeSearchParams(p);
  return qs ? `/search?${qs}` : "/search";
}

/** Property page link that carries the traveller's dates and party along. */
export function propertyHref(id: string, p?: Partial<SearchParams> | null, stopId?: string) {
  const sp = new URLSearchParams();
  if (p?.from) sp.set("from", p.from);
  if (p?.to) sp.set("to", p.to);
  if (p?.adults !== undefined) sp.set("adults", String(p.adults));
  if (p?.children !== undefined) sp.set("children", String(p.children));
  if (stopId) sp.set("stop", stopId);
  const qs = sp.toString();
  return qs ? `/property/${id}?${qs}` : `/property/${id}`;
}

/* ------------------------------------------------------------------ */
/*  Matching                                                           */
/* ------------------------------------------------------------------ */

/* Lower-case and strip accents so "cote d'azur" finds "Côte d'Azur". */
function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function haystack(p: Property) {
  return norm([p.name, p.location, p.city, p.country, p.region, p.countryCode].join(" | "));
}

/** Every word in the query has to appear somewhere in the property's name or geography,
    so "rome italy" and "italy" both find the Trastevere condo. */
export function matchesQuery(p: Property, query: string) {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const hay = haystack(p);
  return tokens.every((t) => hay.includes(t));
}

export function searchProperties(query: string, list: Property[] = allProperties) {
  return list.filter((p) => matchesQuery(p, query));
}

/** Stops the party from being sent to a two-person flat by default: stays that
    sleep the whole party come first, order otherwise preserved. */
export function fitsParty(p: Property, adults: number, children: number) {
  return p.guests >= adults + children;
}

function partitionByFit(list: Property[], adults: number, children: number) {
  const fits = list.filter((p) => fitsParty(p, adults, children));
  const rest = list.filter((p) => !fitsParty(p, adults, children));
  return [...fits, ...rest];
}

/* ------------------------------------------------------------------ */
/*  Result rows                                                        */
/* ------------------------------------------------------------------ */

export interface ResultGroup {
  id: string;
  title: string;
  subtitle: string;
  items: Property[];
}

/** Human label for what the query matched: the shared country ("Italy"),
    the shared city, or the query itself in title case. */
export function describeMatches(query: string, matches: Property[]) {
  const countries = new Set(matches.map((m) => m.country));
  const cities = new Set(matches.map((m) => m.city));
  if (matches.length && cities.size === 1) return [...cities][0];
  if (matches.length && countries.size === 1) return [...countries][0];
  return query.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildSearchResults(params: SearchParams): ResultGroup[] {
  const { q, adults, children } = params;
  const shown = new Set<string>();
  const take = (list: Property[]) => {
    const out = list.filter((p) => !shown.has(p.id));
    out.forEach((p) => shown.add(p.id));
    return out;
  };

  if (!q) {
    return [
      { id: "featured", title: "Featured properties", subtitle: "Our most-loved stays, ready for your dates", items: take(partitionByFit(properties, adults, children)) },
      { id: "popular", title: "Popular destinations", subtitle: "Handpicked hideaways loved by our travelers", items: take(partitionByFit(popularDestinations, adults, children)) },
    ];
  }

  const matches = partitionByFit(searchProperties(q), adults, children);
  const groups: ResultGroup[] = [];

  if (matches.length) {
    const label = describeMatches(q, matches);
    const places = joinNames(matches.map((m) => (m.city === label ? m.name : m.city)));
    groups.push({
      id: "matches",
      title: `Stays in ${label}`,
      subtitle: matches.length === 1 ? `1 property in ${places}` : `${matches.length} properties across ${places}`,
      items: take(matches),
    });

    const region = matches[0].region;
    const nearby = take(partitionByFit(allProperties.filter((p) => p.region === region), adults, children));
    if (nearby.length) {
      groups.push({
        id: "nearby",
        title: `More in ${region}`,
        subtitle: "Nearby escapes if you'd like to add another stop to the trip",
        items: nearby,
      });
    }
  } else {
    groups.push({
      id: "none",
      title: `Nothing found for “${q}”`,
      subtitle: "Try a country, city or region — or browse the full collection below.",
      items: [],
    });
  }

  const popular = take(partitionByFit(popularDestinations, adults, children));
  if (popular.length) {
    groups.push({ id: "popular", title: "Popular destinations", subtitle: "Handpicked hideaways loved by our travelers", items: popular });
  }

  const rest = take(partitionByFit(allProperties, adults, children));
  if (rest.length) {
    groups.push({ id: "all", title: matches.length ? "Everything else" : "All properties", subtitle: "Every other stay in the Journey collection", items: rest });
  }

  return groups;
}

/** Search-box suggestions: distinct countries and cities, best match first. */
export function suggestPlaces(query: string, limit = 6): { label: string; sub: string; countryCode: string }[] {
  const q = norm(query.trim());
  const seen = new Set<string>();
  const out: { label: string; sub: string; countryCode: string; score: number }[] = [];
  for (const p of allProperties) {
    const candidates: [string, string][] = [
      [p.country, `${p.region}`],
      [p.city, `${p.country}`],
    ];
    for (const [label, sub] of candidates) {
      const key = `${label}|${sub}`;
      if (seen.has(key)) continue;
      const n = norm(label);
      const score = !q ? 1 : n.startsWith(q) ? 3 : n.includes(q) ? 2 : 0;
      if (!score) continue;
      seen.add(key);
      out.push({ label, sub, countryCode: p.countryCode, score });
    }
  }
  return out
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, limit)
    .map(({ label, sub, countryCode }) => ({ label, sub, countryCode }));
}
