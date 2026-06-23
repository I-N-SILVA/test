import type { MetadataRoute } from 'next';

const SITE_URL = 'https://test-mauve-three-70.vercel.app';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: '*', allow: '/' },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
