import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Perfect Run — World Cup Draft Game',
        short_name: 'Perfect Run',
        description: 'Draft an all-time World Cup XI and chase the Perfect Run: 8 wins, 0 conceded.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#0A0A0A',
        icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
    };
}
