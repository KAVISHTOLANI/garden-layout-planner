import { useMemo, useRef, useState, type ReactNode } from 'react';
import { DemoTag, EmptyState, Field, Landing, NotFound, Notice, PageHead, Shell, uid, usePersistentState, useRoute } from './shared/ui';
import {
  CELL_CM, PLANTS, SUN_LABEL, addBed, bedAreaM2, bedAt, checkGarden, emptyGarden, gridSize, paintSun, placePlant, plantById, plantingAt, rectFrom, removeBed, removePlanting, resizeGarden, shoppingList, sunAt, sunShare,
  type Garden, type Issue, type Plant, type Sun,
} from './lib/garden';

const KEY = 'bedmap:store';
const NAV = [
  { to: '/', label: 'Overview' },
  { to: '/plan', label: 'Plan' },
  { to: '/plants', label: 'Plants' },
  { to: '/list', label: 'Plant list' },
];

type Tool = 'select' | 'bed' | 'sun' | 'plant' | 'erase';
interface Store { garden: Garden; widthM: number; depthM: number; tool: Tool; brush: Sun; plant: string; demo: boolean }

function demoGarden(): Garden {
  const { cols, rows } = gridSize(6, 4);
  let g = emptyGarden(cols, rows);
  for (let x = 0; x < cols; x++) { g = paintSun(g, x, 0, 'shade'); g = paintSun(g, x, 1, 'part'); g = paintSun(g, x, 2, 'part'); }
  for (let y = 3; y < rows; y++) for (let x = 17; x < cols; x++) g = paintSun(g, x, y, 'part');
  g = addBed(g, { x: 1, y: 4, w: 8, h: 3 }, 'bed-1', 'Tomato bed').garden;
  g = addBed(g, { x: 11, y: 4, w: 7, h: 3 }, 'bed-2', 'Veg bed').garden;
  g = addBed(g, { x: 1, y: 9, w: 6, h: 2 }, 'bed-3', 'Herbs').garden;
  const put: [string, number, number][] = [
    ['tomato', 2, 4], ['tomato', 4, 4], ['tomato', 6, 4], ['basil', 3, 6], ['basil', 5, 6], ['marigold', 7, 6], ['marigold', 1, 6],
    ['bean', 12, 4], ['bean', 13, 4], ['onion', 14, 4], ['carrot', 12, 6], ['carrot', 13, 6], ['lettuce', 15, 6], ['squash', 16, 5],
    ['parsley', 2, 10], ['mint', 5, 9], ['strawberry', 3, 9],
  ];
  for (const [p, x, y] of put) g = placePlant(g, p, x, y, `d-${p}-${x}-${y}`).garden;
  return g;
}
const DEFAULTS = (): Store => ({ garden: demoGarden(), widthM: 6, depthM: 4, tool: 'plant', brush: 'shade', plant: 'lettuce', demo: true });

export default function App() {
  const [route] = useRoute();
  const [store, setStore] = usePersistentState<Store>(KEY, DEFAULTS);
  const ctx = { store, setStore };
  let page: ReactNode;
  if (route === '/') page = <Home />;
  else if (route === '/plan') page = <PlanPage {...ctx} />;
  else if (route === '/plants') page = <PlantsPage {...ctx} />;
  else if (route === '/list') page = <ListPage {...ctx} />;
  else page = <NotFound />;
  return (
    <Shell name="Bedmap" wordmark={['Bed', 'map']} nav={NAV} route={route} cta={{ to: '/plan', label: 'Open the planner' }} footerNote="Spacing and companion notes are rules of thumb from common gardening guides. Your soil, climate and varieties matter more.">
      {page}
    </Shell>
  );
}

type Ctx = { store: Store; setStore: (s: Store | ((s: Store) => Store)) => void };

/* ---------- Map ---------- */
const PX = 28;
const SUN_FILL: Record<Sun, string> = { full: 'var(--sun-full)', part: 'var(--sun-part)', shade: 'var(--sun-shade)' };

