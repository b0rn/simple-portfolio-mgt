'use client';

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
} from 'lucide-react';
import Aurora from '@/components/reactbits/Aurora';
import BlurText from '@/components/reactbits/BlurText';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import StarBorder from '@/components/reactbits/StarBorder';
import { Badge } from '@/components/ui/badge';

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

interface AboutContentProps {
    t: {
        title: string;
        subtitle: string;
        description: string;
        features_title: string;
        features_subtitle: string;
        feature_portfolios: string;
        feature_portfolios_desc: string;
        feature_assets: string;
        feature_assets_desc: string;
        feature_multi_currency: string;
        feature_multi_currency_desc: string;
        feature_responsive: string;
        feature_responsive_desc: string;
        feature_auth: string;
        feature_auth_desc: string;
        feature_i18n: string;
        feature_i18n_desc: string;
        tech_title: string;
        tech_subtitle: string;
        tech_frontend_title: string;
        tech_frontend_desc: string;
        tech_backend_title: string;
        tech_backend_desc: string;
        tech_infra_title: string;
        tech_infra_desc: string;
        opensource_title: string;
        opensource_desc: string;
        github_link: string;
        author_title: string;
        author_name: string;
        author_desc: string;
    };
}

const featureIcons = [Briefcase, BarChart3, DollarSign, Monitor, ShieldCheck, Globe];

const spotlightColors = [
    'rgba(34, 197, 94, 0.2)',
    'rgba(59, 130, 246, 0.2)',
    'rgba(234, 179, 8, 0.2)',
    'rgba(168, 85, 247, 0.2)',
    'rgba(239, 68, 68, 0.2)',
    'rgba(99, 102, 241, 0.2)',
];

const techIcons = [Code, Server, Container];
const techSpotlightColors = [
    'rgba(59, 130, 246, 0.25)',
    'rgba(34, 197, 94, 0.25)',
    'rgba(168, 85, 247, 0.25)',
];

export default function AboutContent({ t }: AboutContentProps) {
    const features = [
        { title: t.feature_portfolios, desc: t.feature_portfolios_desc },
        { title: t.feature_assets, desc: t.feature_assets_desc },
        { title: t.feature_multi_currency, desc: t.feature_multi_currency_desc },
        { title: t.feature_responsive, desc: t.feature_responsive_desc },
        { title: t.feature_auth, desc: t.feature_auth_desc },
        { title: t.feature_i18n, desc: t.feature_i18n_desc },
    ];

    const techStack = [
        { title: t.tech_frontend_title, desc: t.tech_frontend_desc },
        { title: t.tech_backend_title, desc: t.tech_backend_desc },
        { title: t.tech_infra_title, desc: t.tech_infra_desc },
    ];

    return (
        <div className="flex flex-col grow">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center gap-6 py-24 md:py-36 text-center px-4 overflow-hidden min-h-[60vh]">
                <div className="absolute inset-0 -z-10 opacity-30">
                    <Aurora
                        colorStops={['#3b82f6', '#a855f7', '#3b82f6']}
                        amplitude={1.0}
                        blend={0.7}
                        speed={0.4}
                    />
                </div>

                <BlurText
                    text={t.title}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl justify-center"
                    delay={100}
                    animateBy="words"
                    direction="bottom"
                />

                <BlurText
                    text={t.subtitle}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl justify-center"
                    delay={50}
                    animateBy="words"
                    direction="bottom"
                    stepDuration={0.3}
                />

                <p className="text-base text-muted-foreground max-w-2xl leading-relaxed mt-2">
                    {t.description}
                </p>
            </section>

            {/* Features */}
            <section className="py-20 md:py-28 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-14">
                        <BlurText
                            text={t.features_title}
                            className="text-3xl md:text-4xl font-bold tracking-tight justify-center"
                            delay={80}
                            animateBy="words"
                            direction="bottom"
                        />
                        <p className="text-muted-foreground mt-3 text-lg">
                            {t.features_subtitle}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feature, i) => {
                            const Icon = featureIcons[i];
                            return (
                                <SpotlightCard
                                    key={feature.title}
                                    spotlightColor={spotlightColors[i]}
                                    className="transition-transform duration-300 hover:-translate-y-1"
                                >
                                    <Icon className="size-10 text-primary mb-3" />
                                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground text-base leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </SpotlightCard>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-20 md:py-28 px-4 bg-muted/30">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-14">
                        <BlurText
                            text={t.tech_title}
                            className="text-3xl md:text-4xl font-bold tracking-tight justify-center"
                            delay={80}
                            animateBy="words"
                            direction="bottom"
                        />
                        <p className="text-muted-foreground mt-3 text-lg">
                            {t.tech_subtitle}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {techStack.map((tech, i) => {
                            const Icon = techIcons[i];
                            return (
                                <SpotlightCard
                                    key={tech.title}
                                    spotlightColor={techSpotlightColors[i]}
                                    className="transition-transform duration-300 hover:-translate-y-1"
                                >
                                    <Icon className="size-10 text-primary mb-4" />
                                    <h3 className="text-xl font-semibold mb-3">{tech.title}</h3>
                                    <p className="text-muted-foreground text-base leading-relaxed">
                                        {tech.desc}
                                    </p>
                                </SpotlightCard>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Open Source + Author */}
            <section className="relative py-20 md:py-28 px-4 overflow-hidden">
                <div className="absolute inset-0 -z-10 opacity-20 rotate-180">
                    <Aurora
                        colorStops={['#a855f7', '#3b82f6', '#22c55e']}
                        amplitude={0.8}
                        blend={0.7}
                        speed={0.3}
                    />
                </div>
                <div className="container mx-auto max-w-3xl text-center flex flex-col items-center gap-8">
                    <BlurText
                        text={t.opensource_title}
                        className="text-3xl md:text-4xl font-bold tracking-tight justify-center"
                        delay={80}
                        animateBy="words"
                        direction="bottom"
                    />
                    <p className="text-lg text-muted-foreground max-w-xl">
                        {t.opensource_desc}
                    </p>
                    <div className="flex gap-3 flex-wrap justify-center">
                        <Badge variant="secondary" className="text-sm px-3 py-1">MIT License</Badge>
                        <Badge variant="secondary" className="text-sm px-3 py-1">TypeScript</Badge>
                        <Badge variant="secondary" className="text-sm px-3 py-1">Python</Badge>
                        <Badge variant="secondary" className="text-sm px-3 py-1">Next.js</Badge>
                        <Badge variant="secondary" className="text-sm px-3 py-1">FastAPI</Badge>
                    </div>
                    <StarBorder
                        as="a"
                        href="https://github.com/b0rn/simple-portfolio-mgt"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="hsl(142, 71%, 45%)"
                        speed="5s"
                        className="text-lg font-semibold inline-flex items-center gap-2"
                    >
                        <GithubIcon className="h-5 w-5" />
                        {t.github_link}
                        <ExternalLink className="h-4 w-4" />
                    </StarBorder>

                    {/* Author */}
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <h3 className="text-2xl font-bold">{t.author_title}</h3>
                        <p className="text-xl font-semibold">{t.author_name}</p>
                        <p className="text-muted-foreground max-w-md">{t.author_desc}</p>
                        <div className="flex items-center gap-6 mt-2">
                            <a
                                href="https://github.com/b0rn"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                            >
                                <GithubIcon className="h-5 w-5" />
                                GitHub
                            </a>
                            <a
                                href="https://www.linkedin.com/in/victorleveneura1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                            >
                                <LinkedinIcon className="h-5 w-5" />
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
