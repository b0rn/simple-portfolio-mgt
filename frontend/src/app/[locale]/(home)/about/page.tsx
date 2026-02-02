import { getTranslations } from "next-intl/server";
import AboutContent from "@/components/about-content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    return {
        title: t('about_title'),
        description: t('about_description'),
        alternates: {
            canonical: `/${locale}/about`,
            languages: { en: '/en/about', fr: '/fr/about' },
        },
    };
}

export default async function Page() {
    const t = await getTranslations("About");

    return (
        <AboutContent
            t={{
                title: t("title"),
                subtitle: t("subtitle"),
                description: t("description"),
                demonstrates_title: t("demonstrates_title"),
                demonstrates_subtitle: t("demonstrates_subtitle"),
                demo_fullstack: t("demo_fullstack"),
                demo_fullstack_desc: t("demo_fullstack_desc"),
                demo_polyglot: t("demo_polyglot"),
                demo_polyglot_desc: t("demo_polyglot_desc"),
                demo_architecture: t("demo_architecture"),
                demo_architecture_desc: t("demo_architecture_desc"),
                demo_devops: t("demo_devops"),
                demo_devops_desc: t("demo_devops_desc"),
                demo_security: t("demo_security"),
                demo_security_desc: t("demo_security_desc"),
                demo_quality: t("demo_quality"),
                demo_quality_desc: t("demo_quality_desc"),
                metrics_title: t("metrics_title"),
                metrics_coverage: t("metrics_coverage"),
                metrics_languages: t("metrics_languages"),
                metrics_production: t("metrics_production"),
                metrics_commits: t("metrics_commits"),
                why_title: t("why_title"),
                why_desc: t("why_desc"),
                why_point_1: t("why_point_1"),
                why_point_2: t("why_point_2"),
                why_point_3: t("why_point_3"),
                why_point_4: t("why_point_4"),
                tech_title: t("tech_title"),
                tech_subtitle: t("tech_subtitle"),
                tech_frontend_title: t("tech_frontend_title"),
                tech_frontend_items: t("tech_frontend_items"),
                tech_backend_title: t("tech_backend_title"),
                tech_backend_items: t("tech_backend_items"),
                tech_infra_title: t("tech_infra_title"),
                tech_infra_items: t("tech_infra_items"),
                tech_tools_title: t("tech_tools_title"),
                tech_tools_items: t("tech_tools_items"),
                roadmap_title: t("roadmap_title"),
                roadmap_subtitle: t("roadmap_subtitle"),
                roadmap_go: t("roadmap_go"),
                roadmap_go_status: t("roadmap_go_status"),
                roadmap_nodejs: t("roadmap_nodejs"),
                roadmap_nodejs_status: t("roadmap_nodejs_status"),
                roadmap_redis: t("roadmap_redis"),
                roadmap_redis_status: t("roadmap_redis_status"),
                roadmap_websockets: t("roadmap_websockets"),
                roadmap_websockets_status: t("roadmap_websockets_status"),
                roadmap_java: t("roadmap_java"),
                roadmap_java_status: t("roadmap_java_status"),
                roadmap_php: t("roadmap_php"),
                roadmap_php_status: t("roadmap_php_status"),
                roadmap_ml: t("roadmap_ml"),
                roadmap_ml_status: t("roadmap_ml_status"),
                roadmap_e2e: t("roadmap_e2e"),
                roadmap_e2e_status: t("roadmap_e2e_status"),
                explore_title: t("explore_title"),
                explore_subtitle: t("explore_subtitle"),
                explore_source: t("explore_source"),
                explore_source_desc: t("explore_source_desc"),
                explore_api: t("explore_api"),
                explore_api_desc: t("explore_api_desc"),
                explore_architecture: t("explore_architecture"),
                explore_architecture_desc: t("explore_architecture_desc"),
                explore_live: t("explore_live"),
                explore_live_desc: t("explore_live_desc"),
                opensource_title: t("opensource_title"),
                opensource_desc: t("opensource_desc"),
                github_link: t("github_link"),
                author_title: t("author_title"),
                author_name: t("author_name"),
                author_role: t("author_role"),
                author_education: t("author_education"),
                author_experience: t("author_experience"),
                author_desc: t("author_desc"),
            }}
        />
    );
}