interface MapProps { g: Garden; highlight?: { x: number; y: number }[]; cursor?: { x: number; y: number } | null; preview?: { x: number; y: number; w: number; h: number } | null; small?: boolean }
function GardenMap({ g, highlight = [], cursor, preview, small }: MapProps) {
  const hi = new Set(highlight.map((c) => `${c.x},${c.y}`));
  return (
    <>
      <g aria-hidden="true">
        {g.sun.map((row, y) => [...row].map((_, x) => <rect key={`${x}-${y}`} x={x * PX} y={y * PX} width={PX} height={PX} fill={SUN_FILL[sunAt(g, x, y)]} className="cell" />))}
      </g>
      {g.beds.map((b) => (
        <g key={b.id} className="bed">
          <rect x={b.x * PX + 1} y={b.y * PX + 1} width={b.w * PX - 2} height={b.h * PX - 2} rx={4} />
          {!small && <text x={b.x * PX + 6} y={b.y * PX - 5} className="bed-label">{b.name}</text>}
        </g>
      ))}
      {g.plantings.map((p) => {
        const info = plantById(p.plant)!;
        const r = (info.spacing / CELL_CM) * PX / 2;
        return (
          <g key={p.id} className={`plant ${hi.has(`${p.x},${p.y}`) ? 'hi' : ''}`} transform={`translate(${p.x * PX + PX / 2} ${p.y * PX + PX / 2})`}>
            <circle r={Math.max(r, 6)} className="spread" style={{ fill: info.color, stroke: info.color }} />
            <circle r={10} style={{ fill: info.color }} className="dot" />
            <text y={4} className="code">{info.code}</text>
          </g>
        );
      })}
      {preview && <rect className="preview" x={preview.x * PX} y={preview.y * PX} width={preview.w * PX} height={preview.h * PX} />}
      {cursor && <rect className="cursor" x={cursor.x * PX + 1} y={cursor.y * PX + 1} width={PX - 2} height={PX - 2} />}
    </>
  );
}

/* ---------- Home ---------- */
function HeroPreview() {
  const g = useMemo(demoGarden, []);
  return (
    <div className="hero-bm">
      <svg viewBox={`0 0 ${g.cols * PX} ${g.rows * PX}`} className="map" role="img" aria-label="Demo garden plan with three beds"><GardenMap g={g} small highlight={[{ x: 15, y: 6 }, { x: 16, y: 5 }]} /></svg>
      <div className="hero-issues">
        <span className="badge badge-err">Squash crowds lettuce</span>
        <span className="badge badge-warn">Onion beside beans</span>
        <span className="badge badge-ok">Basil helps tomatoes</span>
      </div>
    </div>
  );
}

function Home() {
  return (
    <Landing
      eyebrow="Garden layout planner"
      title={<>Plan the plot <em>before you dig.</em></>}
      lead="Sketch your garden on a 30 cm grid, mark where the sun falls, draw beds and drop in plants. Bedmap checks spacing, sun needs and neighbours as you go, then gives you a plant list."
      primary={{ href: '#/plan', label: 'Open the planner' }}
      secondary={{ href: '#/plants', label: 'Browse plants' }}
      previewLabel="Demo garden — 6 × 4 m"
      preview={<HeroPreview />}
      meta={['Runs in your browser', 'Mouse, touch or keyboard', 'Demo garden included']}
      steps={[
        { title: 'Map the light', body: 'Paint full sun, part shade and shade — north is at the top.' },
        { title: 'Draw beds', body: 'Drag out rectangles; beds can’t overlap, so paths stay clear.' },
        { title: 'Plant and check', body: 'Place 22 common crops, herbs and flowers and see problems instantly.' },
      ]}
      features={[
        { title: 'Spacing', body: 'Each plant’s spread is drawn to scale; crowded pairs are flagged with the distance they need.' },
        { title: 'Sun', body: 'Tomatoes in shade or foxgloves in full sun get a warning.' },
        { title: 'Neighbours', body: 'Good companions and poor neighbours within 90 cm, plus tall crops shading sun-lovers.' },
        { title: 'Plant list', body: 'Counts per plant with spacing and growing notes, ready to print.' },
      ]}
      closing={{ title: <>Right plant, <em>right place.</em></>, action: { href: '#/plan', label: 'Start planning' } }}
    />
  );
}

/* ---------- Plan ---------- */
const TOOLS: [Tool, string, string][] = [
  ['select', 'Inspect', 'Click a cell to see what’s there.'],
  ['sun', 'Paint sun', 'Drag across cells to set how much sun they get.'],
  ['bed', 'Draw bed', 'Drag a rectangle. With the keyboard, press Enter at two corners.'],
  ['plant', 'Place plant', 'Click a cell inside a bed.'],
  ['erase', 'Erase', 'Removes a plant, or a bed (and its plants) if the cell has no plant.'],
];

