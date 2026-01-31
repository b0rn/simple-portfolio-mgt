'use client';

import {
    Code,
    Server,
    Container,
    ExternalLink,
    Layers,
    Languages,
    Shield,
    CheckCircle2,
    Wrench,
    BookOpen,
    FileCode2,
    Globe,
    ArrowRight,
} from 'lucide-react';
import Aurora from '@/components/reactbits/Aurora';
import BlurText from '@/components/reactbits/BlurText';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import StarBorder from '@/components/reactbits/StarBorder';
import CountUp from '@/components/reactbits/CountUp';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

export interface AboutContentProps {
    t: {
        title: string;
        subtitle: string;
        description: string;
        demonstrates_title: string;
        demonstrates_subtitle: string;
        demo_fullstack: string;
        demo_fullstack_desc: string;
        demo_polyglot: string;
        demo_polyglot_desc: string;
        demo_architecture: string;
        demo_architecture_desc: string;
        demo_devops: string;
        demo_devops_desc: string;
        demo_security: string;
        demo_security_desc: string;
        demo_quality: string;
        demo_quality_desc: string;
        metrics_title: string;
        metrics_coverage: string;
        metrics_languages: string;
        metrics_production: string;
        metrics_commits: string;
        why_title: string;
        why_desc: string;
        why_point_1: string;
        why_point_2: string;
        why_point_3: string;
        why_point_4: string;
        tech_title: string;
        tech_subtitle: string;
        tech_frontend_title: string;
        tech_frontend_items: string;
        tech_backend_title: string;
        tech_backend_items: string;
        tech_infra_title: string;
        tech_infra_items: string;
        tech_tools_title: string;
        tech_tools_items: string;
        roadmap_title: string;
        roadmap_subtitle: string;
        roadmap_go: string;
        roadmap_go_status: string;
        roadmap_nodejs: string;
        roadmap_nodejs_status: string;
        roadmap_redis: string;
        roadmap_redis_status: string;
        roadmap_websockets: string;
        roadmap_websockets_status: string;
        roadmap_java: string;
        roadmap_java_status: string;
        roadmap_php: string;
        roadmap_php_status: string;
        roadmap_ml: string;
        roadmap_ml_status: string;
        roadmap_e2e: string;
        roadmap_e2e_status: string;
        explore_title: string;
        explore_subtitle: string;
        explore_source: string;
        explore_source_desc: string;
        explore_api: string;
        explore_api_desc: string;
        explore_architecture: string;
        explore_architecture_desc: string;
        explore_live: string;
        explore_live_desc: string;
        opensource_title: string;
        opensource_desc: string;
        github_link: string;
        author_title: string;
        author_name: string;
        author_role: string;
        author_education: string;
        author_experience: string;
        author_desc: string;
    };
}

const statusIcon = (status: string) => {
    if (status === 'in_progress') return '🚧';
    if (status === 'planned') return '📋';
    return '✅';
};

const statusLabel = (status: string) => {
    if (status === 'in_progress') return 'In Progress';
    if (status === 'planned') return 'Planned';
    return 'Complete';
};

