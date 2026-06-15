'use client';

// Dependency-free confetti burst for the big moments (champion / Perfect Run).
// Draws to a throwaway full-screen canvas and cleans itself up. Skipped entirely
// when the user prefers reduced motion.

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    rot: number;
    vrot: number;
    color: string;
}

const COLORS = ['#FFA132', '#FF4D00', '#E62E00', '#FFD9B3', '#FFFFFF'];

export function burstConfetti(durationMs = 2600): void {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
        position: 'fixed',
        inset: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '100',
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        canvas.remove();
        return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const resize = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Scale particle count to screen size — fewer on phones.
    const count = Math.round(Math.min(180, Math.max(70, w / 6)));
    const particles: Particle[] = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: -20 - Math.random() * h * 0.5,
        vx: (Math.random() - 0.5) * 2.4,
        vy: 2 + Math.random() * 3.5,
        size: 5 + Math.random() * 7,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
        const elapsed = now - start;
        const fade = Math.max(0, 1 - Math.max(0, elapsed - (durationMs - 600)) / 600);
        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = fade;
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // gravity
            p.rot += p.vrot;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        }
        if (elapsed < durationMs) {
            raf = requestAnimationFrame(frame);
        } else {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(raf);
            canvas.remove();
        }
    };
    raf = requestAnimationFrame(frame);
}
