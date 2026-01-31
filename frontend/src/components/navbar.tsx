"use client";

import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import Image from 'next/image';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLocalizedLink, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LogIn, MenuIcon, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
    const { setTheme, theme, systemTheme } = useTheme()
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();


    function getTheme(): "light" | "dark" {
        return ((theme === 'system' ? systemTheme : theme) ?? 'light') as "light" | "dark";
    }

    const [sheetOpen, setSheetOpen] = useState(false);

    // When not logged in : logo + About link + lang selector + Login/Sign up buttons
    // When logged in : logo + About link + lang selector + Dashboard

    return (
        <section className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className='container mx-auto py-3'>
                <nav className='flex items-center justify-between'>
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 group">
                        <div className='rounded-xl p-2 bg-primary/10 ring-1 ring-primary/20 transition-all group-hover:bg-primary/20 group-hover:ring-primary/40'>
                            <Image
                                src="/logo.svg"
                                className="max-h-8"
                                alt="Logo"
                                width={32}
                                height={32}
                            />
                        </div>

                        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            {t("app_name")}
                        </span>
                    </Link>
                    <NavigationMenu className="hidden lg:block">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLocalizedLink
                                    href="/about"
                                    className={navigationMenuTriggerStyle()}
                                >
                                    {t("about")}
                                </NavigationMenuLocalizedLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                    <div className="hidden items-center gap-4 lg:flex">
                        {getTheme() === "dark" ? (
                            <Sun className="size-5 cursor-pointer" onClick={() => setTheme("light")} color='yellow' />
                        ) : (
                            <Moon className="size-5 cursor-pointer" onClick={() => setTheme("dark")} color='blue' />
                        )}
                        <Switch id="theme-toggle"
                            checked={getTheme() === "dark"}
                            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                            className="hidden lg:inline-flex data-[state=unchecked]:bg-blue-700 data-[state=checked]:bg-yellow-500"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    {locale == "fr" ? "🇫🇷" : "🇺🇸"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-0">
                                <DropdownMenuItem onClick={() => {
                                    router.push(pathname, { locale: locale === "fr" ? "en" : "fr" });
                                }}>
                                    {locale === "fr" ? "🇺🇸" : "🇫🇷"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    router.push(pathname, { locale: locale === "fr" ? "fr" : "en" });
                                }}>
                                    {locale === "fr" ? "🇫🇷" : "🇺🇸"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button asChild className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                            <Link href={"/auth/login"}>
                                <div className='flex flex-row items-center gap-2'>
                                    <LogIn className="size-4" />
                                    <p>{t("login")}</p>
                                </div>
                            </Link>
                        </Button>

                    </div>

                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild className='lg:hidden'>
                            <Button variant="outline">
                                <MenuIcon className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side='top' className='max-h-screen overflow-auto'>
                            <SheetHeader className='flex flex-col'>
                                <SheetTitle>
                                    <Link
                                        href="/"
                                        className='flex items-center gap-2'
                                        onClick={() => setSheetOpen(true)}
                                    >
                                        <div className='rounded-xl p-2 bg-primary/10 ring-1 ring-primary/20'>
                                            <Image
                                                src="/logo.svg"
                                                className="max-h-8"
                                                alt="Logo"
                                                width={32}
                                                height={32}
                                            />
                                        </div>
                                        <span className="text-lg font-semibold tracking-tighter">
                                            {t("app_name")}
                                        </span>
                                    </Link>
                                </SheetTitle>
                            </SheetHeader>
                            <div className='flex flex-col p-4'>
                                <div className="flex justify-end items-center gap-2">
                                    <p>{t("dark_mode")}</p>
                                    <div className="ml-auto flex flex-row gap-2">
                                        {getTheme() === "dark" ? (
                                            <Sun className="size-5 cursor-pointer" onClick={() => setTheme("light")} />
                                        ) : (
                                            <Moon className="size-5 cursor-pointer" onClick={() => setTheme("dark")} />
                                        )}
                                        <Switch id="theme-toggle"
                                            checked={getTheme() === "dark"}
                                            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                            className='data-[state=unchecked]:bg-blue-700 data-[state=checked]:bg-yellow-500'
                                        />
                                    </div>
                                </div>
                                <div className='mt-4'>
                                    <Link
                                        href="/about"
                                        className='font-medium'
                                        onClick={() => setSheetOpen(false)}
                                    >
                                        {t("about")}
                                    </Link>
                                </div>
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="solutions" className="border-none">
                                        <AccordionTrigger className="text-base hover:no-underline">
                                            {t("language")}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex flex-col gap-4">
                                                <Link locale="fr" href={pathname} className="font-medium" onClick={() => setSheetOpen(false)}>
                                                    🇫🇷 FR
                                                </Link>
                                                <Link locale="en" href={pathname} className="font-medium" onClick={() => setSheetOpen(false)}>
                                                    🇺🇸 EN
                                                </Link>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </SheetContent>
                    </Sheet>
                </nav>
            </div>
        </section>
    )
}