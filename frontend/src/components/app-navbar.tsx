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
import { LogOut, MenuIcon, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useApiClient } from './api-client-provider';
import { useMe } from '@/lib/api/helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function AppNavbar() {
    const { setTheme, theme, systemTheme } = useTheme();
    const t = useTranslations('Navbar');
    const client = useApiClient();
    const queryClient = useQueryClient();
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();


    function getTheme(): "light" | "dark" {
        return ((theme === 'system' ? systemTheme : theme) ?? 'light') as "light" | "dark";
    }

    const [sheetOpen, setSheetOpen] = useState(false);

    const meQuery = useMe(client);
    const logoutMutation = useMutation({
        mutationFn: () => client.POST("/auth/logout"),
        onSuccess: ({ data, response, error }) => {
            if (response.status === 200) {
                queryClient.removeQueries({
                    queryKey: ["me"]
                });
                router.replace("/")
            }
        }
    })

    return (
        <section className="py-4">
            <div className='container mx-auto'>
                <nav className='flex items-center justify-between'>
                    <Link
                        href="/"
                        className="flex items-center gap-2">
                        <div className='rounded-full p-2 bg-gray-500'>
                            <Image
                                src="/vercel.svg"
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
                    <NavigationMenu className="hidden lg:block">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLocalizedLink
                                    href="/app/portfolios"
                                    className={pathname === "/app/portfolios" ? "bg-secondary text-secondary-foreground" : ""}
                                >
                                    {t("portfolios")}
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
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Avatar>
                                    <AvatarFallback>{meQuery.data?.data?.user.email.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => {
                                    logoutMutation.mutate();
                                }}>
                                    <div className='flex flex-row items-center gap-2'>
                                        <LogOut />
                                        <p>{t("logout")}</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                        <div className='rounded-full p-2 bg-gray-500'>
                                            <Image
                                                src="/vercel.svg"
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
                                            <Sun className="size-5 cursor-pointer" onClick={() => setTheme("light")} color='yellow' />
                                        ) : (
                                            <Moon className="size-5 cursor-pointer" onClick={() => setTheme("dark")} color='blue' />
                                        )}
                                        <Switch id="theme-toggle"
                                            checked={getTheme() === "dark"}
                                            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                            className='data-[state=unchecked]:bg-blue-700 data-[state=checked]:bg-yellow-500'
                                        />
                                    </div>
                                </div>
                                <div className='mt-4 flex flex-col gap-2'>
                                    <Link
                                        href="/app/portfolios"
                                        className='font-medium'
                                        onClick={() => setSheetOpen(false)}
                                    >
                                        {t("portfolios")}
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
                                <Button variant="destructive" onClick={() => logoutMutation.mutate()}>
                                    {t("logout")}
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </nav>
            </div>
        </section>
    )
}