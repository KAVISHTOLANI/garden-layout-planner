import { describe, expect, it } from 'vitest';
import { PLANTS, addBed, bedAreaM2, checkGarden, crowded, emptyGarden, gridSize, paintSun, placePlant, rectFrom, removeBed, resizeGarden, shoppingList, sunAt, sunShare, type Garden } from './garden';

const withBed = (): Garden => addBed(emptyGarden(10, 8), { x: 1, y: 1, w: 6, h: 4 }, 'b1').garden;
const put = (g: Garden, plant: string, x: number, y: number, id = `${plant}${x}${y}`) => placePlant(g, plant, x, y, id).garden;

describe('grid and beds', () => {
  it('converts metres to 30 cm cells', () => {
    expect(gridSize(6, 4)).toEqual({ cols: 20, rows: 13 });
  });
  it('paints sun and keeps it through resizing', () => {
    let g = paintSun(emptyGarden(4, 3), 1, 0, 'shade');
    expect(sunAt(g, 1, 0)).toBe('shade');
    expect(paintSun(g, 9, 9, 'part')).toBe(g);
    g = resizeGarden(g, 6, 4).garden;
    expect(g.sun).toEqual(['fsffff', 'ffffff', 'ffffff', 'ffffff']);
  });
  it('validates beds', () => {
    const g = withBed();
    expect(rectFrom({ x: 5, y: 3 }, { x: 2, y: 1 })).toEqual({ x: 2, y: 1, w: 4, h: 3 });
    expect(addBed(g, { x: 5, y: 2, w: 3, h: 2 }, 'b2').error).toMatch(/overlap/);
    expect(addBed(g, { x: 8, y: 6, w: 3, h: 1 }, 'b2').error).toMatch(/inside/);
    expect(addBed(g, { x: 8, y: 6, w: 1, h: 1 }, 'b2').error).toMatch(/two cells/);
    expect(addBed(g, { x: 8, y: 1, w: 2, h: 5 }, 'b2').garden.beds).toHaveLength(2);
    expect(bedAreaM2(g.beds[0])).toBe(2.16);
  });
  it('places plants only inside beds on free cells, and removes them with their bed', () => {
    let g = withBed();
    expect(placePlant(g, 'tomato', 0, 0, 'p').error).toMatch(/beds/);
    g = put(g, 'tomato', 2, 2);
    expect(placePlant(g, 'basil', 2, 2, 'q').error).toMatch(/already/);
    expect(removeBed(g, 'b1').plantings).toHaveLength(0);
  });
  it('drops beds that no longer fit when shrinking', () => {
    const r = resizeGarden(put(withBed(), 'basil', 2, 2), 5, 5);
    expect(r.garden.beds).toHaveLength(0);
    expect(r.dropped).toBe(2);
  });
});

describe('checks', () => {
  it('flags crowding using average spacing', () => {
    const t = { id: 'a', plant: 'tomato', x: 2, y: 2 }, t2 = { id: 'b', plant: 'tomato', x: 3, y: 2 }, t3 = { id: 'c', plant: 'tomato', x: 4, y: 2 };
    expect(crowded(t, t2)).toBe(true);
    expect(crowded(t, t3)).toBe(false); // 60 cm apart
    expect(crowded({ id: 'a', plant: 'carrot', x: 1, y: 1 }, { id: 'b', plant: 'carrot', x: 2, y: 1 })).toBe(false);
  });
  it('reports sun, crowding, foes, friends and shading', () => {
    let g = paintSun(withBed(), 1, 1, 'shade');
    g = put(g, 'tomato', 1, 1, 't1');      // in shade
    g = put(g, 'tomato', 2, 1, 't2');      // crowded with t1
    g = put(g, 'onion', 5, 2, 'o1');
    g = put(g, 'bean', 6, 2, 'b1');        // foe of onion
    g = put(g, 'basil', 2, 3, 'ba');       // friend of tomato t2 (2 cells away)
    g = put(g, 'lettuce', 6, 4, 'le');
    const issues = checkGarden(g);
    const ids = issues.map((i) => i.id);
    expect(ids).toContain('sun-t1');
    expect(ids).toContain('space-t1-t2');
    expect(ids).toContain('foe-o1-b1');
    expect(issues.find((i) => i.id.startsWith('friend-'))!.message).toMatch(/Tomato and Basil are good companions/);
    expect(issues[0].level).toBe('error');
    g = put(g, 'pepper', 6, 1, 'pp');
    expect(checkGarden(g).map((i) => i.id)).toContain('shade-b1-pp');
  });
  it('has consistent plant data', () => {
    const ids = new Set(PLANTS.map((p) => p.id));
    expect(ids.size).toBe(PLANTS.length);
    for (const p of PLANTS) for (const f of [...p.friends, ...p.foes]) expect(ids.has(f), `${p.id}→${f}`).toBe(true);
  });
});

describe('summaries', () => {
  it('counts plants and sun per bed', () => {
    let g = withBed();
    g = put(g, 'basil', 2, 2); g = put(g, 'basil', 4, 2); g = put(g, 'tomato', 6, 4);
    expect(shoppingList(g).map((s) => [s.plant.id, s.count])).toEqual([['basil', 2], ['tomato', 1]]);
    expect(sunShare(paintSun(g, 1, 1, 'part'), g.beds[0])).toEqual({ full: 23, part: 1, shade: 0 });
  });
});
