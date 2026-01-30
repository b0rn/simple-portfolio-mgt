"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { registerUnauthorizedHandler } from "@/lib/auth/events";
export function AuthGard({ children } : { children : React.ReactNode }) {
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const router = useRouter();
    const redirectingRef = useRef(false);

    useEffect(() => {
        redirectingRef.current = false;
    }, [pathname]);

    useEffect(() => {
        const unregister = registerUnauthorizedHandler(() => {
            if (redirectingRef.current || pathname === "/auth/login") {
                return;
            }
            redirectingRef.current = true;
            queryClient.invalidateQueries({ queryKey : ["me"] });
            router.replace("/auth/login");
        })
        return unregister;
    }, [queryClient, pathname, router])

    
    return <>{children}</>;
}