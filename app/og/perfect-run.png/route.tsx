import { ImageResponse } from 'next/og';

// Branded 1200×630 social card, served at a stable URL (/og/perfect-run.png)
// so the homepage and the article unfurl with a proper preview on X, LinkedIn,
// WhatsApp, etc. Rendered with next/og (Satori) — no extra dependencies.

export const runtime = 'edge';

const SIZE = { width: 1200, height: 630 };
const FLAME_1 = '#FFA132';
const FLAME_2 = '#FF4D00';

export function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#000000',
                    color: '#ffffff',
                    padding: '72px',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* flame accent bar */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '10px',
                        backgroundImage: `linear-gradient(90deg, ${FLAME_1}, ${FLAME_2})`,
                    }}
                />

                {/* eyebrow */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 26,
                        letterSpacing: 4,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#ffffff' }}>PERFECT</span>
                        <span style={{ color: FLAME_2, marginLeft: 8 }}>· RUN</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20, marginRight: 16 }}>
                            BUILT BY THE PLYAZ TEAM
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="https://plyaz.net/_astro/logo.BgIjVXPl.png"
                            alt="PLYAZ"
                            width={153}
                            height={34}
                        />
                    </div>
                </div>

                {/* headline */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', fontSize: 132, fontWeight: 800, lineHeight: 1 }}>
                        <span style={{ color: '#ffffff' }}>Can you go&nbsp;</span>
                        <span style={{ color: FLAME_1 }}>48-0?</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            marginTop: 28,
                            fontSize: 38,
                            color: 'rgba(255,255,255,0.7)',
                            maxWidth: 980,
                        }}
                    >
                        Draft World Cup legends. Win all 8 matches. Concede nothing.
                    </div>
                </div>

                {/* stat strip */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 30,
                    }}
                >
                    <div style={{ display: 'flex', color: 'rgba(255,255,255,0.85)' }}>
                        54 nations&nbsp;·&nbsp;510+ players&nbsp;·&nbsp;1930–2026
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            color: '#000000',
                            backgroundImage: `linear-gradient(90deg, ${FLAME_1}, ${FLAME_2})`,
                            padding: '14px 28px',
                            borderRadius: 999,
                            fontWeight: 700,
                        }}
                    >
                        Spin the wheel →
                    </div>
                </div>
            </div>
        ),
        { ...SIZE },
    );
}