export default function AboutContent({ t }: AboutContentProps) {
    const demonstrates = [
        { title: t.demo_fullstack, desc: t.demo_fullstack_desc, icon: Code, color: 'rgba(59, 130, 246, 0.2)' },
        { title: t.demo_polyglot, desc: t.demo_polyglot_desc, icon: Languages, color: 'rgba(168, 85, 247, 0.2)' },
        { title: t.demo_architecture, desc: t.demo_architecture_desc, icon: Layers, color: 'rgba(34, 197, 94, 0.2)' },
        { title: t.demo_devops, desc: t.demo_devops_desc, icon: Container, color: 'rgba(234, 179, 8, 0.2)' },
        { title: t.demo_security, desc: t.demo_security_desc, icon: Shield, color: 'rgba(239, 68, 68, 0.2)' },
        { title: t.demo_quality, desc: t.demo_quality_desc, icon: CheckCircle2, color: 'rgba(99, 102, 241, 0.2)' },
    ];

    const techStack = [
        { title: t.tech_frontend_title, items: t.tech_frontend_items, icon: Code, color: 'rgba(59, 130, 246, 0.25)' },
        { title: t.tech_backend_title, items: t.tech_backend_items, icon: Server, color: 'rgba(34, 197, 94, 0.25)' },
        { title: t.tech_infra_title, items: t.tech_infra_items, icon: Container, color: 'rgba(168, 85, 247, 0.25)' },
        { title: t.tech_tools_title, items: t.tech_tools_items, icon: Wrench, color: 'rgba(234, 179, 8, 0.25)' },
    ];

    const roadmap = [
        { label: t.roadmap_go, status: t.roadmap_go_status },
        { label: t.roadmap_nodejs, status: t.roadmap_nodejs_status },
        { label: t.roadmap_redis, status: t.roadmap_redis_status },
        { label: t.roadmap_websockets, status: t.roadmap_websockets_status },
        { label: t.roadmap_java, status: t.roadmap_java_status },
        { label: t.roadmap_php, status: t.roadmap_php_status },
        { label: t.roadmap_ml, status: t.roadmap_ml_status },
        { label: t.roadmap_e2e, status: t.roadmap_e2e_status },
    ];

    const exploreLinks = [
        { title: t.explore_source, desc: t.explore_source_desc, icon: FileCode2, href: 'https://github.com/b0rn/simple-portfolio-mgt' },
        { title: t.explore_api, desc: t.explore_api_desc, icon: BookOpen, href: 'https://b0rn.github.io/simple-portfolio-mgt/api/' },
        { title: t.explore_architecture, desc: t.explore_architecture_desc, icon: Layers, href: 'https://github.com/b0rn/simple-portfolio-mgt/blob/main/docs/ARCHITECTURE.md' },
        { title: t.explore_live, desc: t.explore_live_desc, icon: Globe, href: 'https://spa.chronolobe.app' },
    ];

    const whyPoints = [t.why_point_1, t.why_point_2, t.why_point_3, t.why_point_4];

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

            {/* What This Demonstrates */}
            <section className="py-20 md:py-28 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-14">
                        <BlurText
                            text={t.demonstrates_title}
                            className="text-3xl md:text-4xl font-bold tracking-tight justify-center"
                            delay={80}
                            animateBy="words"
                            direction="bottom"
                        />
                        <p className="text-muted-foreground mt-3 text-lg">
                            {t.demonstrates_subtitle}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {demonstrates.map((item) => {
                            const Icon = item.icon;
                            return (
                                <SpotlightCard
                                    key={item.title}
                                    spotlightColor={item.color}
                                    className="transition-transform duration-300 hover:-translate-y-1"
                                >
                                    <Icon className="size-10 text-primary mb-3" />
                                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground text-base leading-relaxed">
                                        {item.desc}
                                    </p>
                                </SpotlightCard>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Technical Metrics */}
            <section className="py-16 md:py-20 px-4 bg-muted/30">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-12">
                        <BlurText
                            text={t.metrics_title}
                            className="text-3xl md:text-4xl font-bold tracking-tight justify-center"
                            delay={80}
                            animateBy="words"
                            direction="bottom"
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex flex-col items-center gap-2 p-6 rounded-xl bg-background/60 border">
                            <span className="text-4xl md:text-5xl font-bold text-primary">
                                <CountUp to={85} duration={2} />%+
                            </span>
                            <span className="text-sm text-muted-foreground text-center">{t.metrics_coverage}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-6 rounded-xl bg-background/60 border">
                            <span className="text-4xl md:text-5xl font-bold text-primary">
                                <CountUp to={5} duration={1.5} />
                            </span>
                            <span className="text-sm text-muted-foreground text-center">{t.metrics_languages}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-6 rounded-xl bg-background/60 border">
                            <span className="text-4xl md:text-5xl font-bold text-primary">
                                100%
                            </span>
                            <span className="text-sm text-muted-foreground text-center">{t.metrics_production}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-6 rounded-xl bg-background/60 border">
                            <span className="text-4xl md:text-5xl font-bold text-primary">
                                <CountUp to={104} duration={2} />+
                            </span>
                            <span className="text-sm text-muted-foreground text-center">{t.metrics_commits}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why I Built This */}
            <section className="py-20 md:py-28 px-4">
                <div className="container mx-auto max-w-3xl">
                    <div className="text-center mb-10">
                        <BlurText
                            text={t.why_title}
                            className="text-3xl md:text-4xl font-bold tracking-tight justify-center"
                            delay={80}
                            animateBy="words"
                            direction="bottom"
                        />
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                        {t.why_desc}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {whyPoints.map((point) => (
                            <div key={point} className="flex items-start gap-3 p-4 rounded-lg border bg-background/60">
                                <ArrowRight className="size-5 text-primary mt-0.5 shrink-0" />
                                <span className="text-sm leading-relaxed">{point}</span>
                            </div>
                        ))}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {techStack.map((tech) => {
                            const Icon = tech.icon;
                            return (
                                <SpotlightCard
                                    key={tech.title}
                                    spotlightColor={tech.color}
                                    className="transition-transform duration-300 hover:-translate-y-1"
                                >
                                    <Icon className="size-10 text-primary mb-4" />
                                    <h3 className="text-xl font-semibold mb-3">{tech.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tech.items.split(', ').map((item) => (
                                            <Badge key={item} variant="secondary" className="text-xs">
                                                {item}
                                            </Badge>
                                        ))}
                                    </div>
                                </SpotlightCard>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Roadmap */}
            <section className="py-20 md:py-28 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-14">
                        <BlurText
                            text={t.roadmap_title}
                            className="text-3xl md:text-4xl font-bold tracking-tight justify-center"
                            delay={80}
                            animateBy="words"
                            direction="bottom"
                        />
                        <p className="text-muted-foreground mt-3 text-lg">
                            {t.roadmap_subtitle}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {roadmap.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-3 p-4 rounded-lg border bg-background/60"
                            >
                                <span className="text-xl" role="img" aria-label={statusLabel(item.status)}>
                                    {statusIcon(item.status)}
                                </span>
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Explore The Code */}
            <section className="py-20 md:py-28 px-4 bg-muted/30">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-14">
                        <BlurText
                            text={t.explore_title}
                            className="text-3xl md:text-4xl font-bold tracking-tight justify-center"
                            delay={80}
                            animateBy="words"
                            direction="bottom"
                        />
                        <p className="text-muted-foreground mt-3 text-lg">
                            {t.explore_subtitle}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {exploreLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <a
                                    key={link.title}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col items-center gap-3 p-6 rounded-xl border bg-background/60 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 text-center"
                                >
                                    <Icon className="size-8 text-primary" />
                                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                                        {link.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">{link.desc}</p>
                                    <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </a>
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
                        <Badge variant="secondary" className="text-sm px-3 py-1">Go</Badge>
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

                    <Separator className="my-4 max-w-md" />

                    {/* Author */}
                    <div className="flex flex-col items-center gap-4">
                        <h3 className="text-2xl font-bold">{t.author_title}</h3>
                        <p className="text-xl font-semibold">{t.author_name}</p>
                        <p className="text-primary font-medium">{t.author_role}</p>
                        <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
                            <a
                                href="https://formations.univ-grenoble-alpes.fr/fr/catalogue-2021/master-XB/master-informatique-IAQK9B8Z/parcours-cybersecurite-et-informatique-legale-2e-annee-IZ9WIUT6.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors underline underline-offset-2"
                            >
                                {t.author_education}
                            </a>
                            <span className="hidden sm:inline">|</span>
                            <span>{t.author_experience}</span>
                        </div>
                        <p className="text-muted-foreground max-w-md leading-relaxed">
                            {t.author_desc}
                        </p>
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
