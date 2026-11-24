/* Garden grid model, plant data and layout checks for Bedmap. One cell is 30 cm square. */

export const CELL_CM = 30;
export type Sun = 'full' | 'part' | 'shade';
export const SUN_LABEL: Record<Sun, string> = { full: 'Full sun (6+ h)', part: 'Part shade (3–6 h)', shade: 'Shade (under 3 h)' };
export const SUN_CHAR: Record<Sun, string> = { full: 'f', part: 'p', shade: 's' };
const CHAR_SUN: Record<string, Sun> = { f: 'full', p: 'part', s: 'shade' };

export interface Plant { id: string; name: string; code: string; group: 'Vegetable' | 'Herb' | 'Flower' | 'Fruit'; spacing: number; sun: Sun[]; height: number; friends: string[]; foes: string[]; color: string; note: string }
export const PLANTS: Plant[] = [
  { id: 'tomato', name: 'Tomato', code: 'To', group: 'Vegetable', spacing: 60, sun: ['full'], height: 150, friends: ['basil', 'marigold', 'carrot'], foes: ['potato', 'fennel'], color: '#c8372d', note: 'Stake or cage; water evenly to avoid split fruit.' },
  { id: 'basil', name: 'Basil', code: 'Ba', group: 'Herb', spacing: 25, sun: ['full'], height: 40, friends: ['tomato', 'pepper'], foes: [], color: '#3f8f3a', note: 'Pinch out tips to keep it bushy.' },
  { id: 'pepper', name: 'Pepper', code: 'Pe', group: 'Vegetable', spacing: 45, sun: ['full'], height: 70, friends: ['basil', 'onion'], foes: ['fennel'], color: '#d9822b', note: 'Needs warmth; good in a sheltered sunny spot.' },
  { id: 'lettuce', name: 'Lettuce', code: 'Le', group: 'Vegetable', spacing: 25, sun: ['full', 'part'], height: 25, friends: ['carrot', 'radish', 'onion'], foes: [], color: '#8bbf3f', note: 'Tolerates light shade; bolts in hot sun.' },
  { id: 'carrot', name: 'Carrot', code: 'Ca', group: 'Vegetable', spacing: 10, sun: ['full', 'part'], height: 30, friends: ['onion', 'lettuce', 'tomato'], foes: ['dill'], color: '#e07b1f', note: 'Sow direct in stone-free soil.' },
  { id: 'onion', name: 'Onion', code: 'On', group: 'Vegetable', spacing: 15, sun: ['full'], height: 45, friends: ['carrot', 'lettuce', 'pepper'], foes: ['bean', 'pea'], color: '#b38bb5', note: 'Onion scent helps deter carrot fly.' },
  { id: 'bean', name: 'Runner bean', code: 'Be', group: 'Vegetable', spacing: 30, sun: ['full'], height: 220, friends: ['sweetcorn', 'squash', 'carrot'], foes: ['onion', 'garlic'], color: '#4f7f2a', note: 'Tall: put on the north side so it doesn’t shade others.' },
  { id: 'pea', name: 'Pea', code: 'Pa', group: 'Vegetable', spacing: 10, sun: ['full', 'part'], height: 90, friends: ['carrot', 'radish'], foes: ['onion', 'garlic'], color: '#6fae4b', note: 'Give them netting or twiggy sticks.' },
  { id: 'squash', name: 'Courgette / squash', code: 'Sq', group: 'Vegetable', spacing: 90, sun: ['full'], height: 60, friends: ['bean', 'sweetcorn', 'nasturtium'], foes: ['potato'], color: '#e0b72b', note: 'Sprawls widely; one plant is plenty for most households.' },
  { id: 'sweetcorn', name: 'Sweetcorn', code: 'Sc', group: 'Vegetable', spacing: 45, sun: ['full'], height: 180, friends: ['bean', 'squash'], foes: ['tomato'], color: '#e9cf4a', note: 'Plant in blocks, not rows, for pollination.' },
  { id: 'potato', name: 'Potato', code: 'Po', group: 'Vegetable', spacing: 40, sun: ['full'], height: 60, friends: ['bean'], foes: ['tomato', 'squash'], color: '#9b7b52', note: 'Earth up the stems as they grow.' },
  { id: 'radish', name: 'Radish', code: 'Ra', group: 'Vegetable', spacing: 5, sun: ['full', 'part'], height: 15, friends: ['lettuce', 'pea', 'carrot'], foes: [], color: '#d3445f', note: 'Ready in four weeks — fill gaps between slow crops.' },
  { id: 'kale', name: 'Kale', code: 'Ka', group: 'Vegetable', spacing: 45, sun: ['full', 'part'], height: 70, friends: ['onion', 'nasturtium'], foes: ['strawberry'], color: '#2f6b4f', note: 'Net against pigeons and cabbage white butterflies.' },
  { id: 'garlic', name: 'Garlic', code: 'Ga', group: 'Vegetable', spacing: 15, sun: ['full'], height: 50, friends: ['carrot', 'tomato'], foes: ['bean', 'pea'], color: '#c7b8a2', note: 'Plant cloves in autumn for a summer harvest.' },
  { id: 'strawberry', name: 'Strawberry', code: 'St', group: 'Fruit', spacing: 30, sun: ['full', 'part'], height: 25, friends: ['lettuce', 'onion'], foes: ['kale'], color: '#e0314b', note: 'Mulch with straw to keep fruit clean.' },
  { id: 'mint', name: 'Mint', code: 'Mi', group: 'Herb', spacing: 45, sun: ['full', 'part', 'shade'], height: 50, friends: ['kale'], foes: [], color: '#4fae8a', note: 'Spreads aggressively — best grown in a pot.' },
  { id: 'parsley', name: 'Parsley', code: 'Py', group: 'Herb', spacing: 20, sun: ['full', 'part'], height: 30, friends: ['tomato'], foes: [], color: '#5d9e2f', note: 'Slow to germinate; soak seeds overnight.' },
  { id: 'dill', name: 'Dill', code: 'Di', group: 'Herb', spacing: 30, sun: ['full'], height: 90, friends: ['lettuce', 'onion'], foes: ['carrot', 'tomato'], color: '#9fc94a', note: 'Attracts hoverflies that eat aphids.' },
  { id: 'fennel', name: 'Fennel', code: 'Fe', group: 'Herb', spacing: 45, sun: ['full'], height: 150, friends: [], foes: ['tomato', 'pepper', 'bean'], color: '#a8c96a', note: 'Inhibits many neighbours — give it its own spot.' },
  { id: 'marigold', name: 'French marigold', code: 'Mg', group: 'Flower', spacing: 25, sun: ['full'], height: 30, friends: ['tomato', 'bean'], foes: [], color: '#f0a020', note: 'Said to deter whitefly from tomatoes.' },
  { id: 'nasturtium', name: 'Nasturtium', code: 'Na', group: 'Flower', spacing: 30, sun: ['full', 'part'], height: 30, friends: ['squash', 'kale', 'bean'], foes: [], color: '#e8641e', note: 'A sacrificial crop that draws aphids away.' },
  { id: 'foxglove', name: 'Foxglove', code: 'Fx', group: 'Flower', spacing: 45, sun: ['part', 'shade'], height: 120, friends: [], foes: [], color: '#b04a9c', note: 'Loved by bees. All parts are poisonous — not near edibles.' },
];
export const plantById = (id: string) => PLANTS.find((p) => p.id === id);

