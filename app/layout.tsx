import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Perfect Run | Draft World Cup Legends, Win All 8 Matches',
    description:
        'Spin the wheel, draft World Cup legends from 1930 to 2026, build your ultimate XI and chase the Perfect Run: 8 wins from 8 matches, nothing conceded.',
    openGraph: {
        title: 'Perfect Run | The World Cup Draft Game',
        description:
            'Draft World Cup legends. Win all 8 matches. Concede nothing. That is the Perfect Run.',
        type: 'website',
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
