import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/components/theme-provider";
import { ApiClientProvider } from "@/components/api-client-provider";
import { ReactQueryProvider } from "@/components/react-query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return notFound();
  }

  return (
    <html lang={locale} className={inter.className} suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
      >
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReactQueryProvider>
              <ApiClientProvider>
                <div className="container mx-auto px-4 md:px-0">
                  {children}
                </div>
              </ApiClientProvider>
            </ReactQueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
