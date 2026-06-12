import type { Metadata, Viewport } from 'next';
import './globals.css';

const OG_IMAGE = {
    url: '/og/perfect-run.png',
    width: 1200,
    height: 630,
    alt: 'Perfect Run — can you go 48-0? Draft World Cup legends and win all 8 matches.',
};

export const metadata: Metadata = {
    metadataBase: new URL('https://test-mauve-three-70.vercel.app'),
    title: 'Perfect Run | Draft World Cup Legends, Win All 8 Matches',
    description:
        'Spin the wheel, draft World Cup legends from 1930 to 2026, build your ultimate XI and chase the Perfect Run: 8 wins from 8 matches, nothing conceded.',
    openGraph: {
        title: 'Perfect Run | The World Cup Draft Game',
        description:
            'Draft World Cup legends. Win all 8 matches. Concede nothing. That is the Perfect Run.',
        type: 'website',
        siteName: 'Perfect Run',
        url: '/',
        images: [OG_IMAGE],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Can you go 48-0?',
        description:
            'Draft World Cup legends. Win all 8 matches. Concede nothing. That is the Perfect Run.',
        images: [OG_IMAGE.url],
    },
};

export const viewport: Viewport = {
    themeColor: '#FBFAF7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen antialiased">{children}</body>
        </html>
    );
}
