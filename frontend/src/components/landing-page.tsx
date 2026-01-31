'use client';

import { Link } from '@/i18n/navigation';
import { Briefcase, BarChart3, ShieldCheck, Globe, Smartphone, TrendingUp } from 'lucide-react';
import Aurora from '@/components/reactbits/Aurora';
import BlurText from '@/components/reactbits/BlurText';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import StarBorder from '@/components/reactbits/StarBorder';

interface LandingPageProps {
  t: {
    subtitle: string;
    description: string;
    sign_up: string;
    login: string;
    features_title: string;
    features_subtitle: string;
    feature_portfolios_title: string;
    feature_portfolios_desc: string;
    feature_assets_title: string;
    feature_assets_desc: string;
    feature_valuation_title: string;
    feature_valuation_desc: string;
    feature_secure_title: string;
    feature_secure_desc: string;
    feature_i18n_title: string;
    feature_i18n_desc: string;
    feature_responsive_title: string;
    feature_responsive_desc: string;
    cta_title: string;
    cta_description: string;
    cta_sign_up: string;
    cta_login: string;
  };
}

const icons = [Briefcase, TrendingUp, BarChart3, ShieldCheck, Globe, Smartphone];

export default function LandingPage({ t }: LandingPageProps) {
  const features = [
    { icon: icons[0], title: t.feature_portfolios_title, desc: t.feature_portfolios_desc },
    { icon: icons[1], title: t.feature_assets_title, desc: t.feature_assets_desc },
    { icon: icons[2], title: t.feature_valuation_title, desc: t.feature_valuation_desc },
    { icon: icons[3], title: t.feature_secure_title, desc: t.feature_secure_desc },
    { icon: icons[4], title: t.feature_i18n_title, desc: t.feature_i18n_desc },
    { icon: icons[5], title: t.feature_responsive_title, desc: t.feature_responsive_desc },
  ];

  const spotlightColors: string[] = [
    'rgba(234, 179, 8, 0.20)',
    'rgba(168, 85, 247, 0.18)',
    'rgba(245, 158, 11, 0.20)',
    'rgba(139, 92, 246, 0.18)',
    'rgba(251, 191, 36, 0.20)',
    'rgba(192, 132, 252, 0.18)',
  ];

  return (
    <div className="flex flex-col grow">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center gap-8 py-28 md:py-44 text-center px-4 overflow-hidden min-h-[85vh]">
        <div className="absolute inset-0 -z-10 opacity-50">
          <Aurora
            colorStops={['#f59e0b', '#8b5cf6', '#f59e0b']}
            amplitude={1.4}
            blend={0.5}
            speed={0.4}
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/60 via-transparent to-background/80" />

        <BlurText
          text={t.subtitle}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl justify-center leading-tight"
          delay={100}
          animateBy="words"
          direction="bottom"
        />

        <BlurText
          text={t.description}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl justify-center leading-relaxed"
          delay={50}
          animateBy="words"
          direction="bottom"
          stepDuration={0.3}
        />

        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <StarBorder
            as={Link}
            href="/auth/signup"
            color="hsl(43, 96%, 56%)"
            speed="5s"
            className="text-lg font-semibold"
          >
            {t.sign_up}
          </StarBorder>
          <StarBorder
            as={Link}
            href="/auth/login"
            color="hsl(270, 80%, 65%)"
            speed="7s"
            className="text-lg font-semibold"
          >
            {t.login}
          </StarBorder>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <BlurText
              text={t.features_title}
              className="text-3xl md:text-5xl font-extrabold tracking-tight justify-center"
              delay={80}
              animateBy="words"
              direction="bottom"
            />
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
              {t.features_subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <SpotlightCard
                key={feature.title}
                spotlightColor={spotlightColors[i]}
                className="transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
              >
                <div className="rounded-xl bg-primary/10 p-3 w-fit mb-4">
                  <feature.icon className="size-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {feature.desc}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30 rotate-180">
          <Aurora
            colorStops={['#8b5cf6', '#f59e0b', '#8b5cf6']}
            amplitude={1.0}
            blend={0.6}
            speed={0.3}
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background/70 via-transparent to-background/70" />
        <div className="container mx-auto max-w-2xl text-center flex flex-col items-center gap-8">
          <BlurText
            text={t.cta_title}
            className="text-3xl md:text-5xl font-extrabold tracking-tight justify-center"
            delay={80}
            animateBy="words"
            direction="bottom"
          />
          <p className="text-lg text-muted-foreground max-w-xl">
            {t.cta_description}
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <StarBorder
              as={Link}
              href="/auth/signup"
              color="hsl(43, 96%, 56%)"
              speed="5s"
              className="text-lg font-semibold"
            >
              {t.cta_sign_up}
            </StarBorder>
            <StarBorder
              as={Link}
              href="/auth/login"
              color="hsl(270, 80%, 65%)"
              speed="7s"
              className="text-lg font-semibold"
            >
              {t.cta_login}
            </StarBorder>
          </div>
        </div>
      </section>
    </div>
  );
}
