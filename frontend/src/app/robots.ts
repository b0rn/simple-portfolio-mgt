import type { MetadataRoute } from 'next';

const BASE_URL = 'https://spa.demos.vleveneur.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/*/app/', '/api/'],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
