// Client-side share-card renderer. Draws the run summary to a canvas and
// returns a PNG Blob — no dependencies, no DOM capture, works offline.
//
// We deliberately avoid emoji flags (they render as letters on some platforms)
// and custom web fonts (not guaranteed loaded in the canvas), keeping the card
// crisp and identical everywhere.

import type { Formation, Player } from './types';

const W = 1080;
const H = 1350;

const FLAME_1 = '#FFA132';
const FLAME_2 = '#FF4D00';
const INK = '#000000';
const HAIRLINE = 'rgba(255,255,255,0.16)';

export interface ShareCardData {
    headline: string;
    subline: string;
    formation: Formation;
    squad: Record<string, Player>;
    showRatings: boolean;
    stars: number;
    accent: boolean; // flame headline for champion / perfect runs
    stats: { label: string; value: string }[];
    seedLabel: string; // e.g. daily date, shared-seed text, or ''
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

function drawPitch(ctx: CanvasRenderingContext2D, data: ShareCardData) {
    const px = 90;
    const py = 470;
    const pw = W - px * 2;
    const ph = 560;

    // Surface + frame.
    ctx.fillStyle = '#0a0a0a';
    roundRect(ctx, px, py, pw, ph, 16);
    ctx.fill();
    ctx.strokeStyle = HAIRLINE;
    ctx.lineWidth = 2;
    roundRect(ctx, px + 12, py + 12, pw - 24, ph - 24, 8);
    ctx.stroke();

    // Halfway line + centre circle.
    ctx.beginPath();
    ctx.moveTo(px + 12, py + ph / 2);
    ctx.lineTo(px + pw - 12, py + ph / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px + pw / 2, py + ph / 2, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Penalty boxes (top = attack, bottom = own goal).
    const boxW = 240;
    const boxH = 90;
    ctx.strokeRect(px + pw / 2 - boxW / 2, py + 12, boxW, boxH);
    ctx.strokeRect(px + pw / 2 - boxW / 2, py + ph - 12 - boxH, boxW, boxH);

    for (const slot of data.formation.slots) {
        const player = data.squad[slot.id];
        if (!player) continue;
        const cx = px + (slot.x / 100) * pw;
        const cy = py + ph - (slot.y / 100) * ph; // y: 0 = own goal (bottom)

        // Node.
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,77,0,0.18)';
        ctx.fill();
        ctx.strokeStyle = FLAME_2;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Name pill below the node.
        const surname = player.name.split(' ').slice(-1)[0];
        const label = data.showRatings ? `${surname} ${player.overall_rating}` : surname;
        ctx.font = '600 22px ui-sans-serif, system-ui, sans-serif';
        const tw = ctx.measureText(label).width;
        const pillW = tw + 24;
        ctx.fillStyle = 'rgba(0,0,0,0.82)';
        roundRect(ctx, cx - pillW / 2, cy + 32, pillW, 34, 6);
        ctx.fill();
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(surname, cx - pillW / 2 + 12, cy + 55);
        if (data.showRatings) {
            const sw = ctx.measureText(surname + ' ').width;
            ctx.fillStyle = FLAME_1;
            ctx.fillText(String(player.overall_rating), cx - pillW / 2 + 12 + sw, cy + 55);
        }
    }
}

function drawStats(ctx: CanvasRenderingContext2D, stats: ShareCardData['stats']) {
    const top = 1070;
    const cellW = (W - 180) / stats.length;
    stats.forEach((s, i) => {
        const x = 90 + i * cellW;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '500 20px ui-monospace, monospace';
        ctx.fillText(s.label.toUpperCase(), x + cellW / 2, top);
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 38px ui-sans-serif, system-ui, sans-serif';
        ctx.fillText(s.value, x + cellW / 2, top + 48);
    });
}

/** Render the run card. Returns a PNG Blob, or null if canvas is unavailable. */
export async function renderShareCard(data: ShareCardData): Promise<Blob | null> {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background.
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, W, H);

    // Eyebrow.
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '600 26px ui-monospace, monospace';
    ctx.fillText('PERFECT', 90, 130);
    ctx.fillStyle = FLAME_2;
    const pw = ctx.measureText('PERFECT ').width;
    ctx.fillText('· RUN', 90 + pw, 130);

    // Headline (wrap to two lines if needed).
    ctx.fillStyle = data.accent ? FLAME_1 : '#ffffff';
    ctx.font = '800 84px ui-sans-serif, system-ui, sans-serif';
    const words = data.headline.toUpperCase().split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > W - 180 && line) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, 90, 230 + i * 92));

    // Subline.
    const subY = 230 + Math.min(lines.length, 2) * 92 + 6;
    ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ctx.font = 'italic 30px Georgia, serif';
    ctx.fillText(data.subline, 90, subY);

    // Stars.
    ctx.font = '40px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = FLAME_1;
    ctx.fillText('★'.repeat(data.stars), 90, subY + 56);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    const fw = ctx.measureText('★'.repeat(data.stars)).width;
    ctx.fillText('★'.repeat(5 - data.stars), 90 + fw, subY + 56);

    drawPitch(ctx, data);
    drawStats(ctx, data.stats);

    // Footer.
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 30px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('perfect.run', 90, H - 70);
    ctx.fillStyle = FLAME_1;
    ctx.font = '600 26px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('Can you go 48-0?', 90, H - 38);

    if (data.seedLabel) {
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '500 24px ui-monospace, monospace';
        ctx.fillText(`SEED ${data.seedLabel}`, W - 90, H - 50);
    }

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}
