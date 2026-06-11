import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: '48-0 — World Cup Draft Challenge',
    description:
        'Draft World Cup legends from 1930–2026, build your ultimate XI and simulate a full World Cup run. Can you go 48-0?',
    openGraph: {
        title: '48-0 — World Cup Draft Challenge',
        description: 'Draft World Cup legends. Win the whole thing.',
        type: 'website',
    },
};

export const viewport: Viewport = {
    themeColor: '#0A1F17',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen antialiased">{children}</body>
        </html>
    );
}
