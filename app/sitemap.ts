import type { MetadataRoute } from 'next';

const SITE_URL = 'https://test-mauve-three-70.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return [
        { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
        { url: `${SITE_URL}/game`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ];
}