function PlanPage({ store, setStore }: Ctx) {
  const g = store.garden;
  const svg = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [focused, setFocused] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'info' | 'error' | 'success'; text: string } | null>(null);
  const [picked, setPicked] = useState<Issue | null>(null);
  const [size, setSize] = useState({ w: String(store.widthM), d: String(store.depthM) });
  const [sizeErr, setSizeErr] = useState<string | null>(null);
  const issues = useMemo(() => checkGarden(g), [g]);
  const set = (patch: Partial<Store>) => setStore((s) => ({ ...s, ...patch }));
  const setGarden = (garden: Garden) => setStore((s) => ({ ...s, garden }));

  function describe(x: number, y: number) {
    const b = bedAt(g, x, y), p = plantingAt(g, x, y);
    return `Column ${x + 1}, row ${y + 1}: ${SUN_LABEL[sunAt(g, x, y)].split(' (')[0]}${b ? `, in ${b.name}` : ''}${p ? `, ${plantById(p.plant)!.name}` : ''}.`;
  }
  function apply(x: number, y: number, phase: 'down' | 'move' | 'up' | 'key') {
    const t = store.tool;
    if (t === 'select') { if (phase !== 'move') setMsg({ kind: 'info', text: describe(x, y) }); return; }
    if (t === 'sun') { setGarden(paintSun(g, x, y, store.brush)); return; }
    if (t === 'bed') {
      if (phase === 'down' || (phase === 'key' && !anchor)) { setAnchor({ x, y }); setHover({ x, y }); if (phase === 'key') setMsg({ kind: 'info', text: `Corner set at column ${x + 1}, row ${y + 1}. Move to the opposite corner and press Enter.` }); return; }
      if (phase === 'move') { setHover({ x, y }); return; }
      if (anchor) {
        const r = addBed(g, rectFrom(anchor, { x, y }), uid('bed'));
        setAnchor(null); setHover(null);
        if (r.error) setMsg({ kind: 'error', text: r.error });
        else { setGarden(r.garden); const b = r.garden.beds[r.garden.beds.length - 1]; setMsg({ kind: 'success', text: `${b.name} added: ${(b.w * CELL_CM) / 100} × ${(b.h * CELL_CM) / 100} m.` }); }
      }
      return;
    }
    if (phase === 'move' || phase === 'up') return;
    if (t === 'plant') {
      const r = placePlant(g, store.plant, x, y, uid('p'));
      if (r.error) setMsg({ kind: 'error', text: r.error });
      else { setGarden(r.garden); setMsg({ kind: 'success', text: `${plantById(store.plant)!.name} planted at column ${x + 1}, row ${y + 1}.` }); }
      return;
    }
    if (t === 'erase') {
      const p = plantingAt(g, x, y);
      if (p) { setGarden(removePlanting(g, p.id)); setMsg({ kind: 'success', text: `${plantById(p.plant)!.name} removed.` }); return; }
      const b = bedAt(g, x, y);
      if (b) {
        const n = g.plantings.filter((q) => q.x >= b.x && q.x < b.x + b.w && q.y >= b.y && q.y < b.y + b.h).length;
        if (n && !window.confirm(`Remove ${b.name} and its ${n} plant${n === 1 ? '' : 's'}?`)) return;
        setGarden(removeBed(g, b.id)); setMsg({ kind: 'success', text: `${b.name} removed.` });
      } else setMsg({ kind: 'info', text: 'Nothing to erase here.' });
    }
  }
  function cellFrom(e: React.PointerEvent) {
    const r = svg.current!.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * g.cols), y = Math.floor(((e.clientY - r.top) / r.height) * g.rows);
    return { x: Math.max(0, Math.min(g.cols - 1, x)), y: Math.max(0, Math.min(g.rows - 1, y)) };
  }
  function onKey(e: React.KeyboardEvent) {
    const d: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (d[e.key]) {
      e.preventDefault();
      const c = { x: Math.max(0, Math.min(g.cols - 1, cursor.x + d[e.key][0])), y: Math.max(0, Math.min(g.rows - 1, cursor.y + d[e.key][1])) };
      setCursor(c);
      if (anchor) setHover(c);
      if (store.tool === 'sun' && e.shiftKey) setGarden(paintSun(g, c.x, c.y, store.brush));
      setMsg({ kind: 'info', text: describe(c.x, c.y) });
    } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apply(cursor.x, cursor.y, 'key'); }
    else if (e.key === 'Escape' && anchor) { setAnchor(null); setHover(null); setMsg({ kind: 'info', text: 'Bed cancelled.' }); }
  }
  function resize(e: React.FormEvent) {
    e.preventDefault();
    const w = Number(size.w), d = Number(size.d);
    if (!(w >= 1 && w <= 20 && d >= 1 && d <= 20)) return setSizeErr('Width and depth must be between 1 and 20 metres.');
    const { cols, rows } = gridSize(w, d);
    const r = resizeGarden(g, cols, rows);
    if (r.dropped && !window.confirm(`Resizing removes ${r.dropped} bed${r.dropped === 1 ? '' : 's'} or plant${r.dropped === 1 ? '' : 's'} that won’t fit. Continue?`)) return;
    setSizeErr(null);
    setStore((s) => ({ ...s, garden: r.garden, widthM: w, depthM: d }));
    setMsg({ kind: 'success', text: `Garden resized to ${w} × ${d} m.` });
  }
  const preview = anchor && hover ? rectFrom(anchor, hover) : null;
  const errors = issues.filter((i) => i.level === 'error').length, warns = issues.filter((i) => i.level === 'warn').length;
  const tool = TOOLS.find((t) => t[0] === store.tool)!;

  return (
    <div className="stack">
      <PageHead eyebrow="Plan" title={<>Your <em>{store.widthM} × {store.depthM} m</em> plot.</>} description="North is at the top. One square is 30 cm." actions={store.demo ? <button type="button" className="btn btn-ghost" onClick={() => { const { cols, rows } = gridSize(store.widthM, store.depthM); setStore((s) => ({ ...s, garden: emptyGarden(cols, rows), demo: false })); setMsg({ kind: 'success', text: 'Demo garden cleared.' }); }}>Clear demo garden</button> : <button type="button" className="btn btn-ghost" onClick={() => setStore((s) => ({ ...s, garden: demoGarden(), widthM: 6, depthM: 4, demo: true }))}>Load demo garden</button>} />
      {store.demo && <p><DemoTag /> <span className="small muted">A sample layout with a few deliberate problems.</span></p>}
      <div className="plan-layout">
        <div className="stack">
          <div className="card toolbar">
            <div className="tabs" role="radiogroup" aria-label="Tool">
              {TOOLS.map(([id, label]) => <button key={id} type="button" role="radio" aria-checked={store.tool === id} onClick={() => { set({ tool: id }); setAnchor(null); setHover(null); }}>{label}</button>)}
            </div>
            {store.tool === 'sun' && (
              <div className="tabs" role="radiogroup" aria-label="Sun brush">
                {(['full', 'part', 'shade'] as Sun[]).map((s) => <button key={s} type="button" role="radio" aria-checked={store.brush === s} onClick={() => set({ brush: s })}><i className="sw" style={{ background: SUN_FILL[s] }} />{SUN_LABEL[s].split(' (')[0]}</button>)}
              </div>
            )}
            {store.tool === 'plant' && (
              <Field label="Plant">{(p) => <select {...p} value={store.plant} onChange={(e) => set({ plant: e.target.value })}>{PLANTS.map((pl) => <option key={pl.id} value={pl.id}>{pl.name} — {pl.spacing} cm</option>)}</select>}</Field>
            )}
            <p className="small muted tool-hint">{tool[2]}</p>
          </div>
          <div className="map-wrap card">
            <span className="north" aria-hidden="true">N ↑</span>
            <svg
              ref={svg}
              className={`map tool-${store.tool}`}
              viewBox={`0 0 ${g.cols * PX} ${g.rows * PX}`}
              style={{ width: g.cols * PX, maxWidth: '100%' }}
              tabIndex={0}
              role="application"
              aria-label={`Garden grid, ${g.cols} by ${g.rows} squares. Tool: ${tool[1]}. Arrow keys move, Enter applies${store.tool === 'sun' ? ', Shift with arrows paints' : ''}.`}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={onKey}
              onPointerDown={(e) => { svg.current?.setPointerCapture?.(e.pointerId); const c = cellFrom(e); setCursor(c); setDragging(true); apply(c.x, c.y, 'down'); }}
              onPointerMove={(e) => { if (!dragging) return; const c = cellFrom(e); if (c.x === cursor.x && c.y === cursor.y && store.tool !== 'bed') return; setCursor(c); apply(c.x, c.y, 'move'); }}
              onPointerUp={(e) => { if (!dragging) return; setDragging(false); const c = cellFrom(e); apply(c.x, c.y, 'up'); }}
            >
              <GardenMap g={g} highlight={picked?.cells} cursor={focused ? cursor : null} preview={preview} />
            </svg>
          </div>
          <p className="sr-only" aria-live="polite">{msg?.text}</p>
          {msg && <Notice kind={msg.kind} onDismiss={() => setMsg(null)}>{msg.text}</Notice>}
          <div className="legend small">
            {(['full', 'part', 'shade'] as Sun[]).map((s) => <span key={s}><i className="sw" style={{ background: SUN_FILL[s] }} />{SUN_LABEL[s]}</span>)}
            <span><i className="sw bed-sw" />Bed</span>
          </div>
        </div>

        <aside className="stack">
          <section className="card stack" aria-labelledby="chk-t">
            <div className="row-between"><h2 id="chk-t" className="h3">Checks</h2><span className="small" data-testid="check-summary">{errors} crowded · {warns} warning{warns === 1 ? '' : 's'}</span></div>
            {issues.length ? (
              <ul className="issues" aria-label="Layout checks">
                {issues.map((i) => (
                  <li key={i.id} className={picked?.id === i.id ? 'on' : ''}>
                    <span className={`badge ${i.level === 'error' ? 'badge-err' : i.level === 'warn' ? 'badge-warn' : 'badge-ok'}`}>{i.level === 'error' ? 'Crowded' : i.level === 'warn' ? 'Warning' : 'Good'}</span>
                    <span>{i.message}</span>
                    <button type="button" className="btn btn-sm btn-ghost" aria-pressed={picked?.id === i.id} onClick={() => setPicked(picked?.id === i.id ? null : i)}>{picked?.id === i.id ? 'Hide on map' : 'Show on map'}</button>
                  </li>
                ))}
              </ul>
            ) : <EmptyState title={g.plantings.length ? 'No problems found' : 'Nothing planted yet'}>{g.plantings.length ? 'Spacing, sun and neighbours all look fine.' : 'Draw a bed, then choose Place plant.'}</EmptyState>}
          </section>
          <section className="card stack" aria-labelledby="beds-t">
            <h2 id="beds-t" className="h3">Beds</h2>
            {g.beds.length ? (
              <ul className="beds">
                {g.beds.map((b) => {
                  const s = sunShare(g, b), n = b.w * b.h;
                  return (
                    <li key={b.id}>
                      <Field label="Name">{(p) => <input {...p} value={b.name} maxLength={30} onChange={(e) => setGarden({ ...g, beds: g.beds.map((x) => (x.id === b.id ? { ...x, name: e.target.value } : x)) })} />}</Field>
                      <span className="small muted">{(b.w * CELL_CM) / 100} × {(b.h * CELL_CM) / 100} m · {bedAreaM2(b)} m² · {Math.round((s.full / n) * 100)}% full sun</span>
                      <span className="sunbar" aria-hidden="true">{(['full', 'part', 'shade'] as Sun[]).map((k) => <i key={k} style={{ flexGrow: s[k], background: SUN_FILL[k] }} />)}</span>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="small muted">No beds yet. Choose Draw bed and drag on the grid.</p>}
          </section>
          <form className="card stack" onSubmit={resize} noValidate aria-labelledby="size-t">
            <h2 id="size-t" className="h3">Garden size</h2>
            <div className="form-grid two">
              <Field label="Width (m)" error={sizeErr}>{(p) => <input {...p} inputMode="decimal" value={size.w} onChange={(e) => setSize({ ...size, w: e.target.value })} />}</Field>
              <Field label="Depth (m)">{(p) => <input {...p} inputMode="decimal" value={size.d} onChange={(e) => setSize({ ...size, d: e.target.value })} />}</Field>
            </div>
            <div><button type="submit" className="btn btn-sm">Resize</button></div>
          </form>
        </aside>
      </div>
    </div>
  );
}

/* ---------- Plants ---------- */
function PlantsPage({ setStore }: Ctx) {
  const [sun, setSun] = useState<Sun | 'any'>('any');
  const [group, setGroup] = useState<Plant['group'] | 'any'>('any');
  const list = PLANTS.filter((p) => (sun === 'any' || p.sun.includes(sun)) && (group === 'any' || p.group === group));
  const name = (id: string) => plantById(id)!.name;
  return (
    <div className="stack">
      <PageHead eyebrow="Plants" title={<>{PLANTS.length} plants, <em>and who they like.</em></>} description="Spacing is the distance between plants; companions and poor neighbours count within 90 cm." />
      <div className="card filters">
        <Field label="Sun">{(p) => <select {...p} value={sun} onChange={(e) => setSun(e.target.value as Sun | 'any')}><option value="any">Any</option>{(['full', 'part', 'shade'] as Sun[]).map((s) => <option key={s} value={s}>{SUN_LABEL[s]}</option>)}</select>}</Field>
        <Field label="Type">{(p) => <select {...p} value={group} onChange={(e) => setGroup(e.target.value as Plant['group'] | 'any')}><option value="any">Any</option>{['Vegetable', 'Herb', 'Fruit', 'Flower'].map((g) => <option key={g}>{g}</option>)}</select>}</Field>
        <span className="small muted" aria-live="polite">{list.length} shown</span>
      </div>
      {list.length ? (
        <div className="plant-grid">
          {list.map((p) => (
            <article key={p.id} className="card stack plant-card" aria-labelledby={`pl-${p.id}`}>
              <div className="row-gap"><span className="pcode" style={{ background: p.color }} aria-hidden="true">{p.code}</span><h2 id={`pl-${p.id}`} className="h3">{p.name}</h2></div>
              <dl className="facts">
                <div><dt>Spacing</dt><dd>{p.spacing} cm</dd></div>
                <div><dt>Height</dt><dd>{p.height} cm</dd></div>
                <div><dt>Sun</dt><dd>{p.sun.map((s) => SUN_LABEL[s].split(' (')[0]).join(', ')}</dd></div>
              </dl>
              {p.friends.length > 0 && <p className="small"><strong>Good with:</strong> {p.friends.map(name).join(', ')}</p>}
              {p.foes.length > 0 && <p className="small"><strong>Keep from:</strong> {p.foes.map(name).join(', ')}</p>}
              <p className="small muted">{p.note}</p>
              <div><button type="button" className="btn btn-sm" onClick={() => { setStore((s) => ({ ...s, plant: p.id, tool: 'plant' })); window.location.hash = '/plan'; }}>Plant {p.name.toLowerCase()}</button></div>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No plants match">Try another sun or type filter.</EmptyState>}
    </div>
  );
}

/* ---------- List ---------- */
function ListPage({ store }: Ctx) {
  const g = store.garden;
  const list = shoppingList(g);
  const issues = checkGarden(g);
  return (
    <div className="stack">
      <PageHead eyebrow="Plant list" title={<>What to <em>buy and sow.</em></>} description={`${g.plantings.length} plants in ${g.beds.length} beds · ${g.beds.reduce((s, b) => s + bedAreaM2(b), 0).toFixed(2)} m² of growing space`} actions={list.length ? <button type="button" className="btn" onClick={() => window.print()}>Print</button> : undefined} />
      {issues.some((i) => i.level !== 'good') && <Notice kind="warn">{issues.filter((i) => i.level === 'error').length} crowded pairs and {issues.filter((i) => i.level === 'warn').length} warnings on the plan. <a href="#/plan">Review them</a> before buying.</Notice>}
      {list.length ? (
        <div className="table-wrap card flush">
          <table className="table">
            <caption className="sr-only">Plants needed</caption>
            <thead><tr><th scope="col">Plant</th><th scope="col" className="num">Count</th><th scope="col" className="num">Spacing</th><th scope="col">Sun</th><th scope="col">Notes</th></tr></thead>
            <tbody>{list.map(({ plant, count }) => (
              <tr key={plant.id}>
                <th scope="row"><span className="pcode sm" style={{ background: plant.color }} aria-hidden="true">{plant.code}</span>{plant.name}</th>
                <td className="num" data-testid={`count-${plant.id}`}>{count}</td>
                <td className="num">{plant.spacing} cm</td>
                <td>{plant.sun.map((s) => SUN_LABEL[s].split(' (')[0]).join(', ')}</td>
                <td className="small">{plant.note}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <EmptyState title="Nothing planted yet" actions={<a className="btn btn-primary" href="#/plan">Open the planner</a>}>Plants you place on the plan are counted here.</EmptyState>}
    </div>
  );
}
