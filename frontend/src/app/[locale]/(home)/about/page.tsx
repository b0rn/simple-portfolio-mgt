import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import {
    Briefcase,
    BarChart3,
    DollarSign,
    Monitor,
    ShieldCheck,
    Globe,
    ExternalLink,
    Code,
    Server,
    Container,
} from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);


export default async function Page() {
    const t = await getTranslations("About");

    const features = [
        { icon: <Briefcase className="h-5 w-5" />, text: t("feature_portfolios") },
        { icon: <BarChart3 className="h-5 w-5" />, text: t("feature_assets") },
        { icon: <DollarSign className="h-5 w-5" />, text: t("feature_multi_currency") },
        { icon: <Monitor className="h-5 w-5" />, text: t("feature_responsive") },
        { icon: <ShieldCheck className="h-5 w-5" />, text: t("feature_auth") },
        { icon: <Globe className="h-5 w-5" />, text: t("feature_i18n") },
    ];

    const techStack = [
        {
            icon: <Code className="h-5 w-5" />,
            title: t("tech_frontend_title"),
            desc: t.rich("tech_frontend_desc", {
                bold: (chunks) => <span className="font-semibold">{chunks}</span>,
            }),
        },
        {
            icon: <Server className="h-5 w-5" />,
            title: t("tech_backend_title"),
            desc: t.rich("tech_backend_desc", {
                bold: (chunks) => <span className="font-semibold">{chunks}</span>,
            }),
        },
        {
            icon: <Container className="h-5 w-5" />,
            title: t("tech_infra_title"),
            desc: t.rich("tech_infra_desc", {
                bold: (chunks) => <span className="font-semibold">{chunks}</span>,
            }),
        },
    ];

    return (
        <div className="flex flex-col gap-8 grow items-center py-8 px-4 md:px-8 max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold">{t("title")}</h1>
                <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
            </div>

            {/* Description */}
            <p className="w-full text-justify text-base leading-relaxed">
                {t.rich("description", {
                    bold: (chunks) => <span className="font-bold">{chunks}</span>,
                })}
            </p>

            <Separator />

            {/* Features */}
            <section className="w-full space-y-4">
                <h2 className="text-2xl font-bold">{t("features_title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                            <span className="text-muted-foreground">{feature.icon}</span>
                            <span>{feature.text}</span>
                        </div>
                    ))}
                </div>
            </section>

            <Separator />

            {/* Tech Stack */}
            <section className="w-full space-y-4">
                <h2 className="text-2xl font-bold">{t("tech_title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {techStack.map((tech, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {tech.icon}
                                    {tech.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{tech.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <Separator />

            {/* Open Source */}
            <section className="w-full space-y-4">
                <h2 className="text-2xl font-bold">{t("opensource_title")}</h2>
                <p className="text-muted-foreground">{t("opensource_desc")}</p>
                <a
                    href="https://github.com/b0rn/simple-portfolio-mgt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                >
                    <GithubIcon className="h-4 w-4" />
                    {t("github_link")}
                    <ExternalLink className="h-3 w-3" />
                </a>
                <div className="flex gap-2">
                    <Badge variant="secondary">MIT License</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="secondary">Python</Badge>
                </div>
            </section>

            <Separator />

            {/* Author */}
            <section className="w-full space-y-4">
                <h2 className="text-2xl font-bold">{t("author_title")}</h2>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-semibold">{t("author_name")}</p>
                    <p className="text-muted-foreground">{t("author_desc")}</p>
                    <div className="flex items-center gap-4 pt-2">
                        <a
                            href="https://github.com/b0rn"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm hover:underline"
                        >
                            <GithubIcon className="h-4 w-4" />
                            GitHub
                        </a>
                        <a
                            href="https://www.linkedin.com/in/victorleveneura1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm hover:underline"
                        >
                            <LinkedinIcon className="h-4 w-4" />
                            LinkedIn
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
