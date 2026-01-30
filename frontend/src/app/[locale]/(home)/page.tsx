import LandingPage from '@/components/landing-page';
import { getTranslations } from 'next-intl/server';

export default async function Page() {
    const t = await getTranslations("HomePage");

    const translations = {
        subtitle: t("subtitle"),
        description: t("description"),
        sign_up: t("sign_up"),
        login: t("login"),
        features_title: t("features_title"),
        features_subtitle: t("features_subtitle"),
        feature_portfolios_title: t("feature_portfolios_title"),
        feature_portfolios_desc: t("feature_portfolios_desc"),
        feature_assets_title: t("feature_assets_title"),
        feature_assets_desc: t("feature_assets_desc"),
        feature_valuation_title: t("feature_valuation_title"),
        feature_valuation_desc: t("feature_valuation_desc"),
        feature_secure_title: t("feature_secure_title"),
        feature_secure_desc: t("feature_secure_desc"),
        feature_i18n_title: t("feature_i18n_title"),
        feature_i18n_desc: t("feature_i18n_desc"),
        feature_responsive_title: t("feature_responsive_title"),
        feature_responsive_desc: t("feature_responsive_desc"),
        cta_title: t("cta_title"),
        cta_description: t("cta_description"),
        cta_sign_up: t("cta_sign_up"),
        cta_login: t("cta_login"),
    };

    return <LandingPage t={translations} />;
}
