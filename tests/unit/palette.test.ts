import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Strażnik palety: w całym interfejsie wolno używać TYLKO 6 kolorów
 * (decyzja właściciela produktu). Dozwolona jest przezroczystość tych kolorów
 * i gradienty między nimi — ale żaden inny hex/rgb ani wbudowany kolor
 * Tailwinda (white, black, red-500…). Kolory nazywamy tokenami z globals.css.
 */
const PALETTE_HEX = ['06070a', '3d5afe', 'ff2fa3', 'ff8a1e', 'aeb6c2', 'f5f7ff'];
const PALETTE_RGB = ['6 7 10', '61 90 254', '255 47 163', '255 138 30', '174 182 194', '245 247 255'];

const ROOT = join(__dirname, '..', '..');
const SCAN_DIRS = ['app', 'components', 'lib'];
const EXT = /\.(tsx?|css)$/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (name === 'fonts' || name === 'node_modules') return [];
    if (statSync(full).isDirectory()) return files(full);
    return EXT.test(name) ? [full] : [];
  });
}

const sources = SCAN_DIRS.flatMap((d) => files(join(ROOT, d))).map((f) => ({
  file: relative(ROOT, f),
  // komentarze nie są kolorami
  text: readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1'),
}));

describe('paleta 6 kolorów', () => {
  it('każdy hex w kodzie należy do palety', () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      for (const m of text.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
        if (!PALETTE_HEX.includes(m[1].toLowerCase())) offenders.push(`${file}: #${m[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('każde rgb()/rgba() w kodzie to kolor palety (z dowolną przezroczystością)', () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      for (const m of text.matchAll(/rgba?\(\s*([\d]+)[\s,_]+([\d]+)[\s,_]+([\d]+)/g)) {
        const triplet = `${m[1]} ${m[2]} ${m[3]}`;
        if (!PALETTE_RGB.includes(triplet)) offenders.push(`${file}: rgb(${triplet})`);
      }
      // rgb(${zmienna}) w szablonach — dopuszczalne tylko z wartościami zdefiniowanymi w palecie
    }
    expect(offenders).toEqual([]);
  });

  it('brak wbudowanych kolorów Tailwinda (white, black, red-500 itd.)', () => {
    const builtins =
      /\b(?:bg|text|border|ring|shadow|from|to|via|fill|stroke|outline|decoration|caret|divide|placeholder)-(?:white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)\b/g;
    const offenders = sources.flatMap(({ file, text }) => [...text.matchAll(builtins)].map((m) => `${file}: ${m[0]}`));
    expect(offenders).toEqual([]);
  });

  it('brak nazwanych kolorów CSS poza transparent/currentColor', () => {
    const named = /(?:color|background|fill|stroke)\s*:\s*['"]?(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey)\b/gi;
    const offenders = sources.flatMap(({ file, text }) => [...text.matchAll(named)].map((m) => `${file}: ${m[0]}`));
    expect(offenders).toEqual([]);
  });
});
