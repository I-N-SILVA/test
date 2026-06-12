// Client-side share-card renderer. Draws the run summary to a canvas and
// returns a PNG Blob — no dependencies, no DOM capture, works offline.
//
// We deliberately avoid emoji flags (they render as letters on some platforms)
// and custom web fonts (not guaranteed loaded in the canvas), keeping the card
// crisp and identical everywhere.

import type { Formation, Player } from './types';

const W = 1080;
const H = 1350;
const M = 72; // page margin

const FLAME_1 = '#FFA132';
const FLAME_2 = '#FF4D00';
const INK = '#050505';
const HAIRLINE = 'rgba(255,255,255,0.14)';
const MUTE = 'rgba(255,255,255,0.55)';

export interface ShareCardData {
    headline: string;
    subline: string;
    formation: Formation;
    squad: Record<string, Player>;
    showRatings: boolean;
    stars: number;
    accent: boolean; // flame treatment for champion / perfect runs
    stats: { label: string; value: string }[];
    seedLabel: string; // e.g. daily date, shared-seed text, or ''
}

const DISPLAY = '800 {px}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
const SANS = '{w} {px}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
const MONO = '{w} {px}px ui-monospace, SFMono-Regular, Menlo, monospace';
const SERIF = 'italic {px}px Georgia, "Times New Roman", serif';

const sans = (px: number, w = 600) => SANS.replace('{w}', String(w)).replace('{px}', String(px));
const mono = (px: number, w = 500) => MONO.replace('{w}', String(w)).replace('{px}', String(px));
const display = (px: number) => DISPLAY.replace('{px}', String(px));
const serif = (px: number) => SERIF.replace('{px}', String(px));

function drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    outer: number,
    inner: number,
    fill: string,
) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
}

function drawStars(ctx: CanvasRenderingContext2D, x: number, cy: number, count: number) {
    const outer = 20;
    const gap = 14;
    const step = outer * 2 + gap;
    for (let i = 0; i < 5; i++) {
        drawStar(
            ctx,
            x + outer + i * step,
            cy,
            outer,
            outer * 0.42,
            i < count ? FLAME_1 : 'rgba(255,255,255,0.16)',
        );
    }
}

function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