export interface Bed { id: string; name: string; x: number; y: number; w: number; h: number }
export interface Planting { id: string; plant: string; x: number; y: number }
export interface Garden { cols: number; rows: number; sun: string[]; beds: Bed[]; plantings: Planting[] }

export const gridSize = (widthM: number, depthM: number) => ({ cols: Math.round((widthM * 100) / CELL_CM), rows: Math.round((depthM * 100) / CELL_CM) });
export function emptyGarden(cols: number, rows: number): Garden {
  return { cols, rows, sun: Array.from({ length: rows }, () => 'f'.repeat(cols)), beds: [], plantings: [] };
}
/** Resizes the grid, keeping sun data and dropping beds and plants that no longer fit. */
export function resizeGarden(g: Garden, cols: number, rows: number): { garden: Garden; dropped: number } {
  const sun = Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => g.sun[y]?.[x] ?? 'f').join(''));
  const beds = g.beds.filter((b) => b.x + b.w <= cols && b.y + b.h <= rows);
  const plantings = g.plantings.filter((p) => p.x < cols && p.y < rows && beds.some((b) => inBed(b, p.x, p.y)));
  return { garden: { cols, rows, sun, beds, plantings }, dropped: g.beds.length - beds.length + g.plantings.length - plantings.length };
}

