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
    'rgba(34, 197, 94, 0.2)',
    'rgba(59, 130, 246, 0.2)',
    'rgba(168, 85, 247, 0.2)',
    'rgba(234, 179, 8, 0.2)',
    'rgba(99, 102, 241, 0.2)',
    'rgba(236, 72, 153, 0.2)',
  ];

  return (
    <div className="flex flex-col grow">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center gap-6 py-24 md:py-40 text-center px-4 overflow-hidden min-h-[80vh]">
        <div className="absolute inset-0 -z-10 opacity-40">
          <Aurora
            colorStops={['#22c55e', '#3b82f6', '#22c55e']}
            amplitude={1.2}
            blend={0.6}
            speed={0.5}
          />
        </div>

        <BlurText
          text={t.subtitle}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl justify-center"
          delay={100}
          animateBy="words"
          direction="bottom"
        />

        <BlurText
          text={t.description}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl justify-center"
          delay={50}
          animateBy="words"
          direction="bottom"
          stepDuration={0.3}
        />

        <div className="flex flex-row gap-4 mt-6">
          <StarBorder
            as={Link}
            href="/auth/signup"
            color="hsl(142, 71%, 45%)"
            speed="5s"
            className="text-lg font-semibold"
          >
            {t.sign_up}
          </StarBorder>
          <StarBorder
            as={Link}
            href="/auth/login"
            color="hsl(217, 91%, 60%)"
            speed="7s"
            className="text-lg font-semibold"
          >
            {t.login}
          </StarBorder>
        </div>
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
            {features.map((feature, i) => (
              <SpotlightCard
                key={feature.title}
                spotlightColor={spotlightColors[i]}
                className="transition-transform duration-300 hover:-translate-y-1"
              >
                <feature.icon className="size-10 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {feature.desc}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-25 rotate-180">
          <Aurora
            colorStops={['#a855f7', '#3b82f6', '#22c55e']}
            amplitude={0.8}
            blend={0.7}
            speed={0.3}
          />
        </div>
        <div className="container mx-auto max-w-2xl text-center flex flex-col items-center gap-6">
          <BlurText
            text={t.cta_title}
            className="text-3xl md:text-4xl font-bold tracking-tight justify-center"
            delay={80}
            animateBy="words"
            direction="bottom"
          />
          <p className="text-lg text-muted-foreground">
            {t.cta_description}
          </p>
          <div className="flex flex-row gap-4">
            <StarBorder
              as={Link}
              href="/auth/signup"
              color="hsl(142, 71%, 45%)"
              speed="5s"
              className="text-lg font-semibold"
            >
              {t.cta_sign_up}
            </StarBorder>
            <StarBorder
              as={Link}
              href="/auth/login"
              color="hsl(217, 91%, 60%)"
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