/** Shrink text until it fits maxWidth, then ellipsize if still too long. */
function fitText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    makeFont: (px: number) => string,
    startPx: number,
    minPx: number,
): { text: string; px: number } {
    let px = startPx;
    while (px > minPx) {
        ctx.font = makeFont(px);
        if (ctx.measureText(text).width <= maxWidth) return { text, px };
        px -= 2;
    }
    ctx.font = makeFont(minPx);
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
    return { text: t.length < text.length ? t + '…' : t, px: minPx };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function drawWordmark(ctx: CanvasRenderingContext2D, x: number, y: number, px: number) {
    ctx.textAlign = 'left';
    ctx.font = sans(px, 700);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('perfect', x, y);
    const w1 = ctx.measureText('perfect').width;
    ctx.fillStyle = FLAME_2;
    ctx.fillText('.', x + w1, y);
    const w2 = ctx.measureText('perfect.').width;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('run', x + w2, y);
}

function drawPitch(ctx: CanvasRenderingContext2D, data: ShareCardData, top: number, height: number) {
    const pw = 564;
    const px = (W - pw) / 2;
    const py = top;
    const ph = height;

    // Surface with a faint vertical gradient (attacking third up top).
    const surf = ctx.createLinearGradient(0, py, 0, py + ph);
    surf.addColorStop(0, '#0e0e0e');
    surf.addColorStop(1, '#070707');
    ctx.fillStyle = surf;
    roundRect(ctx, px, py, pw, ph, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 2;
    roundRect(ctx, px, py, pw, ph, 20);
    ctx.stroke();

    // Markings.
    ctx.strokeStyle = HAIRLINE;
    ctx.lineWidth = 2;
    const inset = 20;
    roundRect(ctx, px + inset, py + inset, pw - inset * 2, ph - inset * 2, 8);
    ctx.stroke();
    // halfway line + centre circle + spot
    ctx.beginPath();
    ctx.moveTo(px + inset, py + ph / 2);
    ctx.lineTo(px + pw - inset, py + ph / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px + pw / 2, py + ph / 2, 56, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px + pw / 2, py + ph / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = HAIRLINE;
    ctx.fill();
    // penalty + 6-yard boxes top and bottom, with arcs
    const boxW = 250;
    const boxH = 92;
    const smallW = 120;
    const smallH = 38;
    const cx = px + pw / 2;
    // top (attack)
    ctx.strokeRect(cx - boxW / 2, py + inset, boxW, boxH);
    ctx.strokeRect(cx - smallW / 2, py + inset, smallW, smallH);
    ctx.beginPath();
    ctx.arc(cx, py + inset + boxH, 36, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    // bottom (own goal)
    ctx.strokeRect(cx - boxW / 2, py + ph - inset - boxH, boxW, boxH);
    ctx.strokeRect(cx - smallW / 2, py + ph - inset - smallH, smallW, smallH);
    ctx.beginPath();
    ctx.arc(cx, py + ph - inset - boxH, 36, 1.15 * Math.PI, 1.85 * Math.PI);
    ctx.stroke();

    // Formation chip.
    ctx.font = mono(20, 600);
    const chip = data.formation.name;
    const chipW = ctx.measureText(chip).width + 28;
    ctx.fillStyle = 'rgba(255,77,0,0.16)';
    roundRect(ctx, px + inset + 6, py + inset + 6, chipW, 36, 18);
    ctx.fill();
    ctx.fillStyle = FLAME_1;
    ctx.textAlign = 'center';
    ctx.fillText(chip, px + inset + 6 + chipW / 2, py + inset + 30);

    // Players.
    for (const slot of data.formation.slots) {
        const player = data.squad[slot.id];
        if (!player) continue;
        const nx = px + (slot.x / 100) * pw;
        const ny = py + ph - (slot.y / 100) * ph; // y: 0 = own goal (bottom)

        // glow + node
        const glow = ctx.createRadialGradient(nx, ny, 2, nx, ny, 30);
        glow.addColorStop(0, 'rgba(255,77,0,0.45)');
        glow.addColorStop(1, 'rgba(255,77,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(nx, ny, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(nx, ny, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#120907';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = FLAME_2;
        ctx.stroke();
        // rating inside node
        if (data.showRatings) {
            ctx.font = mono(18, 700);
            ctx.fillStyle = FLAME_1;
            ctx.textAlign = 'center';
            ctx.fillText(String(player.overall_rating), nx, ny + 6);
        }

        // surname pill below
        const surname = player.name.split(' ').slice(-1)[0];
        ctx.font = sans(22, 600);
        const tw = Math.min(ctx.measureText(surname).width, 150);
        const pillW = tw + 22;
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        roundRect(ctx, nx - pillW / 2, ny + 30, pillW, 32, 8);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        const fitted = fitText(ctx, surname, 150, (p) => sans(p, 600), 22, 15);
        ctx.font = sans(fitted.px, 600);
        ctx.fillText(fitted.text, nx, ny + 52);
    }
}

function drawStats(ctx: CanvasRenderingContext2D, stats: ShareCardData['stats'], top: number) {
    const h = 116;
    const total = W - M * 2;
    const cellW = total / stats.length;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    roundRect(ctx, M, top, total, h, 14);
    ctx.fill();
    ctx.strokeStyle = HAIRLINE;
    ctx.lineWidth = 1;
    roundRect(ctx, M, top, total, h, 14);
    ctx.stroke();

    stats.forEach((s, i) => {
        const x = M + i * cellW;
        if (i > 0) {
            ctx.strokeStyle = HAIRLINE;
            ctx.beginPath();
            ctx.moveTo(x, top + 22);
            ctx.lineTo(x, top + h - 22);
            ctx.stroke();
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = MUTE;
        ctx.font = mono(20, 500);
        ctx.fillText(s.label.toUpperCase(), x + cellW / 2, top + 44);
        const fitted = fitText(ctx, s.value, cellW - 28, (p) => sans(p, 700), 40, 20);
        ctx.font = sans(fitted.px, 700);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(fitted.text, x + cellW / 2, top + 90);
    });
}

/** Canvas dimensions, exported for headless rendering/preview. */
export const SHARE_CARD_SIZE = { width: W, height: H };

/** Pure drawing routine — works with any 2D context (browser or headless). */
export function drawShareCard(ctx: CanvasRenderingContext2D, data: ShareCardData): void {
    // Background + top glow.
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, -120, 60, W / 2, -120, 760);
    glow.addColorStop(0, 'rgba(255,77,0,0.22)');
    glow.addColorStop(1, 'rgba(255,77,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, 520);

    // Flame accent bar.
    const bar = ctx.createLinearGradient(0, 0, W, 0);
    bar.addColorStop(0, FLAME_1);
    bar.addColorStop(1, FLAME_2);
    ctx.fillStyle = bar;
    ctx.fillRect(0, 0, W, 10);

    // Eyebrow row: wordmark + seed tag.
    drawWordmark(ctx, M, 104, 30);
    if (data.seedLabel) {
        ctx.textAlign = 'right';
        ctx.fillStyle = MUTE;
        ctx.font = mono(22, 500);
        ctx.fillText(data.seedLabel.toUpperCase(), W - M, 104);
    }

    // Headline (wrap to two lines).
    ctx.textAlign = 'left';
    ctx.font = display(88);
    const lines = wrap(ctx, data.headline.toUpperCase(), W - M * 2).slice(0, 2);
    let y = 196;
    for (const line of lines) {
        if (data.accent) {
            const w = ctx.measureText(line).width;
            const g = ctx.createLinearGradient(M, 0, M + w, 0);
            g.addColorStop(0, FLAME_1);
            g.addColorStop(1, FLAME_2);
            ctx.fillStyle = g;
        } else {
            ctx.fillStyle = '#ffffff';
        }
        ctx.fillText(line, M, y);
        y += 92;
    }

    // Subline.
    if (data.subline) {
        ctx.fillStyle = 'rgba(255,255,255,0.62)';
        ctx.font = serif(30);
        const subLines = wrap(ctx, data.subline, W - M * 2).slice(0, 2);
        for (const s of subLines) {
            ctx.fillText(s, M, y - 8);
            y += 40;
        }
        y += 4;
    }

    // Stars.
    drawStars(ctx, M, y + 14, data.stars);

    // Pitch + stats.
    drawPitch(ctx, data, 470, 590);
    drawStats(ctx, data.stats, 1086);

    // Footer.
    ctx.strokeStyle = HAIRLINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(M, 1248);
    ctx.lineTo(W - M, 1248);
    ctx.stroke();

    drawWordmark(ctx, M, 1296, 26);
    ctx.textAlign = 'left';
    ctx.fillStyle = FLAME_1;
    ctx.font = sans(22, 600);
    ctx.fillText('Can you go 48-0?', M, 1326);

    ctx.textAlign = 'right';
    ctx.fillStyle = MUTE;
    ctx.font = mono(20, 500);
    ctx.fillText('BUILT BY THE PLYAZ TEAM', W - M, 1296);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = mono(18, 500);
    ctx.fillText('test-mauve-three-70.vercel.app', W - M, 1324);
}

/** Render the run card. Returns a PNG Blob, or null if canvas is unavailable. */
export async function renderShareCard(data: ShareCardData): Promise<Blob | null> {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    drawShareCard(ctx, data);
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}