export const sunAt = (g: Garden, x: number, y: number): Sun => CHAR_SUN[g.sun[y]?.[x] ?? 'f'] ?? 'full';
export function paintSun(g: Garden, x: number, y: number, s: Sun): Garden {
  if (x < 0 || y < 0 || x >= g.cols || y >= g.rows || sunAt(g, x, y) === s) return g;
  const sun = g.sun.map((row, i) => (i === y ? row.slice(0, x) + SUN_CHAR[s] + row.slice(x + 1) : row));
  return { ...g, sun };
}
export const inBed = (b: Bed, x: number, y: number) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;
export const bedAt = (g: Garden, x: number, y: number) => g.beds.find((b) => inBed(b, x, y));
export const plantingAt = (g: Garden, x: number, y: number) => g.plantings.find((p) => p.x === x && p.y === y);

export function rectFrom(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x) + 1, h: Math.abs(a.y - b.y) + 1 };
}
const overlaps = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export function addBed(g: Garden, r: { x: number; y: number; w: number; h: number }, id: string, name?: string): { garden: Garden; error?: string } {
  if (r.x < 0 || r.y < 0 || r.x + r.w > g.cols || r.y + r.h > g.rows) return { garden: g, error: 'The bed must fit inside the garden.' };
  if (r.w * r.h < 2) return { garden: g, error: 'Make the bed at least two cells (60 cm) long.' };
  if (g.beds.some((b) => overlaps(b, r))) return { garden: g, error: 'Beds can’t overlap. Leave a path between them.' };
  return { garden: { ...g, beds: [...g.beds, { id, name: name ?? `Bed ${g.beds.length + 1}`, ...r }] } };
}
export function removeBed(g: Garden, id: string): Garden {
  const b = g.beds.find((x) => x.id === id);
  if (!b) return g;
  return { ...g, beds: g.beds.filter((x) => x.id !== id), plantings: g.plantings.filter((p) => !inBed(b, p.x, p.y)) };
}
export function placePlant(g: Garden, plant: string, x: number, y: number, id: string): { garden: Garden; error?: string } {
  if (!plantById(plant)) return { garden: g, error: 'Unknown plant.' };
  if (!bedAt(g, x, y)) return { garden: g, error: 'Plants go in beds. Draw a bed here first.' };
  if (plantingAt(g, x, y)) return { garden: g, error: 'That cell already has a plant. Erase it first.' };
  return { garden: { ...g, plantings: [...g.plantings, { id, plant, x, y }] } };
}
export const removePlanting = (g: Garden, id: string): Garden => ({ ...g, plantings: g.plantings.filter((p) => p.id !== id) });

/* ---------- Checks ---------- */
export type Level = 'error' | 'warn' | 'good';
export interface Issue { id: string; level: Level; message: string; cells: { x: number; y: number }[] }

/** Distance between cell centres in cm. */
export const distanceCm = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y) * CELL_CM;
/** Two plants are crowded when their centres are closer than the average of their spacings. Small crops (≤ 15 cm) share a cell's neighbours freely. */
export function crowded(a: Planting, b: Planting): boolean {
  const pa = plantById(a.plant)!, pb = plantById(b.plant)!;
  return distanceCm(a, b) + 0.01 < (pa.spacing + pb.spacing) / 2;
}

