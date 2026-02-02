import type { MetadataRoute } from 'next';

const BASE_URL = 'https://spa.demos.vleveneur.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const locales = ['en', 'fr'];
    const routes = ['', '/about'];

    return locales.flatMap((locale) =>
        routes.map((route) => ({
            url: `${BASE_URL}/${locale}${route}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: route === '' ? 1.0 : 0.8,
            alternates: {
                languages: Object.fromEntries(
                    locales.map((l) => [l, `${BASE_URL}/${l}${route}`])
                ),
            },
        }))
    );
}
