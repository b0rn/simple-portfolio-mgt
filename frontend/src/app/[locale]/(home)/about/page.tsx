import { getTranslations } from "next-intl/server";
import AboutContent from "@/components/about-content";

export default async function Page() {
    const t = await getTranslations("About");

    return (
        <AboutContent
            t={{
                title: t("title"),
                subtitle: t("subtitle"),
                description: t("description"),
                features_title: t("features_title"),
                features_subtitle: t("features_subtitle"),
                feature_portfolios: t("feature_portfolios"),
                feature_portfolios_desc: t("feature_portfolios_desc"),
                feature_assets: t("feature_assets"),
                feature_assets_desc: t("feature_assets_desc"),
                feature_multi_currency: t("feature_multi_currency"),
                feature_multi_currency_desc: t("feature_multi_currency_desc"),
                feature_responsive: t("feature_responsive"),
                feature_responsive_desc: t("feature_responsive_desc"),
                feature_auth: t("feature_auth"),
                feature_auth_desc: t("feature_auth_desc"),
                feature_i18n: t("feature_i18n"),
                feature_i18n_desc: t("feature_i18n_desc"),
                tech_title: t("tech_title"),
                tech_subtitle: t("tech_subtitle"),
                tech_frontend_title: t("tech_frontend_title"),
                tech_frontend_desc: t("tech_frontend_desc"),
                tech_backend_title: t("tech_backend_title"),
                tech_backend_desc: t("tech_backend_desc"),
                tech_infra_title: t("tech_infra_title"),
                tech_infra_desc: t("tech_infra_desc"),
                opensource_title: t("opensource_title"),
                opensource_desc: t("opensource_desc"),
                github_link: t("github_link"),
                author_title: t("author_title"),
                author_name: t("author_name"),
                author_desc: t("author_desc"),
            }}
        />
    );
}
