"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { registerUnauthorizedHandler } from "@/lib/auth/events";
import { useLocale } from "next-intl";

export function AuthGard({ children } : { children : React.ReactNode }) {
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const locale = useLocale();
    const router = useRouter();
    
    useEffect(() => {
        registerUnauthorizedHandler(() => {
            queryClient.invalidateQueries({ queryKey : ["me"] });
            if(pathname !== "/auth/login" ) {
                router.replace("/auth/login");
            }
        })
    }, [queryClient, pathname, locale])

    
    return <>{children}</>;
}