export function checkGarden(g: Garden): Issue[] {
  const out: Issue[] = [];
  const ps = g.plantings;
  for (const p of ps) {
    const info = plantById(p.plant)!;
    const s = sunAt(g, p.x, p.y);
    if (!info.sun.includes(s)) out.push({ id: `sun-${p.id}`, level: 'warn', message: `${info.name} needs ${info.sun.map((x) => SUN_LABEL[x].split(' (')[0].toLowerCase()).join(' or ')}, but this spot is ${SUN_LABEL[s].split(' (')[0].toLowerCase()}.`, cells: [p] });
  }
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const a = ps[i], b = ps[j];
    const pa = plantById(a.plant)!, pb = plantById(b.plant)!;
    const d = distanceCm(a, b);
    if (crowded(a, b)) out.push({ id: `space-${a.id}-${b.id}`, level: 'error', message: `${pa.name} and ${pb.name} are ${Math.round(d)} cm apart; they need about ${Math.round((pa.spacing + pb.spacing) / 2)} cm.`, cells: [a, b] });
    if (d <= 3 * CELL_CM + 0.01) {
      if (pa.foes.includes(pb.id) || pb.foes.includes(pa.id)) out.push({ id: `foe-${a.id}-${b.id}`, level: 'warn', message: `${pa.name} and ${pb.name} are poor neighbours — move them at least 90 cm apart.`, cells: [a, b] });
      else if (pa.friends.includes(pb.id) || pb.friends.includes(pa.id)) out.push({ id: `friend-${a.id}-${b.id}`, level: 'good', message: `${pa.name} and ${pb.name} are good companions.`, cells: [a, b] });
    }
  }
  // Tall plants directly south (lower on the plan) of sun-lovers cast shade northwards.
  for (const tall of ps) {
    const t = plantById(tall.plant)!;
    if (t.height < 150) continue;
    for (const other of ps) {
      if (other === tall) continue;
      const o = plantById(other.plant)!;
      if (o.height < t.height / 2 && o.sun.length === 1 && o.sun[0] === 'full' && other.x === tall.x && other.y < tall.y && tall.y - other.y <= 3) {
        out.push({ id: `shade-${tall.id}-${other.id}`, level: 'warn', message: `${t.name} (${t.height} cm) is just south of ${o.name} and will shade it. Put tall crops on the north side.`, cells: [tall, other] });
      }
    }
  }
  // Merge repeats of the same finding (e.g. four tomato–basil pairs) into one entry.
  const merged = new Map<string, Issue & { n: number }>();
  for (const i of out) {
    const m = merged.get(i.message);
    if (m) { m.n++; m.cells.push(...i.cells); } else merged.set(i.message, { ...i, cells: [...i.cells], n: 1 });
  }
  const order = { error: 0, warn: 1, good: 2 };
  return [...merged.values()]
    .map(({ n, ...i }) => (n > 1 ? { ...i, message: `${i.message} (${n} pairs)` } : i))
    .sort((a, b) => order[a.level] - order[b.level]);
}

export function shoppingList(g: Garden): { plant: Plant; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of g.plantings) counts.set(p.plant, (counts.get(p.plant) ?? 0) + 1);
  return [...counts].map(([id, count]) => ({ plant: plantById(id)!, count })).sort((a, b) => b.count - a.count || a.plant.name.localeCompare(b.plant.name));
}
export const bedAreaM2 = (b: Bed) => Math.round(b.w * b.h * (CELL_CM / 100) ** 2 * 100) / 100;
export function sunShare(g: Garden, b: Bed): Record<Sun, number> {
  const c: Record<Sun, number> = { full: 0, part: 0, shade: 0 };
  for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) c[sunAt(g, x, y)]++;
  return c;
}
